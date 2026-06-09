import { describe, it, expect } from 'vitest';
import { QuantumSimulator } from '../quantum/simulator';
import {
  bellStateAlgorithm,
  quantumTeleportationAlgorithm,
  groversSearchAlgorithm,
  quantumFourierTransformAlgorithm,
} from '../algorithms/templates';

describe('Bell state template', () => {
  it('produces (|00⟩ + |11⟩)/√2', () => {
    const simulator = new QuantumSimulator(2);
    const result = simulator.executeCircuit(bellStateAlgorithm.fullCircuit);
    const probs = result.measurementProbabilities;

    expect(probs[0b00]).toBeCloseTo(0.5, 10);
    expect(probs[0b01]).toBeCloseTo(0, 10);
    expect(probs[0b10]).toBeCloseTo(0, 10);
    expect(probs[0b11]).toBeCloseTo(0.5, 10);
  });
});

describe("Grover's search template", () => {
  it('finds the marked item |101⟩ with probability 121/128 after 2 iterations', () => {
    const simulator = new QuantumSimulator(3);
    const result = simulator.executeCircuit(groversSearchAlgorithm.fullCircuit);
    const probs = result.measurementProbabilities;

    expect(probs[0b101]).toBeCloseTo(121 / 128, 10); // ≈ 0.9453

    // every unmarked item sits at 1/128
    for (let i = 0; i < 8; i++) {
      if (i !== 0b101) {
        expect(probs[i]).toBeCloseTo(1 / 128, 10);
      }
    }
  });

  it('reaches 25/32 after a single iteration (step 3 circuit)', () => {
    const simulator = new QuantumSimulator(3);
    const oneIteration = groversSearchAlgorithm.steps[2].gates;
    const result = simulator.executeCircuit(oneIteration);

    expect(result.measurementProbabilities[0b101]).toBeCloseTo(25 / 32, 10);
  });
});

describe('quantum teleportation template (deferred measurement)', () => {
  const a = Math.cos(Math.PI / 6); // |ψ⟩ = a|0⟩ + b|1⟩ prepared by Ry(π/3)
  const b = Math.sin(Math.PI / 6);

  it('transfers the prepared state to qubit 2, unentangled from qubits 0,1', () => {
    const simulator = new QuantumSimulator(3);
    const result = simulator.executeCircuit(quantumTeleportationAlgorithm.fullCircuit);
    const state = result.finalState;

    // Final state must be exactly (1/2)·Σ_{xy}|xy⟩ ⊗ (a|0⟩ + b|1⟩)
    for (let i = 0; i < 8; i++) {
      const q2 = i & 1;
      const expected = (q2 === 0 ? a : b) / 2;
      expect(state.getAmplitude(i).re).toBeCloseTo(expected, 10);
      expect(state.getAmplitude(i).im).toBeCloseTo(0, 10);
    }
  });

  it('gives qubit 2 the source distribution and qubits 0,1 uniform randomness', () => {
    const simulator = new QuantumSimulator(3);
    simulator.executeCircuit(quantumTeleportationAlgorithm.fullCircuit);

    const [q0, q1, q2] = simulator.getQubitProbabilities();
    expect(q2.prob0).toBeCloseTo(a * a, 10); // 3/4
    expect(q2.prob1).toBeCloseTo(b * b, 10); // 1/4
    expect(q0.prob0).toBeCloseTo(0.5, 10);
    expect(q1.prob0).toBeCloseTo(0.5, 10);
  });
});

describe('quantum Fourier transform template', () => {
  it('matches the DFT matrix on every computational basis input', () => {
    const N = 8;
    for (let x = 0; x < N; x++) {
      const simulator = new QuantumSimulator(3);
      const input = new Array(N).fill(0);
      input[x] = 1;
      simulator.setInitialState(input);

      const result = simulator.executeCircuit(quantumFourierTransformAlgorithm.fullCircuit);
      const state = result.finalState;

      for (let y = 0; y < N; y++) {
        const angle = (2 * Math.PI * x * y) / N;
        expect(state.getAmplitude(y).re).toBeCloseTo(Math.cos(angle) / Math.sqrt(N), 10);
        expect(state.getAmplitude(y).im).toBeCloseTo(Math.sin(angle) / Math.sqrt(N), 10);
      }
    }
  });

  it('maps |000⟩ to the uniform superposition', () => {
    const simulator = new QuantumSimulator(3);
    const result = simulator.executeCircuit(quantumFourierTransformAlgorithm.fullCircuit);

    for (const prob of result.measurementProbabilities) {
      expect(prob).toBeCloseTo(1 / 8, 10);
    }
  });
});
