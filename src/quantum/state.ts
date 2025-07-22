import { Complex, complex, multiply, abs } from 'mathjs';

export class QuantumState {
  private amplitudes: Complex[];
  private numQubits: number;

  constructor(numQubits: number, initialState?: Complex[]) {
    console.log('[QuantumState] Creating quantum state with', numQubits, 'qubits');
    
    if (numQubits > 5) {
      const error = new Error('Maximum 5 qubits supported');
      console.error('[QuantumState] Constructor error:', error);
      throw error;
    }
    
    this.numQubits = numQubits;
    const numStates = Math.pow(2, numQubits);
    console.log('[QuantumState] Number of states:', numStates);
    
    if (initialState) {
      console.log('[QuantumState] Using provided initial state');
      if (initialState.length !== numStates) {
        const error = new Error(`Initial state must have ${numStates} amplitudes for ${numQubits} qubits`);
        console.error('[QuantumState] Initial state length error:', error);
        throw error;
      }
      this.amplitudes = [...initialState];
    } else {
      console.log('[QuantumState] Creating default |0...0⟩ state');
      // Initialize to |0...0⟩ state
      this.amplitudes = new Array(numStates).fill(complex(0));
      this.amplitudes[0] = complex(1);
    }
    
    console.log('[QuantumState] Normalizing state...');
    this.normalize();
    console.log('[QuantumState] Constructor completed successfully');
  }

  // Get the state vector
  getAmplitudes(): Complex[] {
    return [...this.amplitudes];
  }

  // Get number of qubits
  getNumQubits(): number {
    return this.numQubits;
  }

  // Normalize the state vector
  private normalize(): void {
    const norm = Math.sqrt(
      this.amplitudes.reduce((sum, amp) => sum + Math.pow(Number(abs(amp)), 2), 0)
    );
    
    if (norm === 0) {
      throw new Error('Cannot normalize zero state');
    }
    
    this.amplitudes = this.amplitudes.map(amp => 
      multiply(amp, complex(1 / norm)) as Complex
    );
  }

  // Set amplitude at a specific basis state
  setAmplitude(basisState: number, amplitude: Complex): void {
    if (basisState < 0 || basisState >= this.amplitudes.length) {
      throw new Error(`Basis state ${basisState} out of range`);
    }
    this.amplitudes[basisState] = amplitude;
    this.normalize();
  }

  // Get amplitude at a specific basis state
  getAmplitude(basisState: number): Complex {
    if (basisState < 0 || basisState >= this.amplitudes.length) {
      throw new Error(`Basis state ${basisState} out of range`);
    }
    return this.amplitudes[basisState];
  }

  // Calculate measurement probabilities for all basis states
  getMeasurementProbabilities(): number[] {
    return this.amplitudes.map(amp => Math.pow(Number(abs(amp)), 2));
  }

  // Calculate measurement probability for a specific basis state
  getMeasurementProbability(basisState: number): number {
    if (basisState < 0 || basisState >= this.amplitudes.length) {
      throw new Error(`Basis state ${basisState} out of range`);
    }
    return Math.pow(Number(abs(this.amplitudes[basisState])), 2);
  }

  // Calculate measurement probabilities for a specific qubit
  getQubitMeasurementProbabilities(qubitIndex: number): { prob0: number; prob1: number } {
    if (qubitIndex < 0 || qubitIndex >= this.numQubits) {
      throw new Error(`Qubit index ${qubitIndex} out of range`);
    }

    let prob0 = 0;
    let prob1 = 0;

    for (let i = 0; i < this.amplitudes.length; i++) {
      const probability = Math.pow(Number(abs(this.amplitudes[i])), 2);
      
      // Check if qubit at position qubitIndex is 0 or 1 in binary representation
      const qubitValue = (i >> (this.numQubits - 1 - qubitIndex)) & 1;
      
      if (qubitValue === 0) {
        prob0 += probability;
      } else {
        prob1 += probability;
      }
    }

    return { prob0, prob1 };
  }

  // Convert basis state index to binary string representation
  basisStateToString(basisState: number): string {
    return basisState.toString(2).padStart(this.numQubits, '0');
  }

  // Get string representation of the quantum state
  toString(): string {
    const terms: string[] = [];
    
    for (let i = 0; i < this.amplitudes.length; i++) {
      const amp = this.amplitudes[i];
      const magnitude = Number(abs(amp));
      
      if (magnitude > 1e-10) { // Only show non-negligible amplitudes
        const basisState = this.basisStateToString(i);
        const ampStr = amp.toString();
        terms.push(`${ampStr}|${basisState}⟩`);
      }
    }
    
    return terms.join(' + ') || '0';
  }

  // Clone the quantum state
  clone(): QuantumState {
    return new QuantumState(this.numQubits, this.amplitudes);
  }
}