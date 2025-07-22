import { QuantumAlgorithm } from '../types/algorithms';
import { HadamardGate, PauliXGate, PauliZGate, CNOTGate } from '../quantum/gates';

// Bell State Preparation Algorithm
export const bellStateAlgorithm: QuantumAlgorithm = {
  id: 'bell-state',
  name: 'Bell State Preparation',
  description: 'Create maximally entangled two-qubit Bell states (EPR pairs)',
  category: 'entanglement',
  difficulty: 'beginner',
  qubitsRequired: 2,
  learningObjectives: [
    'Understand quantum entanglement',
    'Learn about Bell states and their properties',
    'Practice creating superposition and entanglement',
    'Observe non-local correlations'
  ],
  prerequisites: [
    'Basic knowledge of qubits and quantum states',
    'Understanding of Hadamard and CNOT gates',
    'Familiarity with quantum superposition'
  ],
  applications: [
    'Quantum cryptography (QKD)',
    'Quantum teleportation protocols',
    'Quantum error correction',
    'Tests of quantum non-locality'
  ],
  complexity: {
    time: 'O(1) - constant time',
    space: 'O(2) - requires 2 qubits'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Initialize Qubits',
      description: 'Start with two qubits in the |00⟩ state',
      gates: [],
      explanation: 'Both qubits are initialized to |0⟩. The initial state is |ψ⟩ = |00⟩ = |0⟩ ⊗ |0⟩.',
      mathematicalContext: '|ψ₀⟩ = |00⟩',
      expectedOutcome: 'System is in a separable, classical state with no entanglement.'
    },
    {
      id: 'step-2',
      title: 'Create Superposition',
      description: 'Apply Hadamard gate to the first qubit',
      gates: [
        { gate: HadamardGate, targetQubits: [0], position: 0 }
      ],
      explanation: 'The Hadamard gate creates an equal superposition of |0⟩ and |1⟩ on the first qubit. This transforms |0⟩ → (|0⟩ + |1⟩)/√2.',
      mathematicalContext: '|ψ₁⟩ = H₀|00⟩ = (|00⟩ + |10⟩)/√2',
      expectedOutcome: 'First qubit is now in superposition, but qubits are still separable (not entangled).'
    },
    {
      id: 'step-3',
      title: 'Create Entanglement',
      description: 'Apply CNOT gate with first qubit as control, second as target',
      gates: [
        { gate: HadamardGate, targetQubits: [0], position: 0 },
        { gate: CNOTGate, targetQubits: [0, 1], position: 1 }
      ],
      explanation: 'The CNOT gate flips the target qubit (q₁) if the control qubit (q₀) is |1⟩. This creates entanglement between the qubits.',
      mathematicalContext: '|ψ₂⟩ = CNOT₀₁|ψ₁⟩ = (|00⟩ + |11⟩)/√2',
      expectedOutcome: 'The qubits are now maximally entangled in the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.'
    }
  ],
  fullCircuit: [
    { gate: HadamardGate, targetQubits: [0], position: 0 },
    { gate: CNOTGate, targetQubits: [0, 1], position: 1 }
  ],
  references: [
    'Nielsen & Chuang - Quantum Computation and Quantum Information',
    'Bell, J.S. - On the Einstein Podolsky Rosen Paradox (1964)'
  ]
};

