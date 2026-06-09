import { describe, it, expect } from 'vitest';
import { complex } from 'mathjs';
import { QuantumState } from '../quantum/state';
import { QuantumOperations } from '../quantum/operations';
import {
  HadamardGate,
  PauliXGate,
  PauliYGate,
  PauliZGate,
  SGate,
  SDaggerGate,
  TGate,
  TDaggerGate,
  CZGate,
  SWAPGate,
  ToffoliGate,
  CCZGate,
  rx,
  ry,
  rz,
  phase,
  controlled,
} from '../quantum/gates';
import { BlochSphereUtils } from '../utils/blochSphere';

const SQRT2 = Math.sqrt(2);

const basisState = (numQubits: number, index: number): QuantumState => {
  const state = new QuantumState(numQubits);
  state.setAmplitude(0, complex(0));
  state.setAmplitude(index, complex(1));
  return state;
};

describe('phase gates (S, T) and complex amplitudes', () => {
  it('S maps |+⟩ to |+i⟩', () => {
    let state = new QuantumState(1);
    state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, SGate, 0);

    expect(state.getAmplitude(0).re).toBeCloseTo(1 / SQRT2, 10);
    expect(state.getAmplitude(0).im).toBeCloseTo(0, 10);
    expect(state.getAmplitude(1).re).toBeCloseTo(0, 10);
    expect(state.getAmplitude(1).im).toBeCloseTo(1 / SQRT2, 10);
  });

  it('T·T = S and S·S = Z on a superposition', () => {
    let viaT = new QuantumState(1);
    viaT = QuantumOperations.applySingleQubitGate(viaT, HadamardGate, 0);
    viaT = QuantumOperations.applySingleQubitGate(viaT, TGate, 0);
    viaT = QuantumOperations.applySingleQubitGate(viaT, TGate, 0);

    let viaS = new QuantumState(1);
    viaS = QuantumOperations.applySingleQubitGate(viaS, HadamardGate, 0);
    viaS = QuantumOperations.applySingleQubitGate(viaS, SGate, 0);

    expect(QuantumOperations.calculateFidelity(viaT, viaS)).toBeCloseTo(1, 10);

    // S·S|+⟩ = Z|+⟩ = |−⟩
    const viaSS = QuantumOperations.applySingleQubitGate(viaS, SGate, 0);
    let viaZ = new QuantumState(1);
    viaZ = QuantumOperations.applySingleQubitGate(viaZ, HadamardGate, 0);
    viaZ = QuantumOperations.applySingleQubitGate(viaZ, PauliZGate, 0);
    expect(QuantumOperations.calculateFidelity(viaSS, viaZ)).toBeCloseTo(1, 10);
  });

  it('T† undoes T and S† undoes S', () => {
    let state = new QuantumState(1);
    state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
    const reference = state.clone();

    state = QuantumOperations.applySingleQubitGate(state, TGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, TDaggerGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, SGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, SDaggerGate, 0);

    expect(QuantumOperations.calculateFidelity(state, reference)).toBeCloseTo(1, 10);
  });
});

describe('rotation gates', () => {
  it('Ry(θ)|0⟩ = cos(θ/2)|0⟩ + sin(θ/2)|1⟩', () => {
    const theta = 1.234;
    let state = new QuantumState(1);
    state = QuantumOperations.applySingleQubitGate(state, ry(theta), 0);

    expect(state.getAmplitude(0).re).toBeCloseTo(Math.cos(theta / 2), 10);
    expect(state.getAmplitude(1).re).toBeCloseTo(Math.sin(theta / 2), 10);
  });

  it('Rx(π) flips |0⟩ to |1⟩ (up to global phase -i)', () => {
    let state = new QuantumState(1);
    state = QuantumOperations.applySingleQubitGate(state, rx(Math.PI), 0);

    expect(state.getMeasurementProbability(0)).toBeCloseTo(0, 10);
    expect(state.getMeasurementProbability(1)).toBeCloseTo(1, 10);
    expect(state.getAmplitude(1).im).toBeCloseTo(-1, 10);
  });

  it('Rz(θ) applies opposite half-phases to |0⟩ and |1⟩', () => {
    const theta = Math.PI / 3;
    let state = new QuantumState(1);
    state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, rz(theta), 0);

    expect(state.getAmplitude(0).re).toBeCloseTo(Math.cos(theta / 2) / SQRT2, 10);
    expect(state.getAmplitude(0).im).toBeCloseTo(-Math.sin(theta / 2) / SQRT2, 10);
    expect(state.getAmplitude(1).re).toBeCloseTo(Math.cos(theta / 2) / SQRT2, 10);
    expect(state.getAmplitude(1).im).toBeCloseTo(Math.sin(theta / 2) / SQRT2, 10);
  });

  it('P(π) equals Z', () => {
    let viaP = new QuantumState(1);
    viaP = QuantumOperations.applySingleQubitGate(viaP, HadamardGate, 0);
    viaP = QuantumOperations.applySingleQubitGate(viaP, phase(Math.PI), 0);

    let viaZ = new QuantumState(1);
    viaZ = QuantumOperations.applySingleQubitGate(viaZ, HadamardGate, 0);
    viaZ = QuantumOperations.applySingleQubitGate(viaZ, PauliZGate, 0);

    expect(QuantumOperations.calculateFidelity(viaP, viaZ)).toBeCloseTo(1, 10);
  });

  it('rotations preserve the norm', () => {
    let state = new QuantumState(2);
    state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, rx(0.7), 1);
    state = QuantumOperations.applySingleQubitGate(state, ry(2.1), 0);
    state = QuantumOperations.applySingleQubitGate(state, rz(-1.3), 1);

    const total = state.getMeasurementProbabilities().reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});

