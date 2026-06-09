import { Complex } from 'mathjs';

export interface QuantumGate {
  name: string;
  symbol: string;
  matrix: Complex[][];
  qubits: number;
  /** Angle parameters for parameterized gates (e.g. [θ] for Rx). Used by QASM export. */
  params?: number[];
}

export interface QubitState {
  amplitude0: Complex;
  amplitude1: Complex;
}

export interface CircuitElement {
  gate: QuantumGate;
  targetQubits: number[];
  position: number;
}