import { Complex, complex } from 'mathjs';

/**
 * Hard ceiling on register size. 24 qubits = 2^24 amplitudes = 256 MB of
 * Float64Array storage (re + im); beyond that a browser tab runs out of
 * headroom long before the math finishes. See README "Performance and the
 * exponential wall" for measured timings.
 */
export const MAX_QUBITS = 24;

/**
 * Pure state of an n-qubit register, stored as the full 2^n amplitude vector.
 *
 * Storage is a pair of Float64Arrays (real/imaginary parts) rather than boxed
 * complex objects so gate application stays cache-friendly at high qubit
 * counts. The public API still speaks mathjs `Complex` for convenience.
 *
 * Bit convention: qubit 0 is the MOST significant bit of a basis-state index,
 * so |q0 q1 ... q(n-1)⟩ reads left to right (Nielsen & Chuang ordering, the
 * opposite of Qiskit's little-endian convention).
 */
export class QuantumState {
  private re: Float64Array;
  private im: Float64Array;
  private numQubits: number;

  constructor(numQubits: number, initialState?: Complex[]) {
    if (numQubits < 1) {
      throw new Error('Number of qubits must be at least 1');
    }
    if (numQubits > MAX_QUBITS) {
      throw new Error(`Maximum ${MAX_QUBITS} qubits supported`);
    }

    this.numQubits = numQubits;
    const numStates = 1 << numQubits;
    this.re = new Float64Array(numStates);
    this.im = new Float64Array(numStates);

    if (initialState) {
      if (initialState.length !== numStates) {
        throw new Error(`Initial state must have ${numStates} amplitudes for ${numQubits} qubits`);
      }
      for (let i = 0; i < numStates; i++) {
        this.re[i] = initialState[i].re;
        this.im[i] = initialState[i].im;
      }
      this.normalize();
    } else {
      // |0...0⟩
      this.re[0] = 1;
    }
  }

  /**
   * Construct directly from raw component arrays (zero-copy: takes ownership
   * of the arrays). Used by the gate-application hot path.
   */
  static fromRaw(numQubits: number, re: Float64Array, im: Float64Array, normalize = false): QuantumState {
    const state = Object.create(QuantumState.prototype) as QuantumState;
    state.numQubits = numQubits;
    state.re = re;
    state.im = im;
    if (normalize) {
      state.normalize();
    }
    return state;
  }

  /**
   * Zero-copy access to the underlying component arrays. Treat as read-only;
   * for engine internals (operations, sampling) that need raw speed.
   */
  raw(): { re: Float64Array; im: Float64Array } {
    return { re: this.re, im: this.im };
  }

  // Get the state vector as mathjs Complex values.
  // Materializes 2^n objects — fine for display at small n, avoid in hot loops.
  getAmplitudes(): Complex[] {
    const out: Complex[] = new Array(this.re.length);
    for (let i = 0; i < this.re.length; i++) {
      out[i] = complex(this.re[i], this.im[i]);
    }
    return out;
  }

  // Get number of qubits
  getNumQubits(): number {
    return this.numQubits;
  }

  // Normalize the state vector
  private normalize(): void {
    let normSq = 0;
    for (let i = 0; i < this.re.length; i++) {
      normSq += this.re[i] * this.re[i] + this.im[i] * this.im[i];
    }

    if (normSq === 0) {
      throw new Error('Cannot normalize zero state');
    }

    const inv = 1 / Math.sqrt(normSq);
    for (let i = 0; i < this.re.length; i++) {
      this.re[i] *= inv;
      this.im[i] *= inv;
    }
  }

  // Set amplitude at a specific basis state.
  // Note: this sets the raw amplitude and does NOT renormalize — callers that
  // build up a state via multiple setAmplitude calls would otherwise hit
  // intermediate (and sometimes all-zero) states. Use normalizeState() when done.
  setAmplitude(basisState: number, amplitude: Complex): void {
    if (basisState < 0 || basisState >= this.re.length) {
      throw new Error(`Basis state ${basisState} out of range`);
    }
    this.re[basisState] = amplitude.re;
    this.im[basisState] = amplitude.im;
  }

  // Public, opt-in normalization for callers that build state manually.
  normalizeState(): void {
    this.normalize();
  }

  // Get amplitude at a specific basis state
  getAmplitude(basisState: number): Complex {
    if (basisState < 0 || basisState >= this.re.length) {
      throw new Error(`Basis state ${basisState} out of range`);
    }
    return complex(this.re[basisState], this.im[basisState]);
  }

  // Calculate measurement probabilities for all basis states.
  // Allocates a 2^n array — for large n prefer sampleCounts() in operations.
  getMeasurementProbabilities(): number[] {
    const probs: number[] = new Array(this.re.length);
    for (let i = 0; i < this.re.length; i++) {
      probs[i] = this.re[i] * this.re[i] + this.im[i] * this.im[i];
    }
    return probs;
  }

  // Calculate measurement probability for a specific basis state
  getMeasurementProbability(basisState: number): number {
    if (basisState < 0 || basisState >= this.re.length) {
      throw new Error(`Basis state ${basisState} out of range`);
    }
    return this.re[basisState] * this.re[basisState] + this.im[basisState] * this.im[basisState];
  }

  // Calculate measurement probabilities for a specific qubit
  getQubitMeasurementProbabilities(qubitIndex: number): { prob0: number; prob1: number } {
    if (qubitIndex < 0 || qubitIndex >= this.numQubits) {
      throw new Error(`Qubit index ${qubitIndex} out of range`);
    }

    const mask = 1 << (this.numQubits - 1 - qubitIndex);
    let prob0 = 0;
    let prob1 = 0;

    for (let i = 0; i < this.re.length; i++) {
      const probability = this.re[i] * this.re[i] + this.im[i] * this.im[i];
      if (i & mask) {
        prob1 += probability;
      } else {
        prob0 += probability;
      }
    }

    return { prob0, prob1 };
  }

  // Convert basis state index to binary string representation
  basisStateToString(basisState: number): string {
    return basisState.toString(2).padStart(this.numQubits, '0');
  }

  // Get string representation of the quantum state
  toString(): string {
    const terms: string[] = [];

    for (let i = 0; i < this.re.length; i++) {
      const magnitudeSq = this.re[i] * this.re[i] + this.im[i] * this.im[i];

      if (magnitudeSq > 1e-20) { // Only show non-negligible amplitudes
        const basisState = this.basisStateToString(i);
        const ampStr = complex(this.re[i], this.im[i]).toString();
        terms.push(`${ampStr}|${basisState}⟩`);
      }
    }

    return terms.join(' + ') || '0';
  }

  // Clone the quantum state
  clone(): QuantumState {
    return QuantumState.fromRaw(this.numQubits, this.re.slice(), this.im.slice());
  }
}