describe('multi-qubit gates', () => {
  it('CZ phase-flips only |11⟩', () => {
    let state = new QuantumState(2);
    state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 1);
    state = QuantumOperations.applyTwoQubitGate(state, CZGate, 0, 1);

    expect(state.getAmplitude(0).re).toBeCloseTo(0.5, 10);
    expect(state.getAmplitude(1).re).toBeCloseTo(0.5, 10);
    expect(state.getAmplitude(2).re).toBeCloseTo(0.5, 10);
    expect(state.getAmplitude(3).re).toBeCloseTo(-0.5, 10);
  });

  it('SWAP exchanges qubit states', () => {
    // |10⟩ → |01⟩
    let state = basisState(2, 2);
    state = QuantumOperations.applyTwoQubitGate(state, SWAPGate, 0, 1);
    expect(state.getMeasurementProbability(1)).toBeCloseTo(1, 10);
  });

  it('Toffoli flips the target only when both controls are set', () => {
    // |110⟩ → |111⟩
    let state = basisState(3, 6);
    state = QuantumOperations.applyGate(state, ToffoliGate, [0, 1, 2]);
    expect(state.getMeasurementProbability(7)).toBeCloseTo(1, 10);

    // |010⟩ unchanged
    state = basisState(3, 2);
    state = QuantumOperations.applyGate(state, ToffoliGate, [0, 1, 2]);
    expect(state.getMeasurementProbability(2)).toBeCloseTo(1, 10);
  });

  it('CCZ phase-flips only |111⟩', () => {
    let state = new QuantumState(3);
    for (let q = 0; q < 3; q++) {
      state = QuantumOperations.applySingleQubitGate(state, HadamardGate, q);
    }
    state = QuantumOperations.applyGate(state, CCZGate, [0, 1, 2]);

    for (let i = 0; i < 8; i++) {
      const expected = i === 7 ? -1 / Math.sqrt(8) : 1 / Math.sqrt(8);
      expect(state.getAmplitude(i).re).toBeCloseTo(expected, 10);
    }
  });

  it('CNOT works on non-adjacent qubits in either direction', () => {
    // control q2, target q0 in a 3-qubit register: |001⟩ → |101⟩
    let state = basisState(3, 1);
    state = QuantumOperations.applyGate(state, controlled(PauliXGate), [2, 0]);
    expect(state.getMeasurementProbability(5)).toBeCloseTo(1, 10);
  });

  it('controlled() builds arbitrary controlled gates (CH example)', () => {
    // |10⟩ → |1⟩⊗H|0⟩
    let state = basisState(2, 2);
    state = QuantumOperations.applyGate(state, controlled(HadamardGate), [0, 1]);
    expect(state.getAmplitude(2).re).toBeCloseTo(1 / SQRT2, 10);
    expect(state.getAmplitude(3).re).toBeCloseTo(1 / SQRT2, 10);

    // |00⟩ unchanged
    let idle = new QuantumState(2);
    idle = QuantumOperations.applyGate(idle, controlled(HadamardGate), [0, 1]);
    expect(idle.getMeasurementProbability(0)).toBeCloseTo(1, 10);
  });

  it('double-controlled rotation leaves non-matching states alone', () => {
    const ccry = controlled(ry(0.8), 2);
    expect(ccry.qubits).toBe(3);

    let state = basisState(3, 4); // |100⟩ — only one control set
    state = QuantumOperations.applyGate(state, ccry, [0, 1, 2]);
    expect(state.getMeasurementProbability(4)).toBeCloseTo(1, 10);
  });
});

