import { QuantumState, MAX_QUBITS } from './state';
import { QuantumOperations, RandomSource } from './operations';
import { QuantumGate } from '../types/quantum';
import {
  HadamardGate,
  PauliXGate,
  PauliYGate,
  PauliZGate,
  SGate,
  SDaggerGate,
  TGate,
  TDaggerGate,
  CNOTGate,
  CZGate,
  SWAPGate,
  ToffoliGate,
  CCZGate,
  rx,
  ry,
  rz,
  phase,
  controlled,
  controlledPhase,
} from './gates';
import { instructionsToQasm, parseQasm } from './qasm';

export type NoiseChannel = 'bit-flip' | 'phase-flip' | 'depolarizing';

export type CircuitOp =
  | { kind: 'gate'; gate: QuantumGate; qubits: number[] }
  | { kind: 'measure'; qubit: number }
  | { kind: 'noise'; channel: NoiseChannel; qubit: number; probability: number };

export interface RunOptions {
  /** Number of measurement shots (default 1024). */
  shots?: number;
  /** Seed for a deterministic run. Omit for fresh randomness. */
  seed?: number;
}

export interface RunResult {
  /**
   * Histogram of measured bitstrings. Keys list the measured qubits in
   * ascending index order, qubit 0 leftmost.
   */
  counts: Record<string, number>;
  shots: number;
  /** Which qubits the bitstring positions refer to. */
  measuredQubits: number[];
}

const PARAM_COUNTS: Record<string, number> = {
  rx: 1, ry: 1, rz: 1, p: 1, u1: 1, crz: 1, cp: 1, cu1: 1,
};

