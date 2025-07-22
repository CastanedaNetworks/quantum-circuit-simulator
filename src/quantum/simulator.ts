import { QuantumState } from './state';
import { QuantumOperations } from './operations';
import { QuantumGate, CircuitElement } from '../types/quantum';
import { complex } from 'mathjs';

export interface SimulationResult {
  finalState: QuantumState;
  measurementProbabilities: number[];
  stateHistory: QuantumState[];
  executionLog: string[];
}

export interface MeasurementResult {
  qubitIndex: number;
  result: 0 | 1;
  probability: number;
}

export class QuantumSimulator {
  private numQubits: number;
  private currentState!: QuantumState;
  private stateHistory!: QuantumState[];
  private executionLog!: string[];

  constructor(numQubits: number) {
    console.log('[QuantumSimulator] Creating simulator with', numQubits, 'qubits');
    
    if (numQubits < 1 || numQubits > 5) {
      const error = new Error('Number of qubits must be between 1 and 5');
      console.error('[QuantumSimulator] Constructor error:', error);
      throw error;
    }
    
    this.numQubits = numQubits;
    console.log('[QuantumSimulator] Calling reset...');
    this.reset();
    console.log('[QuantumSimulator] Constructor completed successfully');
  }

  // Reset the simulator to initial state |0...0⟩
  reset(): void {
    console.log('[QuantumSimulator] Resetting simulator');
    try {
      this.currentState = new QuantumState(this.numQubits);
      this.stateHistory = [this.currentState.clone()];
      this.executionLog = [`Initialized ${this.numQubits}-qubit system in |${'0'.repeat(this.numQubits)}⟩ state`];
      console.log('[QuantumSimulator] Reset completed successfully');
    } catch (error) {
      console.error('[QuantumSimulator] Error during reset:', error);
      throw error;
    }
  }

  // Get current quantum state
  getCurrentState(): QuantumState {
    return this.currentState.clone();
  }

  // Get number of qubits
  getNumQubits(): number {
    return this.numQubits;
  }

  // Apply a single gate to the circuit
  applyGate(gate: QuantumGate, targetQubits: number[]): void {
    try {
      this.currentState = QuantumOperations.applyGate(this.currentState, gate, targetQubits);
      this.stateHistory.push(this.currentState.clone());
      
      const qubitString = targetQubits.map(q => `q${q}`).join(', ');
      this.executionLog.push(`Applied ${gate.name} gate to qubit(s): ${qubitString}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.executionLog.push(`Error applying ${gate.name} gate: ${errorMessage}`);
      throw error;
    }
  }

  // Execute a complete quantum circuit
  executeCircuit(circuit: CircuitElement[]): SimulationResult {
    // Sort circuit elements by position to ensure correct execution order
    const sortedCircuit = [...circuit].sort((a, b) => a.position - b.position);
    
    for (const element of sortedCircuit) {
      this.applyGate(element.gate, element.targetQubits);
    }

    return {
      finalState: this.currentState.clone(),
      measurementProbabilities: this.currentState.getMeasurementProbabilities(),
      stateHistory: this.stateHistory.map(state => state.clone()),
      executionLog: [...this.executionLog]
    };
  }

  // Measure a specific qubit
  measureQubit(qubitIndex: number): MeasurementResult {
    const { prob0, prob1 } = this.currentState.getQubitMeasurementProbabilities(qubitIndex);
    const { result, newState } = QuantumOperations.measureQubit(this.currentState, qubitIndex);
    
    this.currentState = newState;
    this.stateHistory.push(this.currentState.clone());
    
    const probability = result === 0 ? prob0 : prob1;
    this.executionLog.push(`Measured qubit ${qubitIndex}: ${result} (probability: ${probability.toFixed(4)})`);
    
    return {
      qubitIndex,
      result,
      probability
    };
  }

  // Measure all qubits
  measureAll(): { results: number[]; probabilities: number[] } {
    const { results, probabilities } = QuantumOperations.measureAll(this.currentState);
    
    // Create final collapsed state
    const finalStateIndex = results.reduce((acc, bit, idx) => 
      acc + bit * Math.pow(2, this.numQubits - 1 - idx), 0
    );
    
    const collapsedAmplitudes = new Array(Math.pow(2, this.numQubits)).fill(complex(0));
    collapsedAmplitudes[finalStateIndex] = complex(1);
    
    this.currentState = new QuantumState(this.numQubits, collapsedAmplitudes);
    this.stateHistory.push(this.currentState.clone());
    
    const resultString = results.join('');
    this.executionLog.push(`Measured all qubits: |${resultString}⟩`);
    
    return { results, probabilities };
  }

  // Get measurement probabilities for all basis states
  getMeasurementProbabilities(): { state: string; probability: number }[] {
    const probabilities = this.currentState.getMeasurementProbabilities();
    
    return probabilities.map((prob, index) => ({
      state: this.currentState.basisStateToString(index),
      probability: prob
    })).filter(item => item.probability > 1e-10); // Only show non-negligible probabilities
  }

  // Get measurement probabilities for each individual qubit
  getQubitProbabilities(): Array<{ qubit: number; prob0: number; prob1: number }> {
    const result = [];
    
    for (let i = 0; i < this.numQubits; i++) {
      const { prob0, prob1 } = this.currentState.getQubitMeasurementProbabilities(i);
      result.push({
        qubit: i,
        prob0,
        prob1
      });
    }
    
    return result;
  }

  // Calculate the expectation value of Pauli-Z operator on a qubit
  getExpectationValueZ(qubitIndex: number): number {
    const { prob0, prob1 } = this.currentState.getQubitMeasurementProbabilities(qubitIndex);
    return prob0 - prob1; // Z eigenvalues are +1 for |0⟩ and -1 for |1⟩
  }

  // Get execution history
  getExecutionLog(): string[] {
    return [...this.executionLog];
  }

  // Get state history
  getStateHistory(): QuantumState[] {
    return this.stateHistory.map(state => state.clone());
  }

  // Set a custom initial state
  setInitialState(amplitudes: number[]): void {
    if (amplitudes.length !== Math.pow(2, this.numQubits)) {
      throw new Error(`Initial state must have ${Math.pow(2, this.numQubits)} amplitudes`);
    }
    
    const complexAmplitudes = amplitudes.map(amp => complex(amp));
    this.currentState = new QuantumState(this.numQubits, complexAmplitudes);
    this.stateHistory = [this.currentState.clone()];
    this.executionLog = [`Set custom initial state`];
  }

  // Create superposition state (equal superposition of all basis states)
  createSuperposition(): void {
    const numStates = Math.pow(2, this.numQubits);
    const amplitude = complex(1 / Math.sqrt(numStates));
    const amplitudes = new Array(numStates).fill(amplitude);
    
    this.currentState = new QuantumState(this.numQubits, amplitudes);
    this.stateHistory = [this.currentState.clone()];
    this.executionLog = [`Created equal superposition state`];
  }

  // Get current state as string representation
  getStateString(): string {
    return this.currentState.toString();
  }

  // Calculate fidelity with another state
  calculateFidelity(otherState: QuantumState): number {
    return QuantumOperations.calculateFidelity(this.currentState, otherState);
  }

  // Export simulation data
  exportSimulationData(): {
    numQubits: number;
    finalState: string;
    measurementProbabilities: { state: string; probability: number }[];
    executionLog: string[];
  } {
    return {
      numQubits: this.numQubits,
      finalState: this.getStateString(),
      measurementProbabilities: this.getMeasurementProbabilities(),
      executionLog: this.getExecutionLog()
    };
  }
}