describe('fidelity with complex inner products (regression)', () => {
  it('F(|+⟩, |+i⟩) = 0.5, not NaN', () => {
    const plus = new QuantumState(1, [complex(1 / SQRT2), complex(1 / SQRT2)]);
    const plusI = new QuantumState(1, [complex(1 / SQRT2), complex(0, 1 / SQRT2)]);

    const fidelity = QuantumOperations.calculateFidelity(plus, plusI);
    expect(fidelity).toBeCloseTo(0.5, 10);
    expect(Number.isNaN(fidelity)).toBe(false);
  });

  it('fidelity is invariant under global phase', () => {
    const state = new QuantumState(1, [complex(0.6), complex(0.8)]);
    // multiply by global phase e^{iπ/5}
    const phi = Math.PI / 5;
    const phased = new QuantumState(1, [
      complex(0.6 * Math.cos(phi), 0.6 * Math.sin(phi)),
      complex(0.8 * Math.cos(phi), 0.8 * Math.sin(phi)),
    ]);

    expect(QuantumOperations.calculateFidelity(state, phased)).toBeCloseTo(1, 10);
  });
});

describe('Bloch sphere mapping (regression)', () => {
  it('|+i⟩ maps to +y, matching getCommonStates', () => {
    const plusI = new QuantumState(1, [complex(1 / SQRT2), complex(0, 1 / SQRT2)]);
    const vector = BlochSphereUtils.stateToBlochVector(plusI);

    expect(vector.x).toBeCloseTo(0, 10);
    expect(vector.y).toBeCloseTo(1, 10);
    expect(vector.z).toBeCloseTo(0, 10);

    const reference = BlochSphereUtils.getCommonStates()['|+i⟩'];
    expect(vector.y).toBeCloseTo(reference.y, 10);
  });

  it('|+⟩, |−⟩, |0⟩, |1⟩ map to ±x and ±z', () => {
    const cases: Array<[QuantumState, { x: number; y: number; z: number }]> = [
      [new QuantumState(1, [complex(1), complex(0)]), { x: 0, y: 0, z: 1 }],
      [new QuantumState(1, [complex(0), complex(1)]), { x: 0, y: 0, z: -1 }],
      [new QuantumState(1, [complex(1 / SQRT2), complex(1 / SQRT2)]), { x: 1, y: 0, z: 0 }],
      [new QuantumState(1, [complex(1 / SQRT2), complex(-1 / SQRT2)]), { x: -1, y: 0, z: 0 }],
    ];

    for (const [state, expected] of cases) {
      const v = BlochSphereUtils.stateToBlochVector(state);
      expect(v.x).toBeCloseTo(expected.x, 10);
      expect(v.y).toBeCloseTo(expected.y, 10);
      expect(v.z).toBeCloseTo(expected.z, 10);
    }
  });

  it('S rotates |+⟩ a quarter turn around z: +x → +y', () => {
    let state = new QuantumState(1);
    state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
    state = QuantumOperations.applySingleQubitGate(state, SGate, 0);

    const v = BlochSphereUtils.stateToBlochVector(state);
    expect(v.x).toBeCloseTo(0, 10);
    expect(v.y).toBeCloseTo(1, 10);
  });
});

describe('Pauli algebra sanity', () => {
  it('Y = iXZ on an arbitrary state', () => {
    const input = new QuantumState(1, [complex(0.6, 0.0), complex(0.0, 0.8)]);

    const viaY = QuantumOperations.applySingleQubitGate(input, PauliYGate, 0);

    let viaXZ = QuantumOperations.applySingleQubitGate(input, PauliZGate, 0);
    viaXZ = QuantumOperations.applySingleQubitGate(viaXZ, PauliXGate, 0);

    // Y = iXZ — equal up to the global phase i, so fidelity must be 1.
    expect(QuantumOperations.calculateFidelity(viaY, viaXZ)).toBeCloseTo(1, 10);
  });
});