// Quantum Teleportation Algorithm
export const quantumTeleportationAlgorithm: QuantumAlgorithm = {
  id: 'quantum-teleportation',
  name: 'Quantum Teleportation',
  description: 'Transfer quantum information from one qubit to another using entanglement',
  category: 'communication',
  difficulty: 'intermediate',
  qubitsRequired: 3,
  classicalBitsRequired: 2,
  learningObjectives: [
    'Understand quantum information transfer',
    'Learn about quantum entanglement applications',
    'Practice Bell state measurements',
    'Understand classical communication role'
  ],
  prerequisites: [
    'Understanding of Bell states',
    'Knowledge of quantum measurements',
    'Familiarity with conditional operations',
    'Basic quantum mechanics principles'
  ],
  applications: [
    'Quantum communication networks',
    'Quantum computing architectures',
    'Quantum error correction protocols',
    'Distributed quantum computing'
  ],
  complexity: {
    time: 'O(1) - constant time per teleportation',
    space: 'O(3) - requires 3 qubits + 2 classical bits'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Prepare Unknown State',
      description: 'Qubit 0 contains the unknown state |ψ⟩ to be teleported',
      gates: [],
      explanation: 'The state to be teleported is |ψ⟩ = α|0⟩ + β|1⟩. This state is unknown to us and cannot be measured directly without destroying it.',
      mathematicalContext: '|ψ⟩₀ = α|0⟩ + β|1⟩ (unknown coefficients α, β)',
      expectedOutcome: 'Qubit 0 holds the quantum information we want to transfer to qubit 2.'
    },
    {
      id: 'step-2',
      title: 'Create Bell Pair',
      description: 'Create entangled Bell pair between qubits 1 and 2',
      gates: [
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: CNOTGate, targetQubits: [1, 2], position: 1 }
      ],
      explanation: 'Qubits 1 and 2 are entangled in the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. This shared entanglement is the resource for teleportation.',
      mathematicalContext: '|Φ⁺⟩₁₂ = (|00⟩ + |11⟩)/√2',
      expectedOutcome: 'Total state: |ψ⟩₀ ⊗ |Φ⁺⟩₁₂ = (α|0⟩ + β|1⟩)₀ ⊗ (|00⟩ + |11⟩)₁₂/√2'
    },
    {
      id: 'step-3',
      title: 'Bell State Measurement',
      description: 'Perform Bell state measurement on qubits 0 and 1',
      gates: [
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: CNOTGate, targetQubits: [1, 2], position: 1 },
        { gate: CNOTGate, targetQubits: [0, 1], position: 2 },
        { gate: HadamardGate, targetQubits: [0], position: 3 }
      ],
      explanation: 'Apply CNOT(0,1) then H(0) to perform Bell measurement. This projects qubits 0,1 onto one of four Bell states.',
      mathematicalContext: 'Measurement outcomes: 00→I, 01→X, 10→Z, 11→XZ on qubit 2',
      expectedOutcome: 'Qubits 0,1 are measured, collapsing the state. Qubit 2 holds |ψ⟩ up to a known correction.'
    },
    {
      id: 'step-4',
      title: 'Classical Communication',
      description: 'Send measurement results (2 classical bits) to receiver',
      gates: [
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: CNOTGate, targetQubits: [1, 2], position: 1 },
        { gate: CNOTGate, targetQubits: [0, 1], position: 2 },
        { gate: HadamardGate, targetQubits: [0], position: 3 }
      ],
      explanation: 'The measurement results must be communicated classically. This is why teleportation cannot be used for faster-than-light communication.',
      mathematicalContext: 'Classical bits determine correction operation needed',
      expectedOutcome: 'Receiver knows which correction to apply to complete teleportation.'
    },
    {
      id: 'step-5',
      title: 'Apply Corrections',
      description: 'Apply corrections based on measurement results',
      gates: [
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: CNOTGate, targetQubits: [1, 2], position: 1 },
        { gate: CNOTGate, targetQubits: [0, 1], position: 2 },
        { gate: HadamardGate, targetQubits: [0], position: 3 }
        // Conditional gates would be added based on measurement results
      ],
      explanation: 'If measurement was 01: apply X to qubit 2. If 10: apply Z. If 11: apply XZ. If 00: do nothing.',
      mathematicalContext: 'Final state of qubit 2: |ψ⟩ = α|0⟩ + β|1⟩ (exact copy)',
      expectedOutcome: 'Qubit 2 now holds the exact quantum state that was originally in qubit 0.'
    }
  ],
  fullCircuit: [
    { gate: HadamardGate, targetQubits: [1], position: 0 },
    { gate: CNOTGate, targetQubits: [1, 2], position: 1 },
    { gate: CNOTGate, targetQubits: [0, 1], position: 2 },
    { gate: HadamardGate, targetQubits: [0], position: 3 }
  ],
  references: [
    'Bennett et al. - Teleporting an unknown quantum state via dual classical and EPR channels (1993)',
    'Bouwmeester et al. - Experimental quantum teleportation (1997)'
  ]
};

