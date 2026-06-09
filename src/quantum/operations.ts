import { QuantumState } from './state';
import { QuantumGate } from '../types/quantum';

/** Source of uniform randoms in [0, 1). Injectable so runs can be seeded. */
export type RandomSource = () => number;

export class QuantumOperations {

  // Apply a single-qubit gate to a specific qubit
  static applySingleQubitGate(state: QuantumState, gate: QuantumGate, targetQubit: number): QuantumState {
    if (gate.qubits !== 1) {
      throw new Error('Gate must be a single-qubit gate');
    }
    return this.applyGate(state, gate, [targetQubit]);
  }

  // Apply a two-qubit gate (like CNOT). For controlled gates the first qubit
  // listed is the control and the second the target.
  static applyTwoQubitGate(state: QuantumState, gate: QuantumGate, controlQubit: number, targetQubit: number): QuantumState {
    if (gate.qubits !== 2) {
      throw new Error('Gate must be a two-qubit gate');
    }
    if (controlQubit === targetQubit) {
      throw new Error('Control and target qubits must be different');
    }
    return this.applyGate(state, gate, [controlQubit, targetQubit]);
  }

  /**
   * Apply an arbitrary k-qubit unitary to the listed qubits.
   *
   * The first listed qubit corresponds to the most significant bit of the
   * gate-matrix index (so for CNOT, targetQubits = [control, target]).
   *
   * Cost is O(2^n · 2^k): for each of the 2^(n-k) base indices we gather the
   * 2^k amplitudes spanned by the target qubits, multiply by the gate matrix,
   * and scatter the results.
   */
  static applyGate(state: QuantumState, gate: QuantumGate, targetQubits: number[]): QuantumState {
    if (targetQubits.length !== gate.qubits) {
      throw new Error(`Gate requires ${gate.qubits} target qubits, but ${targetQubits.length} provided`);
    }

    const numQubits = state.getNumQubits();
    for (const q of targetQubits) {
      if (q < 0 || q >= numQubits) {
        throw new Error('Qubit indices out of range');
      }
    }
    if (new Set(targetQubits).size !== targetQubits.length) {
      throw new Error('Target qubits must be distinct');
    }

    const k = gate.qubits;
    const dim = 1 << numQubits;
    const dimK = 1 << k;

    // Unbox the gate matrix once, outside the hot loop.
    const mre: number[][] = [];
    const mim: number[][] = [];
    for (let r = 0; r < dimK; r++) {
      mre.push(gate.matrix[r].map(c => c.re));
      mim.push(gate.matrix[r].map(c => c.im));
    }

    // Bit mask of each target qubit within a full basis-state index
    // (qubit 0 is the most significant bit).
    const masks = targetQubits.map(q => 1 << (numQubits - 1 - q));
    const combinedMask = masks.reduce((a, b) => a | b, 0);

    // spread[r] = full-index bits corresponding to sub-index r over the targets.
    const spread = new Int32Array(dimK);
    for (let r = 0; r < dimK; r++) {
      let bits = 0;
      for (let t = 0; t < k; t++) {
        if ((r >> (k - 1 - t)) & 1) {
          bits |= masks[t];
        }
      }
      spread[r] = bits;
    }

    const { re, im } = state.raw();
    const newRe = new Float64Array(dim);
    const newIm = new Float64Array(dim);

    for (let base = 0; base < dim; base++) {
      if (base & combinedMask) continue; // not a base index (some target bit set)

      for (let r = 0; r < dimK; r++) {
        let sumRe = 0;
        let sumIm = 0;
        for (let c = 0; c < dimK; c++) {
          const mr = mre[r][c];
          const mi = mim[r][c];
          if (mr === 0 && mi === 0) continue;
          const idx = base | spread[c];
          sumRe += mr * re[idx] - mi * im[idx];
          sumIm += mr * im[idx] + mi * re[idx];
        }
        const out = base | spread[r];
        newRe[out] = sumRe;
        newIm[out] = sumIm;
      }
    }

    return QuantumState.fromRaw(numQubits, newRe, newIm);
  }

