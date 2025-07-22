import { CircuitElement } from './quantum';

export interface AlgorithmStep {
  id: string;
  title: string;
  description: string;
  gates: CircuitElement[];
  explanation: string;
  mathematicalContext?: string;
  expectedOutcome?: string;
}

export interface QuantumAlgorithm {
  id: string;
  name: string;
  description: string;
  category: 'entanglement' | 'communication' | 'search' | 'transform' | 'arithmetic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  qubitsRequired: number;
  classicalBitsRequired?: number;
  steps: AlgorithmStep[];
  fullCircuit: CircuitElement[];
  learningObjectives: string[];
  prerequisites: string[];
  applications: string[];
  complexity: {
    time: string;
    space: string;
  };
  references?: string[];
}

export interface AlgorithmExecution {
  algorithmId: string;
  currentStep: number;
  isExecuting: boolean;
  results?: {
    stepResults: Array<{
      stepId: string;
      finalState: string;
      probabilities: Record<string, number>;
      measurements?: number[];
    }>;
    finalResult: {
      success: boolean;
      output: any;
      fidelity?: number;
    };
  };
}