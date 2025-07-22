import { Complex } from 'mathjs';

export interface QuantumGate {
  name: string;
  symbol: string;
  matrix: Complex[][];
  qubits: number;
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