  // Measure a specific qubit (collapses the state)
  static measureQubit(
    state: QuantumState,
    qubitIndex: number,
    random: RandomSource = Math.random
  ): { result: 0 | 1; newState: QuantumState } {
    const { prob0, prob1 } = state.getQubitMeasurementProbabilities(qubitIndex);

    const result: 0 | 1 = random() < prob0 ? 0 : 1;

    // Collapse the state based on measurement result
    const numQubits = state.getNumQubits();
    const dim = 1 << numQubits;
    const mask = 1 << (numQubits - 1 - qubitIndex);
    const keepBit = result === 0 ? 0 : mask;
    const inv = 1 / Math.sqrt(result === 0 ? prob0 : prob1);

    const { re, im } = state.raw();
    const newRe = new Float64Array(dim);
    const newIm = new Float64Array(dim);

    for (let i = 0; i < dim; i++) {
      if ((i & mask) === keepBit) {
        newRe[i] = re[i] * inv;
        newIm[i] = im[i] * inv;
      }
    }

    return {
      result,
      newState: QuantumState.fromRaw(numQubits, newRe, newIm)
    };
  }

  // Measure all qubits (complete measurement)
  static measureAll(
    state: QuantumState,
    random: RandomSource = Math.random
  ): { results: number[]; probabilities: number[] } {
    const probabilities = state.getMeasurementProbabilities();

    // Choose outcome based on probabilities. Default to the last basis state
    // so float rounding in the cumulative sum can never select an outcome the
    // loop skipped.
    const r = random();
    let cumulativeProb = 0;
    let measuredState = probabilities.length - 1;

    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProb += probabilities[i];
      if (r < cumulativeProb) {
        measuredState = i;
        break;
      }
    }

    // Convert measured state to individual qubit results
    const numQubits = state.getNumQubits();
    const results: number[] = [];

    for (let i = 0; i < numQubits; i++) {
      const qubitValue = (measuredState >> (numQubits - 1 - i)) & 1;
      results.push(qubitValue);
    }

    return { results, probabilities };
  }

  /**
   * Sample repeated full-register measurements WITHOUT collapsing the state —
   * the simulator analogue of running the circuit `shots` times and recording
   * each bitstring. Returns counts keyed by bitstring (qubit 0 leftmost).
   */
  static sampleCounts(
    state: QuantumState,
    shots: number,
    random: RandomSource = Math.random
  ): Record<string, number> {
    if (!Number.isInteger(shots) || shots < 1) {
      throw new Error('shots must be a positive integer');
    }

    const { re, im } = state.raw();
    const dim = re.length;
    const cumulative = new Float64Array(dim);
    let acc = 0;
    for (let i = 0; i < dim; i++) {
      acc += re[i] * re[i] + im[i] * im[i];
      cumulative[i] = acc;
    }

    const countsByIndex = new Map<number, number>();
    for (let s = 0; s < shots; s++) {
      const r = random() * acc;
      // lower_bound binary search: first index with cumulative[idx] > r
      let lo = 0;
      let hi = dim - 1;
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (cumulative[mid] > r) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      countsByIndex.set(lo, (countsByIndex.get(lo) || 0) + 1);
    }

    const counts: Record<string, number> = {};
    for (const [index, count] of countsByIndex) {
      counts[state.basisStateToString(index)] = count;
    }
    return counts;
  }

  // Calculate fidelity |⟨ψ1|ψ2⟩|² between two pure states
  static calculateFidelity(state1: QuantumState, state2: QuantumState): number {
    if (state1.getNumQubits() !== state2.getNumQubits()) {
      throw new Error('States must have the same number of qubits');
    }

    const a = state1.raw();
    const b = state2.raw();

    // ⟨ψ1|ψ2⟩ = Σ conj(a_i) · b_i
    let ipRe = 0;
    let ipIm = 0;
    for (let i = 0; i < a.re.length; i++) {
      ipRe += a.re[i] * b.re[i] + a.im[i] * b.im[i];
      ipIm += a.re[i] * b.im[i] - a.im[i] * b.re[i];
    }

    return ipRe * ipRe + ipIm * ipIm;
  }
}
