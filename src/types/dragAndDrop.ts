import { QuantumGate } from './quantum';

export interface DragItem {
  type: string;
  gate: QuantumGate;
  id: string;
}

export interface DropResult {
  position: { row: number; col: number };
  targetQubits: number[];
}

export interface PlacedGate {
  id: string;
  gate: QuantumGate;
  position: { row: number; col: number };
  targetQubits: number[];
  connections?: Array<{ fromQubit: number; toQubit: number }>;
}

export const DragTypes = {
  GATE: 'gate',
  PLACED_GATE: 'placedGate'
} as const;