/** Deterministic PRNG (mulberry32) so noisy runs are reproducible. */
export function mulberry32(seed: number): RandomSource {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gate-by-gate circuit builder with a fluent API:
 *
 *   const circuit = new QuantumCircuit(2);
 *   circuit.h(0).cx(0, 1).measureAll();
 *   const { counts } = circuit.run({ shots: 1024 });
 *
 * Execution is exact state-vector simulation. Noise channels (bit-flip,
 * phase-flip, depolarizing) are simulated by stochastic unraveling: each shot
 * samples a Pauli-error trajectory, which reproduces the channel statistics
 * over many shots without a density-matrix representation.
 */
export class QuantumCircuit {
  readonly numQubits: number;
  private ops: CircuitOp[] = [];

  constructor(numQubits: number) {
    if (!Number.isInteger(numQubits) || numQubits < 1 || numQubits > MAX_QUBITS) {
      throw new Error(`Number of qubits must be an integer between 1 and ${MAX_QUBITS}`);
    }
    this.numQubits = numQubits;
  }

  // -- gates ----------------------------------------------------------------

  /** Append any gate (including ones built with controlled()). */
  gate(gate: QuantumGate, ...qubits: number[]): this {
    if (qubits.length !== gate.qubits) {
      throw new Error(`${gate.name} acts on ${gate.qubits} qubit(s), got ${qubits.length}`);
    }
    qubits.forEach(q => this.checkQubit(q));
    if (new Set(qubits).size !== qubits.length) {
      throw new Error('Qubit arguments must be distinct');
    }
    this.ops.push({ kind: 'gate', gate, qubits });
    return this;
  }

  h(qubit: number): this { return this.gate(HadamardGate, qubit); }
  x(qubit: number): this { return this.gate(PauliXGate, qubit); }
  y(qubit: number): this { return this.gate(PauliYGate, qubit); }
  z(qubit: number): this { return this.gate(PauliZGate, qubit); }
  s(qubit: number): this { return this.gate(SGate, qubit); }
  sdg(qubit: number): this { return this.gate(SDaggerGate, qubit); }
  t(qubit: number): this { return this.gate(TGate, qubit); }
  tdg(qubit: number): this { return this.gate(TDaggerGate, qubit); }

  rx(theta: number, qubit: number): this { return this.gate(rx(theta), qubit); }
  ry(theta: number, qubit: number): this { return this.gate(ry(theta), qubit); }
  rz(theta: number, qubit: number): this { return this.gate(rz(theta), qubit); }
  /** Phase gate P(θ) = diag(1, e^{iθ}). */
  p(theta: number, qubit: number): this { return this.gate(phase(theta), qubit); }

  cx(control: number, target: number): this { return this.gate(CNOTGate, control, target); }
  cy(control: number, target: number): this { return this.gate(controlled(PauliYGate), control, target); }
  cz(control: number, target: number): this { return this.gate(CZGate, control, target); }
  ch(control: number, target: number): this { return this.gate(controlled(HadamardGate), control, target); }
  swap(a: number, b: number): this { return this.gate(SWAPGate, a, b); }
  /** Controlled phase rotation — the QFT building block. */
  cp(theta: number, control: number, target: number): this {
    return this.gate(controlledPhase(theta), control, target);
  }
  crz(theta: number, control: number, target: number): this {
    return this.gate(controlled(rz(theta)), control, target);
  }

  /** Toffoli. */
  ccx(control1: number, control2: number, target: number): this {
    return this.gate(ToffoliGate, control1, control2, target);
  }
  ccz(a: number, b: number, c: number): this { return this.gate(CCZGate, a, b, c); }

  // -- measurement ----------------------------------------------------------

  measure(...qubits: number[]): this {
    if (qubits.length === 0) {
      throw new Error('measure() needs at least one qubit; use measureAll() for all');
    }
    for (const q of qubits) {
      this.checkQubit(q);
      this.ops.push({ kind: 'measure', qubit: q });
    }
    return this;
  }

  measureAll(): this {
    for (let q = 0; q < this.numQubits; q++) {
      this.ops.push({ kind: 'measure', qubit: q });
    }
    return this;
  }

  // -- noise channels ---------------------------------------------------------

  /** With probability p, apply X to the qubit at this point in the circuit. */
  bitFlip(probability: number, qubit: number): this {
    return this.noise('bit-flip', probability, qubit);
  }

  /** With probability p, apply Z to the qubit at this point in the circuit. */
  phaseFlip(probability: number, qubit: number): this {
    return this.noise('phase-flip', probability, qubit);
  }

  /**
   * Depolarizing channel: with probability p, apply a uniformly random Pauli
   * (X, Y, or Z each with probability p/3).
   */
  depolarizing(probability: number, qubit: number): this {
    return this.noise('depolarizing', probability, qubit);
  }

  private noise(channel: NoiseChannel, probability: number, qubit: number): this {
    this.checkQubit(qubit);
    if (!(probability >= 0 && probability <= 1)) {
      throw new Error('Noise probability must be in [0, 1]');
    }
    this.ops.push({ kind: 'noise', channel, qubit, probability });
    return this;
  }

  // -- execution --------------------------------------------------------------

  /** Number of operations (gates + measurements + noise) in the circuit. */
  size(): number {
    return this.ops.length;
  }

  /** The op list (read-only view) — used by QASM export and the UI bridge. */
  operations(): readonly CircuitOp[] {
    return this.ops;
  }

  /**
   * Exact final state vector. Only valid for pure-gate circuits: throws if
   * the circuit contains measurements or noise (those need run()).
   */
  statevector(): QuantumState {
    let state = new QuantumState(this.numQubits);
    for (const op of this.ops) {
      if (op.kind !== 'gate') {
        throw new Error('statevector() requires a gate-only circuit; use run() for circuits with measurement or noise');
      }
      state = QuantumOperations.applyGate(state, op.gate, op.qubits);
    }
    return state;
  }

  /** Exact measurement probabilities over all basis states (gate-only circuits). */
  probabilities(): number[] {
    return this.statevector().getMeasurementProbabilities();
  }

  /**
   * Sample the circuit `shots` times and histogram the measured bitstrings.
   *
   * Ideal circuits whose measurements all come last are simulated once and
   * sampled from the exact distribution. Circuits with noise or mid-circuit
   * measurement run one stochastic trajectory per shot.
   */
  run(options: RunOptions = {}): RunResult {
    const shots = options.shots ?? 1024;
    if (!Number.isInteger(shots) || shots < 1) {
      throw new Error('shots must be a positive integer');
    }
    const random: RandomSource = options.seed !== undefined ? mulberry32(options.seed) : Math.random;

    const measuredQubits = this.measuredQubits();
    return this.needsTrajectories()
      ? this.runTrajectories(shots, measuredQubits, random)
      : this.runSampled(shots, measuredQubits, random);
  }

  // Measured qubits in ascending order; a circuit with no explicit measure
  // ops is treated as measure-all (the friendly default).
  private measuredQubits(): number[] {
    const qubits = new Set<number>();
    for (const op of this.ops) {
      if (op.kind === 'measure') qubits.add(op.qubit);
    }
    if (qubits.size === 0) {
      return Array.from({ length: this.numQubits }, (_, q) => q);
    }
    return [...qubits].sort((a, b) => a - b);
  }

  // Sampling from the final distribution is only faithful when nothing is
  // stochastic mid-circuit: no noise anywhere, and no measurement before a
  // later gate.
  private needsTrajectories(): boolean {
    let lastGate = -1;
    let firstMeasure = Infinity;
    let hasNoise = false;
    this.ops.forEach((op, i) => {
      if (op.kind === 'noise') hasNoise = true;
      if (op.kind === 'gate') lastGate = i;
      if (op.kind === 'measure' && i < firstMeasure) firstMeasure = i;
    });
    return hasNoise || firstMeasure < lastGate;
  }

  private runSampled(shots: number, measuredQubits: number[], random: RandomSource): RunResult {
    let state = new QuantumState(this.numQubits);
    for (const op of this.ops) {
      if (op.kind === 'gate') {
        state = QuantumOperations.applyGate(state, op.gate, op.qubits);
      }
    }

    const fullCounts = QuantumOperations.sampleCounts(state, shots, random);
    const counts: Record<string, number> = {};
    for (const [bitstring, count] of Object.entries(fullCounts)) {
      const key = measuredQubits.map(q => bitstring[q]).join('');
      counts[key] = (counts[key] || 0) + count;
    }
    return { counts, shots, measuredQubits };
  }

  private runTrajectories(shots: number, measuredQubits: number[], random: RandomSource): RunResult {
    const counts: Record<string, number> = {};

    for (let shot = 0; shot < shots; shot++) {
      let state = new QuantumState(this.numQubits);
      const bits = new Map<number, number>();

      for (const op of this.ops) {
        if (op.kind === 'gate') {
          state = QuantumOperations.applyGate(state, op.gate, op.qubits);
        } else if (op.kind === 'noise') {
          const error = this.sampleNoiseError(op, random);
          if (error) {
            state = QuantumOperations.applyGate(state, error, [op.qubit]);
          }
        } else {
          const { result, newState } = QuantumOperations.measureQubit(state, op.qubit, random);
          state = newState;
          bits.set(op.qubit, result);
        }
      }

      // Qubits never explicitly measured (measure-all default) are sampled
      // from the surviving state.
      const unmeasured = measuredQubits.filter(q => !bits.has(q));
      if (unmeasured.length > 0) {
        for (const q of unmeasured) {
          const { result, newState } = QuantumOperations.measureQubit(state, q, random);
          state = newState;
          bits.set(q, result);
        }
      }

      const key = measuredQubits.map(q => bits.get(q)).join('');
      counts[key] = (counts[key] || 0) + 1;
    }

    return { counts, shots, measuredQubits };
  }

  private sampleNoiseError(op: Extract<CircuitOp, { kind: 'noise' }>, random: RandomSource): QuantumGate | null {
    const r = random();
    if (r >= op.probability) return null;
    switch (op.channel) {
      case 'bit-flip':
        return PauliXGate;
      case 'phase-flip':
        return PauliZGate;
      case 'depolarizing': {
        const third = op.probability / 3;
        if (r < third) return PauliXGate;
        if (r < 2 * third) return PauliYGate;
        return PauliZGate;
      }
    }
  }

  // -- QASM -------------------------------------------------------------------

  /** Export to OpenQASM 2.0. Noise channels cannot be represented and throw. */
  toQasm(): string {
    return instructionsToQasm(this.numQubits, this.ops);
  }

  /** Build a circuit from an OpenQASM 2.0 program (qelib1 gate subset). */
  static fromQasm(source: string): QuantumCircuit {
    const program = parseQasm(source);
    const circuit = new QuantumCircuit(program.numQubits);

    for (const inst of program.instructions) {
      if (inst.kind === 'measure') {
        circuit.measure(inst.qubit);
        continue;
      }
      const { name, params, qubits } = inst;
      const expectedParams = PARAM_COUNTS[name] ?? 0;
      if (params.length !== expectedParams) {
        throw new Error(`QASM gate ${name} expects ${expectedParams} parameter(s), got ${params.length}`);
      }
      const p0 = params[0];
      switch (name) {
        case 'id': break;
        case 'x': circuit.x(qubits[0]); break;
        case 'y': circuit.y(qubits[0]); break;
        case 'z': circuit.z(qubits[0]); break;
        case 'h': circuit.h(qubits[0]); break;
        case 's': circuit.s(qubits[0]); break;
        case 'sdg': circuit.sdg(qubits[0]); break;
        case 't': circuit.t(qubits[0]); break;
        case 'tdg': circuit.tdg(qubits[0]); break;
        case 'rx': circuit.rx(p0, qubits[0]); break;
        case 'ry': circuit.ry(p0, qubits[0]); break;
        case 'rz': circuit.rz(p0, qubits[0]); break;
        case 'p':
        case 'u1': circuit.p(p0, qubits[0]); break;
        case 'cx': circuit.cx(qubits[0], qubits[1]); break;
        case 'cy': circuit.cy(qubits[0], qubits[1]); break;
        case 'cz': circuit.cz(qubits[0], qubits[1]); break;
        case 'ch': circuit.ch(qubits[0], qubits[1]); break;
        case 'swap': circuit.swap(qubits[0], qubits[1]); break;
        case 'crz': circuit.crz(p0, qubits[0], qubits[1]); break;
        case 'cp':
        case 'cu1': circuit.cp(p0, qubits[0], qubits[1]); break;
        case 'ccx': circuit.ccx(qubits[0], qubits[1], qubits[2]); break;
        default:
          throw new Error(`Unsupported QASM gate: ${name}`);
      }
    }

    return circuit;
  }

  private checkQubit(qubit: number): void {
    if (!Number.isInteger(qubit) || qubit < 0 || qubit >= this.numQubits) {
      throw new Error(`Qubit index ${qubit} out of range for ${this.numQubits}-qubit circuit`);
    }
  }
}