// Grover's Search Algorithm (3-qubit version)
export const groversSearchAlgorithm: QuantumAlgorithm = {
  id: 'grovers-search',
  name: "Grover's Search Algorithm",
  description: 'Quantum search algorithm for finding marked items in unsorted database',
  category: 'search',
  difficulty: 'intermediate',
  qubitsRequired: 3,
  learningObjectives: [
    'Understand quantum search algorithms',
    'Learn about amplitude amplification',
    'Practice oracle construction',
    'Observe quadratic speedup over classical search'
  ],
  prerequisites: [
    'Understanding of quantum superposition',
    'Knowledge of controlled operations',
    'Familiarity with phase kickback',
    'Basic quantum circuit design'
  ],
  applications: [
    'Database search',
    'Optimization problems',
    'Cryptanalysis',
    'Machine learning algorithms'
  ],
  complexity: {
    time: 'O(√N) where N = 2ⁿ items',
    space: 'O(n) qubits for N = 2ⁿ items'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Initialize Superposition',
      description: 'Create equal superposition over all possible states',
      gates: [
        { gate: HadamardGate, targetQubits: [0], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: HadamardGate, targetQubits: [2], position: 0 }
      ],
      explanation: 'Apply Hadamard gates to all qubits to create uniform superposition over all 8 possible states |000⟩ through |111⟩.',
      mathematicalContext: '|ψ⟩ = 1/√8 (|000⟩ + |001⟩ + |010⟩ + |011⟩ + |100⟩ + |101⟩ + |110⟩ + |111⟩)',
      expectedOutcome: 'All database items have equal probability amplitude 1/√8.'
    },
    {
      id: 'step-2',
      title: 'Oracle Query',
      description: 'Apply oracle to mark the target item with phase flip',
      gates: [
        { gate: HadamardGate, targetQubits: [0], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: HadamardGate, targetQubits: [2], position: 0 },
        // Oracle implementation (example: marking |101⟩)
        { gate: PauliZGate, targetQubits: [0], position: 1 },
        { gate: PauliZGate, targetQubits: [2], position: 1 }
      ],
      explanation: 'The oracle flips the phase of the marked item. For item |101⟩, we apply Z gates to qubits where we want |1⟩ to get negative phase.',
      mathematicalContext: 'Oracle: |x⟩ → (-1)^f(x)|x⟩ where f(x) = 1 for marked item',
      expectedOutcome: 'Marked item |101⟩ now has amplitude -1/√8, others remain +1/√8.'
    },
    {
      id: 'step-3',
      title: 'Diffusion Operator',
      description: 'Apply diffusion operator (inversion about average)',
      gates: [
        { gate: HadamardGate, targetQubits: [0], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: HadamardGate, targetQubits: [2], position: 0 },
        { gate: PauliZGate, targetQubits: [0], position: 1 },
        { gate: PauliZGate, targetQubits: [2], position: 1 },
        // Diffusion operator
        { gate: HadamardGate, targetQubits: [0], position: 2 },
        { gate: HadamardGate, targetQubits: [1], position: 2 },
        { gate: HadamardGate, targetQubits: [2], position: 2 },
        { gate: PauliXGate, targetQubits: [0], position: 3 },
        { gate: PauliXGate, targetQubits: [1], position: 3 },
        { gate: PauliXGate, targetQubits: [2], position: 3 }
      ],
      explanation: 'The diffusion operator performs inversion about the average amplitude, rotating the state vector toward the marked item.',
      mathematicalContext: 'D = 2|ψ⟩⟨ψ| - I = H⊗n(2|0⟩⟨0| - I)H⊗n',
      expectedOutcome: 'Amplitude of marked item increases while others decrease.'
    },
    {
      id: 'step-4',
      title: 'Repeat Grover Iteration',
      description: 'Repeat oracle + diffusion for optimal number of iterations',
      gates: [
        // Full Grover iteration (simplified representation)
        { gate: HadamardGate, targetQubits: [0], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: HadamardGate, targetQubits: [2], position: 0 }
      ],
      explanation: 'For 3 qubits (8 items), the optimal number of iterations is ⌊π√8/4⌋ = 2. Each iteration amplifies the target amplitude.',
      mathematicalContext: 'Optimal iterations: ⌊π√N/4⌋ where N = 2ⁿ',
      expectedOutcome: 'After optimal iterations, marked item has high probability (~1), others have low probability.'
    },
    {
      id: 'step-5',
      title: 'Measurement',
      description: 'Measure all qubits to find the marked item',
      gates: [
        { gate: HadamardGate, targetQubits: [0], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 0 },
        { gate: HadamardGate, targetQubits: [2], position: 0 }
      ],
      explanation: 'Measurement collapses the superposition. With high probability, we measure the marked item.',
      mathematicalContext: 'P(marked item) ≈ 1 after optimal iterations',
      expectedOutcome: 'Measurement result gives the index of the marked database item with high probability.'
    }
  ],
  fullCircuit: [
    // Initialization
    { gate: HadamardGate, targetQubits: [0], position: 0 },
    { gate: HadamardGate, targetQubits: [1], position: 0 },
    { gate: HadamardGate, targetQubits: [2], position: 0 },
    // Oracle (marking |101⟩)
    { gate: PauliZGate, targetQubits: [0], position: 1 },
    { gate: PauliZGate, targetQubits: [2], position: 1 },
    // Diffusion operator
    { gate: HadamardGate, targetQubits: [0], position: 2 },
    { gate: HadamardGate, targetQubits: [1], position: 2 },
    { gate: HadamardGate, targetQubits: [2], position: 2 },
    { gate: PauliXGate, targetQubits: [0], position: 3 },
    { gate: PauliXGate, targetQubits: [1], position: 3 },
    { gate: PauliXGate, targetQubits: [2], position: 3 }
  ],
  references: [
    'Grover, L.K. - A fast quantum mechanical algorithm for database search (1996)',
    'Boyer et al. - Tight bounds on quantum searching (1998)'
  ]
};

