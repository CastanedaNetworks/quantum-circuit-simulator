import { describe, it, expect } from 'vitest';
import { complex } from 'mathjs';
import { QuantumState } from '../quantum/state';
import { QuantumOperations } from '../quantum/operations';
import { HadamardGate, PauliXGate, PauliYGate, PauliZGate, CNOTGate } from '../quantum/gates';

describe('QuantumOperations', () => {
  describe('single qubit gates', () => {
    it('should apply Hadamard gate correctly to |0⟩', () => {
      const state = new QuantumState(1);
      const newState = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
      
      const sqrt2 = Math.sqrt(2);
      expect(newState.getAmplitude(0).re).toBeCloseTo(1/sqrt2, 10);
      expect(newState.getAmplitude(1).re).toBeCloseTo(1/sqrt2, 10);
    });

    it('should apply Hadamard gate correctly to |1⟩', () => {
      const state = new QuantumState(1);
      state.setAmplitude(0, complex(0));
      state.setAmplitude(1, complex(1));
      
      const newState = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
      
      const sqrt2 = Math.sqrt(2);
      expect(newState.getAmplitude(0).re).toBeCloseTo(1/sqrt2, 10);
      expect(newState.getAmplitude(1).re).toBeCloseTo(-1/sqrt2, 10);
    });

    it('should apply Pauli-X gate correctly (bit flip)', () => {
      const state = new QuantumState(1);
      const newState = QuantumOperations.applySingleQubitGate(state, PauliXGate, 0);
      
      expect(newState.getAmplitude(0).re).toBeCloseTo(0);
      expect(newState.getAmplitude(1).re).toBeCloseTo(1);
    });

    it('should apply Pauli-Y gate correctly', () => {
      const state = new QuantumState(1);
      const newState = QuantumOperations.applySingleQubitGate(state, PauliYGate, 0);
      
      expect(newState.getAmplitude(0).re).toBeCloseTo(0);
      expect(newState.getAmplitude(1).im).toBeCloseTo(1);
    });

    it('should apply Pauli-Z gate correctly', () => {
      const sqrt2 = Math.sqrt(2);
      const amplitudes = [complex(1/sqrt2), complex(1/sqrt2)];
      const state = new QuantumState(1, amplitudes);
      
      const newState = QuantumOperations.applySingleQubitGate(state, PauliZGate, 0);
      
      expect(newState.getAmplitude(0).re).toBeCloseTo(1/sqrt2);
      expect(newState.getAmplitude(1).re).toBeCloseTo(-1/sqrt2);
    });

    it('should apply gate to correct qubit in multi-qubit system', () => {
      const state = new QuantumState(2);
      const newState = QuantumOperations.applySingleQubitGate(state, PauliXGate, 1);
      
      // Should flip second qubit: |00⟩ → |01⟩
      expect(newState.getAmplitude(0).re).toBeCloseTo(0); // |00⟩
      expect(newState.getAmplitude(1).re).toBeCloseTo(1); // |01⟩
      expect(newState.getAmplitude(2).re).toBeCloseTo(0); // |10⟩
      expect(newState.getAmplitude(3).re).toBeCloseTo(0); // |11⟩
    });
  });

  describe('two qubit gates', () => {
    it('should apply CNOT gate correctly to |00⟩', () => {
      const state = new QuantumState(2);
      const newState = QuantumOperations.applyTwoQubitGate(state, CNOTGate, 0, 1);
      
      // |00⟩ should remain |00⟩
      expect(newState.getAmplitude(0).re).toBeCloseTo(1);
      expect(newState.getAmplitude(1).re).toBeCloseTo(0);
      expect(newState.getAmplitude(2).re).toBeCloseTo(0);
      expect(newState.getAmplitude(3).re).toBeCloseTo(0);
    });

    it('should apply CNOT gate correctly to |10⟩', () => {
      const state = new QuantumState(2);
      state.setAmplitude(0, complex(0));
      state.setAmplitude(2, complex(1)); // |10⟩
      
      const newState = QuantumOperations.applyTwoQubitGate(state, CNOTGate, 0, 1);
      
      // |10⟩ should become |11⟩
      expect(newState.getAmplitude(0).re).toBeCloseTo(0);
      expect(newState.getAmplitude(1).re).toBeCloseTo(0);
      expect(newState.getAmplitude(2).re).toBeCloseTo(0);
      expect(newState.getAmplitude(3).re).toBeCloseTo(1);
    });

    it('should create Bell state with Hadamard + CNOT', () => {
      let state = new QuantumState(2);
      
      // Apply Hadamard to first qubit
      state = QuantumOperations.applySingleQubitGate(state, HadamardGate, 0);
      
      // Apply CNOT with first as control, second as target
      state = QuantumOperations.applyTwoQubitGate(state, CNOTGate, 0, 1);
      
      const sqrt2 = Math.sqrt(2);
      expect(state.getAmplitude(0).re).toBeCloseTo(1/sqrt2); // |00⟩
      expect(state.getAmplitude(1).re).toBeCloseTo(0);       // |01⟩
      expect(state.getAmplitude(2).re).toBeCloseTo(0);       // |10⟩
      expect(state.getAmplitude(3).re).toBeCloseTo(1/sqrt2); // |11⟩
    });
  });

  describe('general gate application', () => {
    it('should apply single qubit gate through general interface', () => {
      const state = new QuantumState(1);
      const newState = QuantumOperations.applyGate(state, PauliXGate, [0]);
      
      expect(newState.getAmplitude(0).re).toBeCloseTo(0);
      expect(newState.getAmplitude(1).re).toBeCloseTo(1);
    });

    it('should apply two qubit gate through general interface', () => {
      const state = new QuantumState(2);
      state.setAmplitude(0, complex(0));
      state.setAmplitude(2, complex(1)); // |10⟩
      
      const newState = QuantumOperations.applyGate(state, CNOTGate, [0, 1]);
      
      expect(newState.getAmplitude(3).re).toBeCloseTo(1); // Should be |11⟩
    });

    it('should throw error for mismatched qubit count', () => {
      const state = new QuantumState(2);
      expect(() => QuantumOperations.applyGate(state, PauliXGate, [0, 1]))
        .toThrow('Gate requires 1 target qubits, but 2 provided');
    });
  });

  describe('measurement operations', () => {
    it('should measure qubit in definite state correctly', () => {
      const state = new QuantumState(1);
      const { result, newState } = QuantumOperations.measureQubit(state, 0);
      
      expect(result).toBe(0);
      expect(newState.getAmplitude(0).re).toBeCloseTo(1);
      expect(newState.getAmplitude(1).re).toBeCloseTo(0);
    });

    it('should collapse superposition state after measurement', () => {
      const sqrt2 = Math.sqrt(2);
      const amplitudes = [complex(1/sqrt2), complex(1/sqrt2)];
      const state = new QuantumState(1, amplitudes);
      
      const { result, newState } = QuantumOperations.measureQubit(state, 0);
      
      expect([0, 1]).toContain(result);
      
      if (result === 0) {
        expect(newState.getAmplitude(0).re).toBeCloseTo(1);
        expect(newState.getAmplitude(1).re).toBeCloseTo(0);
      } else {
        expect(newState.getAmplitude(0).re).toBeCloseTo(0);
        expect(newState.getAmplitude(1).re).toBeCloseTo(1);
      }
    });

    it('should measure all qubits correctly', () => {
      const state = new QuantumState(2);
      const { results, probabilities } = QuantumOperations.measureAll(state);
      
      expect(results).toEqual([0, 0]);
      expect(probabilities[0]).toBeCloseTo(1);
    });
  });

  describe('fidelity calculation', () => {
    it('should calculate fidelity of identical states as 1', () => {
      const state1 = new QuantumState(1);
      const state2 = new QuantumState(1);
      
      const fidelity = QuantumOperations.calculateFidelity(state1, state2);
      expect(fidelity).toBeCloseTo(1);
    });

    it('should calculate fidelity of orthogonal states as 0', () => {
      const state1 = new QuantumState(1);
      
      const state2 = new QuantumState(1);
      state2.setAmplitude(0, complex(0));
      state2.setAmplitude(1, complex(1));
      
      const fidelity = QuantumOperations.calculateFidelity(state1, state2);
      expect(fidelity).toBeCloseTo(0);
    });

    it('should calculate fidelity of superposition states correctly', () => {
      const sqrt2 = Math.sqrt(2);
      
      const state1 = new QuantumState(1);
      const state2 = new QuantumState(1, [complex(1/sqrt2), complex(1/sqrt2)]);
      
      const fidelity = QuantumOperations.calculateFidelity(state1, state2);
      expect(fidelity).toBeCloseTo(0.5);
    });

    it('should throw error for different sized states', () => {
      const state1 = new QuantumState(1);
      const state2 = new QuantumState(2);
      
      expect(() => QuantumOperations.calculateFidelity(state1, state2))
        .toThrow('States must have the same number of qubits');
    });
  });
});