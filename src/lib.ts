/**
 * Public library surface of the quantum simulator engine.
 *
 * The engine has no React/DOM dependencies — it can be used standalone:
 *
 *   import { QuantumCircuit } from './lib';
 *   const bell = new QuantumCircuit(2);
 *   bell.h(0).cx(0, 1).measureAll();
 *   const { counts } = bell.run({ shots: 1024 });
 */
export { QuantumCircuit, mulberry32 } from './quantum/circuit';
export type { RunOptions, RunResult, CircuitOp, NoiseChannel } from './quantum/circuit';
export { QuantumState, MAX_QUBITS } from './quantum/state';
export { QuantumOperations } from './quantum/operations';
export type { RandomSource } from './quantum/operations';
export { QuantumSimulator } from './quantum/simulator';
export type { SimulationResult, MeasurementResult } from './quantum/simulator';
export {
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
  availableGates,
} from './quantum/gates';
export { parseQasm, instructionsToQasm } from './quantum/qasm';
export { BlochSphereUtils } from './utils/blochSphere';
export type { BlochVector, SphericalCoordinates } from './utils/blochSphere';
export type { QuantumGate, CircuitElement } from './types/quantum';
