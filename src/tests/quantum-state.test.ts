import { describe, it, expect } from 'vitest';
import { complex } from 'mathjs';
import { QuantumState } from '../quantum/state';

describe('QuantumState', () => {
  describe('constructor', () => {
    it('should create a single qubit state in |0⟩', () => {
      const state = new QuantumState(1);
      expect(state.getNumQubits()).toBe(1);
      expect(state.getAmplitude(0).re).toBeCloseTo(1);
      expect(state.getAmplitude(0).im).toBeCloseTo(0);
      expect(state.getAmplitude(1).re).toBeCloseTo(0);
      expect(state.getAmplitude(1).im).toBeCloseTo(0);
    });

    it('should create a two qubit state in |00⟩', () => {
      const state = new QuantumState(2);
      expect(state.getNumQubits()).toBe(2);
      expect(state.getAmplitude(0).re).toBeCloseTo(1); // |00⟩
      expect(state.getAmplitude(1).re).toBeCloseTo(0); // |01⟩
      expect(state.getAmplitude(2).re).toBeCloseTo(0); // |10⟩
      expect(state.getAmplitude(3).re).toBeCloseTo(0); // |11⟩
    });

    it('should throw error for more than 5 qubits', () => {
      expect(() => new QuantumState(6)).toThrow('Maximum 5 qubits supported');
    });

    it('should accept custom initial state', () => {
      const customAmplitudes = [complex(0.6), complex(0.8)];
      const state = new QuantumState(1, customAmplitudes);
      expect(state.getAmplitude(0).re).toBeCloseTo(0.6);
      expect(state.getAmplitude(1).re).toBeCloseTo(0.8);
    });
  });

  describe('measurement probabilities', () => {
    it('should calculate correct probabilities for |0⟩ state', () => {
      const state = new QuantumState(1);
      const probs = state.getMeasurementProbabilities();
      expect(probs[0]).toBeCloseTo(1);
      expect(probs[1]).toBeCloseTo(0);
    });

    it('should calculate correct probabilities for equal superposition', () => {
      const sqrt2 = Math.sqrt(2);
      const amplitudes = [complex(1/sqrt2), complex(1/sqrt2)];
      const state = new QuantumState(1, amplitudes);
      const probs = state.getMeasurementProbabilities();
      expect(probs[0]).toBeCloseTo(0.5);
      expect(probs[1]).toBeCloseTo(0.5);
    });

    it('should calculate qubit measurement probabilities correctly', () => {
      const sqrt2 = Math.sqrt(2);
      const amplitudes = [complex(1/sqrt2), complex(1/sqrt2)];
      const state = new QuantumState(1, amplitudes);
      const { prob0, prob1 } = state.getQubitMeasurementProbabilities(0);
      expect(prob0).toBeCloseTo(0.5);
      expect(prob1).toBeCloseTo(0.5);
    });
  });

  describe('state manipulation', () => {
    it('should set amplitude correctly', () => {
      const state = new QuantumState(1);
      state.setAmplitude(1, complex(1));
      state.setAmplitude(0, complex(0));
      expect(state.getAmplitude(0).re).toBeCloseTo(0);
      expect(state.getAmplitude(1).re).toBeCloseTo(1);
    });

    it('should normalize state after setting amplitude', () => {
      const state = new QuantumState(1);
      state.setAmplitude(0, complex(3));
      state.setAmplitude(1, complex(4));
      const probs = state.getMeasurementProbabilities();
      expect(probs[0] + probs[1]).toBeCloseTo(1);
    });

    it('should convert basis state to string correctly', () => {
      const state = new QuantumState(3);
      expect(state.basisStateToString(0)).toBe('000');
      expect(state.basisStateToString(5)).toBe('101');
      expect(state.basisStateToString(7)).toBe('111');
    });
  });

  describe('state representation', () => {
    it('should return correct string representation for |0⟩', () => {
      const state = new QuantumState(1);
      expect(state.toString()).toContain('|0⟩');
    });

    it('should return correct string representation for superposition', () => {
      const sqrt2 = Math.sqrt(2);
      const amplitudes = [complex(1/sqrt2), complex(1/sqrt2)];
      const state = new QuantumState(1, amplitudes);
      const stateString = state.toString();
      expect(stateString).toContain('|0⟩');
      expect(stateString).toContain('|1⟩');
    });

    it('should clone state correctly', () => {
      const state = new QuantumState(2);
      const cloned = state.clone();
      expect(cloned.getNumQubits()).toBe(state.getNumQubits());
      expect(cloned.getAmplitude(0).re).toBeCloseTo(state.getAmplitude(0).re);
    });
  });
});