// Quantum Fourier Transform
export const quantumFourierTransformAlgorithm: QuantumAlgorithm = {
  id: 'quantum-fourier-transform',
  name: 'Quantum Fourier Transform',
  description: 'Quantum version of the discrete Fourier transform with exponential speedup',
  category: 'transform',
  difficulty: 'advanced',
  qubitsRequired: 3,
  learningObjectives: [
    'Understand quantum Fourier analysis',
    'Learn about controlled rotation gates',
    'Practice quantum phase estimation techniques',
    'Observe quantum parallelism in transforms'
  ],
  prerequisites: [
    'Understanding of classical Fourier transforms',
    'Knowledge of quantum phase and rotation gates',
    'Familiarity with controlled operations',
    'Complex number arithmetic'
  ],
  applications: [
    "Shor's factoring algorithm",
    'Quantum phase estimation',
    'Period finding algorithms',
    'Quantum signal processing'
  ],
  complexity: {
    time: 'O(n²) gates for n qubits vs O(n·2ⁿ) classical',
    space: 'O(n) qubits for 2ⁿ point transform'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Input State Preparation',
      description: 'Prepare input state |x⟩ in computational basis',
      gates: [],
      explanation: 'The input is a quantum state |x⟩ = |x₂x₁x₀⟩ in the computational basis. For n=3 qubits, x ranges from 0 to 7.',
      mathematicalContext: '|x⟩ = |x₂x₁x₀⟩ where x = 4x₂ + 2x₁ + x₀',
      expectedOutcome: 'Input state ready for Fourier transformation.'
    },
    {
      id: 'step-2',
      title: 'Apply Hadamard to Most Significant Qubit',
      description: 'Start QFT by applying H gate to qubit 2',
      gates: [
        { gate: HadamardGate, targetQubits: [2], position: 0 }
      ],
      explanation: 'The Hadamard gate creates superposition and begins the Fourier transformation process.',
      mathematicalContext: 'H|x₂⟩ = (|0⟩ + e^(2πix₂/2)|1⟩)/√2',
      expectedOutcome: 'Most significant qubit now in superposition with phase information.'
    },
    {
      id: 'step-3',
      title: 'Apply Controlled Rotations',
      description: 'Apply controlled phase rotations from less significant qubits',
      gates: [
        { gate: HadamardGate, targetQubits: [2], position: 0 }
        // Controlled rotations would be implemented with decomposed gates
      ],
      explanation: 'Controlled R₂ and R₃ gates add phase information from other qubits. These implement the Fourier basis change.',
      mathematicalContext: 'CR_k|control,target⟩ = |control⟩ ⊗ R_k^control|target⟩',
      expectedOutcome: 'Qubit 2 now encodes Fourier amplitudes with proper phase relationships.'
    },
    {
      id: 'step-4',
      title: 'Process Middle Qubit',
      description: 'Apply H and controlled rotations to qubit 1',
      gates: [
        { gate: HadamardGate, targetQubits: [2], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 1 }
      ],
      explanation: 'Apply Hadamard to qubit 1, then controlled rotation from qubit 0.',
      mathematicalContext: 'Progressive transformation: each qubit gets H + controlled phases',
      expectedOutcome: 'Qubit 1 transformed with appropriate Fourier phase encoding.'
    },
    {
      id: 'step-5',
      title: 'Process Least Significant Qubit',
      description: 'Apply final Hadamard to complete transformation',
      gates: [
        { gate: HadamardGate, targetQubits: [2], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 1 },
        { gate: HadamardGate, targetQubits: [0], position: 2 }
      ],
      explanation: 'Final Hadamard on qubit 0 completes the QFT. No controlled rotations needed as its the least significant.',
      mathematicalContext: 'Final H transforms last qubit into Fourier basis',
      expectedOutcome: 'QFT complete: |x⟩ → |QFT(x)⟩ with exponential speedup over classical FFT.'
    },
    {
      id: 'step-6',
      title: 'Bit Reversal (Optional)',
      description: 'Swap qubits to match classical FFT output order',
      gates: [
        { gate: HadamardGate, targetQubits: [2], position: 0 },
        { gate: HadamardGate, targetQubits: [1], position: 1 },
        { gate: HadamardGate, targetQubits: [0], position: 2 }
        // SWAP gates would be added here
      ],
      explanation: 'Optional bit reversal to match classical FFT ordering. Swaps qubits 0 and 2.',
      mathematicalContext: 'SWAP gates reverse qubit order without changing amplitudes',
      expectedOutcome: 'Output in standard FFT order if bit reversal applied.'
    }
  ],
  fullCircuit: [
    { gate: HadamardGate, targetQubits: [2], position: 0 },
    { gate: HadamardGate, targetQubits: [1], position: 1 },
    { gate: HadamardGate, targetQubits: [0], position: 2 }
    // Note: This is simplified - real QFT needs controlled rotation gates
  ],
  references: [
    'Coppersmith, D. - An approximate Fourier transform useful in quantum factoring (1994)',
    'Shor, P.W. - Algorithms for quantum computation: discrete logarithms and factoring (1994)'
  ]
};

export const quantumAlgorithmTemplates: QuantumAlgorithm[] = [
  bellStateAlgorithm,
  quantumTeleportationAlgorithm,
  groversSearchAlgorithm,
  quantumFourierTransformAlgorithm
];