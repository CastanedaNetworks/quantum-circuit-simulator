import { describe, it, expect, beforeEach } from 'vitest';
import { QuantumSimulator } from '../quantum/simulator';
import { HadamardGate, PauliXGate, CNOTGate } from '../quantum/gates';

describe('QuantumSimulator', () => {
  let simulator: QuantumSimulator;

  beforeEach(() => {
    simulator = new QuantumSimulator(2);
  });

  describe('initialization', () => {
    it('should initialize with correct number of qubits', () => {
      expect(simulator.getNumQubits()).toBe(2);
    });

    it('should start in |00⟩ state', () => {
      const state = simulator.getCurrentState();
      expect(state.getAmplitude(0).re).toBeCloseTo(1);
      expect(state.getAmplitude(1).re).toBeCloseTo(0);
      expect(state.getAmplitude(2).re).toBeCloseTo(0);
      expect(state.getAmplitude(3).re).toBeCloseTo(0);
    });

    it('should throw error for invalid qubit count', () => {
      expect(() => new QuantumSimulator(0)).toThrow('Number of qubits must be between 1 and 5');
      expect(() => new QuantumSimulator(6)).toThrow('Number of qubits must be between 1 and 5');
    });
  });

  describe('gate application', () => {
    it('should apply single gate correctly', () => {
      simulator.applyGate(PauliXGate, [0]);
      
      const state = simulator.getCurrentState();
      // Should be in |10⟩ state
      expect(state.getAmplitude(0).re).toBeCloseTo(0); // |00⟩
      expect(state.getAmplitude(1).re).toBeCloseTo(0); // |01⟩
      expect(state.getAmplitude(2).re).toBeCloseTo(1); // |10⟩
      expect(state.getAmplitude(3).re).toBeCloseTo(0); // |11⟩
    });

    it('should apply multiple gates in sequence', () => {
      simulator.applyGate(HadamardGate, [0]);
      simulator.applyGate(CNOTGate, [0, 1]);
      
      const state = simulator.getCurrentState();
      const sqrt2 = Math.sqrt(2);
      
      // Should be in Bell state: (|00⟩ + |11⟩)/√2
      expect(state.getAmplitude(0).re).toBeCloseTo(1/sqrt2);
      expect(state.getAmplitude(1).re).toBeCloseTo(0);
      expect(state.getAmplitude(2).re).toBeCloseTo(0);
      expect(state.getAmplitude(3).re).toBeCloseTo(1/sqrt2);
    });

    it('should track execution history', () => {
      simulator.applyGate(HadamardGate, [0]);
      simulator.applyGate(PauliXGate, [1]);
      
      const log = simulator.getExecutionLog();
      expect(log).toHaveLength(3); // Initial + 2 gates
      expect(log[1]).toContain('Hadamard');
      expect(log[2]).toContain('Pauli-X');
    });
  });

  describe('circuit execution', () => {
    it('should execute complete circuit', () => {
      const circuit = [
        { gate: HadamardGate, targetQubits: [0], position: 0 },
        { gate: CNOTGate, targetQubits: [0, 1], position: 1 }
      ];
      
      const result = simulator.executeCircuit(circuit);
      
      expect(result.finalState).toBeDefined();
      expect(result.measurementProbabilities).toHaveLength(4);
      expect(result.stateHistory).toHaveLength(3); // Initial + 2 gates
      expect(result.executionLog).toHaveLength(3);
    });

    it('should execute gates in correct order', () => {
      const circuit = [
        { gate: PauliXGate, targetQubits: [1], position: 1 },
        { gate: HadamardGate, targetQubits: [0], position: 0 }
      ];
      
      simulator.executeCircuit(circuit);
      
      const log = simulator.getExecutionLog();
      expect(log[1]).toContain('Hadamard'); // Should be applied first (position 0)
      expect(log[2]).toContain('Pauli-X');  // Should be applied second (position 1)
    });
  });

  describe('measurement', () => {
    it('should measure qubit in definite state', () => {
      const result = simulator.measureQubit(0);
      
      expect(result.qubitIndex).toBe(0);
      expect(result.result).toBe(0);
      expect(result.probability).toBeCloseTo(1);
    });

    it('should measure all qubits', () => {
      const { results, probabilities } = simulator.measureAll();
      
      expect(results).toEqual([0, 0]);
      expect(probabilities[0]).toBeCloseTo(1);
    });

    it('should update execution log after measurement', () => {
      simulator.measureQubit(0);
      
      const log = simulator.getExecutionLog();
      expect(log[log.length - 1]).toContain('Measured qubit 0');
    });
  });

  describe('probability calculations', () => {
    it('should calculate measurement probabilities correctly', () => {
      simulator.applyGate(HadamardGate, [0]);
      
      const probs = simulator.getMeasurementProbabilities();
      expect(probs).toHaveLength(2); // Only non-zero probabilities
      expect(probs[0].probability).toBeCloseTo(0.5);
      expect(probs[1].probability).toBeCloseTo(0.5);
    });

    it('should calculate individual qubit probabilities', () => {
      simulator.applyGate(HadamardGate, [0]);
      
      const qubitProbs = simulator.getQubitProbabilities();
      expect(qubitProbs[0].prob0).toBeCloseTo(0.5);
      expect(qubitProbs[0].prob1).toBeCloseTo(0.5);
      expect(qubitProbs[1].prob0).toBeCloseTo(1);
      expect(qubitProbs[1].prob1).toBeCloseTo(0);
    });

    it('should calculate expectation values correctly', () => {
      const expVal0 = simulator.getExpectationValueZ(0);
      expect(expVal0).toBeCloseTo(1); // |0⟩ has Z expectation value +1
      
      simulator.applyGate(PauliXGate, [0]);
      const expVal1 = simulator.getExpectationValueZ(0);
      expect(expVal1).toBeCloseTo(-1); // |1⟩ has Z expectation value -1
    });
  });

  describe('state manipulation', () => {
    it('should reset to initial state', () => {
      simulator.applyGate(HadamardGate, [0]);
      simulator.reset();
      
      const state = simulator.getCurrentState();
      expect(state.getAmplitude(0).re).toBeCloseTo(1);
      expect(simulator.getExecutionLog()).toHaveLength(1);
    });

    it('should set custom initial state', () => {
      simulator.setInitialState([0, 0, 0, 1]); // |11⟩ state
      
      const state = simulator.getCurrentState();
      expect(state.getAmplitude(3).re).toBeCloseTo(1);
    });

    it('should create superposition state', () => {
      simulator.createSuperposition();
      
      const probs = simulator.getMeasurementProbabilities();
      probs.forEach(({ probability }) => {
        expect(probability).toBeCloseTo(0.25); // Equal probability for 4 states
      });
    });

    it('should throw error for invalid initial state', () => {
      expect(() => simulator.setInitialState([1, 0])) // Wrong length
        .toThrow('Initial state must have 4 amplitudes');
    });
  });

  describe('utility functions', () => {
    it('should return state string representation', () => {
      const stateString = simulator.getStateString();
      expect(stateString).toContain('|00⟩');
    });

    it('should calculate fidelity with another state', () => {
      const state = simulator.getCurrentState();
      const fidelity = simulator.calculateFidelity(state);
      expect(fidelity).toBeCloseTo(1);
    });

    it('should export simulation data', () => {
      simulator.applyGate(HadamardGate, [0]);
      
      const data = simulator.exportSimulationData();
      expect(data.numQubits).toBe(2);
      expect(data.finalState).toContain('|0');
      expect(data.measurementProbabilities).toHaveLength(2);
      expect(data.executionLog).toHaveLength(2);
    });

    it('should provide state history', () => {
      simulator.applyGate(HadamardGate, [0]);
      simulator.applyGate(PauliXGate, [1]);
      
      const history = simulator.getStateHistory();
      expect(history).toHaveLength(3); // Initial + 2 gates
    });
  });
});