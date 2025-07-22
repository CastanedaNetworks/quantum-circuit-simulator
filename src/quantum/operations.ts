import { Complex, complex, multiply, add } from 'mathjs';
import { QuantumState } from './state';
import { QuantumGate } from '../types/quantum';

export class QuantumOperations {
  
  // Apply a single-qubit gate to a specific qubit
  static applySingleQubitGate(state: QuantumState, gate: QuantumGate, targetQubit: number): QuantumState {
    if (gate.qubits !== 1) {
      throw new Error('Gate must be a single-qubit gate');
    }
    
    if (targetQubit < 0 || targetQubit >= state.getNumQubits()) {
      throw new Error(`Target qubit ${targetQubit} out of range`);
    }

    const numQubits = state.getNumQubits();
    const numStates = Math.pow(2, numQubits);
    const newAmplitudes: Complex[] = new Array(numStates).fill(complex(0));

    for (let i = 0; i < numStates; i++) {
      // Extract the bit at targetQubit position (from right, 0-indexed)
      const qubitBit = (i >> (numQubits - 1 - targetQubit)) & 1;
      
      // Calculate the corresponding states when this qubit is |0⟩ and |1⟩
      const state0 = i & ~(1 << (numQubits - 1 - targetQubit)); // Set target bit to 0
      const state1 = i | (1 << (numQubits - 1 - targetQubit));  // Set target bit to 1

      if (qubitBit === 0) {
        // This state has the target qubit as |0⟩
        const amp0 = multiply(gate.matrix[0][0], state.getAmplitude(state0)) as Complex;
        const amp1 = multiply(gate.matrix[0][1], state.getAmplitude(state1)) as Complex;
        newAmplitudes[i] = add(amp0, amp1) as Complex;
      } else {
        // This state has the target qubit as |1⟩
        const amp0 = multiply(gate.matrix[1][0], state.getAmplitude(state0)) as Complex;
        const amp1 = multiply(gate.matrix[1][1], state.getAmplitude(state1)) as Complex;
        newAmplitudes[i] = add(amp0, amp1) as Complex;
      }
    }

    return new QuantumState(numQubits, newAmplitudes);
  }

  // Apply a two-qubit gate (like CNOT)
  static applyTwoQubitGate(state: QuantumState, gate: QuantumGate, controlQubit: number, targetQubit: number): QuantumState {
    if (gate.qubits !== 2) {
      throw new Error('Gate must be a two-qubit gate');
    }

    if (controlQubit < 0 || controlQubit >= state.getNumQubits() ||
        targetQubit < 0 || targetQubit >= state.getNumQubits()) {
      throw new Error('Qubit indices out of range');
    }

    if (controlQubit === targetQubit) {
      throw new Error('Control and target qubits must be different');
    }

    const numQubits = state.getNumQubits();
    const numStates = Math.pow(2, numQubits);
    const newAmplitudes: Complex[] = new Array(numStates).fill(complex(0));

    for (let i = 0; i < numStates; i++) {
      // Extract control and target qubit values
      const controlBit = (i >> (numQubits - 1 - controlQubit)) & 1;
      const targetBit = (i >> (numQubits - 1 - targetQubit)) & 1;
      
      // Map to 2-qubit basis state (control, target)
      const twoQubitState = (controlBit << 1) | targetBit;
      
      // Calculate all four possible two-qubit states for this configuration
      const states = [
        i & ~(1 << (numQubits - 1 - controlQubit)) & ~(1 << (numQubits - 1 - targetQubit)), // |00⟩
        i & ~(1 << (numQubits - 1 - controlQubit)) | (1 << (numQubits - 1 - targetQubit)),  // |01⟩
        i | (1 << (numQubits - 1 - controlQubit)) & ~(1 << (numQubits - 1 - targetQubit)),  // |10⟩
        i | (1 << (numQubits - 1 - controlQubit)) | (1 << (numQubits - 1 - targetQubit))   // |11⟩
      ];

      // Apply the gate matrix
      for (let j = 0; j < 4; j++) {
        const amplitude = multiply(gate.matrix[twoQubitState][j], state.getAmplitude(states[j])) as Complex;
        newAmplitudes[i] = add(newAmplitudes[i], amplitude) as Complex;
      }
    }

    return new QuantumState(numQubits, newAmplitudes);
  }

  // Apply a general quantum gate
  static applyGate(state: QuantumState, gate: QuantumGate, targetQubits: number[]): QuantumState {
    if (targetQubits.length !== gate.qubits) {
      throw new Error(`Gate requires ${gate.qubits} target qubits, but ${targetQubits.length} provided`);
    }

    if (gate.qubits === 1) {
      return this.applySingleQubitGate(state, gate, targetQubits[0]);
    } else if (gate.qubits === 2) {
      return this.applyTwoQubitGate(state, gate, targetQubits[0], targetQubits[1]);
    } else {
      throw new Error(`Gates with ${gate.qubits} qubits not supported`);
    }
  }

  // Measure a specific qubit (collapses the state)
  static measureQubit(state: QuantumState, qubitIndex: number): { result: 0 | 1; newState: QuantumState } {
    const { prob0, prob1 } = state.getQubitMeasurementProbabilities(qubitIndex);
    
    // Simulate quantum measurement with random outcome
    const random = Math.random();
    const result: 0 | 1 = random < prob0 ? 0 : 1;
    
    // Collapse the state based on measurement result
    const numQubits = state.getNumQubits();
    const numStates = Math.pow(2, numQubits);
    const newAmplitudes: Complex[] = new Array(numStates).fill(complex(0));
    
    const normalizationFactor = result === 0 ? Math.sqrt(prob0) : Math.sqrt(prob1);
    
    for (let i = 0; i < numStates; i++) {
      const qubitValue = (i >> (numQubits - 1 - qubitIndex)) & 1;
      
      if (qubitValue === result) {
        newAmplitudes[i] = multiply(state.getAmplitude(i), complex(1 / normalizationFactor)) as Complex;
      }
    }
    
    return {
      result,
      newState: new QuantumState(numQubits, newAmplitudes)
    };
  }

  // Measure all qubits (complete measurement)
  static measureAll(state: QuantumState): { results: number[]; probabilities: number[] } {
    const probabilities = state.getMeasurementProbabilities();
    
    // Choose outcome based on probabilities
    const random = Math.random();
    let cumulativeProb = 0;
    let measuredState = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProb += probabilities[i];
      if (random <= cumulativeProb) {
        measuredState = i;
        break;
      }
    }
    
    // Convert measured state to individual qubit results
    const numQubits = state.getNumQubits();
    const results: number[] = [];
    
    for (let i = 0; i < numQubits; i++) {
      const qubitValue = (measuredState >> (numQubits - 1 - i)) & 1;
      results.push(qubitValue);
    }
    
    return { results, probabilities };
  }

  // Calculate fidelity between two quantum states
  static calculateFidelity(state1: QuantumState, state2: QuantumState): number {
    if (state1.getNumQubits() !== state2.getNumQubits()) {
      throw new Error('States must have the same number of qubits');
    }

    const amplitudes1 = state1.getAmplitudes();
    const amplitudes2 = state2.getAmplitudes();
    
    let innerProduct = complex(0);
    
    for (let i = 0; i < amplitudes1.length; i++) {
      // Complex conjugate of first amplitude times second amplitude
      const conj1 = complex(amplitudes1[i].re, -amplitudes1[i].im);
      innerProduct = add(innerProduct, multiply(conj1, amplitudes2[i])) as Complex;
    }
    
    return Math.pow(Math.abs(innerProduct as any), 2);
  }
}