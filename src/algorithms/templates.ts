import { QuantumAlgorithm } from '../types/algorithms';
import { CircuitElement, QuantumGate } from '../types/quantum';
import {
  HadamardGate,
  PauliXGate,
  CNOTGate,
  CZGate,
  CCZGate,
  SWAPGate,
  ry,
  controlledPhase,
} from '../quantum/gates';

const el = (gate: QuantumGate, targetQubits: number[], position: number): CircuitElement => ({
  gate,
  targetQubits,
  position,
});

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
        el(HadamardGate, [0], 0)
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
        el(HadamardGate, [0], 0),
        el(CNOTGate, [0, 1], 1)
      ],
      explanation: 'The CNOT gate flips the target qubit (q₁) if the control qubit (q₀) is |1⟩. This creates entanglement between the qubits.',
      mathematicalContext: '|ψ₂⟩ = CNOT₀₁|ψ₁⟩ = (|00⟩ + |11⟩)/√2',
      expectedOutcome: 'The qubits are now maximally entangled in the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.'
    }
  ],
  fullCircuit: [
    el(HadamardGate, [0], 0),
    el(CNOTGate, [0, 1], 1)
  ],
  references: [
    'Nielsen & Chuang - Quantum Computation and Quantum Information',
    'Bell, J.S. - On the Einstein Podolsky Rosen Paradox (1964)'
  ]
};

// Quantum Teleportation Algorithm (deferred-measurement form)
//
// The textbook protocol measures qubits 0 and 1 and applies X/Z corrections
// to qubit 2 conditioned on the classical outcomes. By the principle of
// deferred measurement, those classically-controlled corrections are exactly
// equivalent to quantum-controlled CNOT(1→2) and CZ(0→2) applied before
// measurement — which is the form a pure state-vector circuit can express.
const teleportPrep = ry(Math.PI / 3);
const teleportationCircuit: CircuitElement[] = [
  el(teleportPrep, [0], 0),      // prepare |ψ⟩ = cos(π/6)|0⟩ + sin(π/6)|1⟩
  el(HadamardGate, [1], 1),      // ┐ Bell pair
  el(CNOTGate, [1, 2], 2),       // ┘ between q1 and q2
  el(CNOTGate, [0, 1], 3),       // ┐ rotate q0,q1 into
  el(HadamardGate, [0], 4),      // ┘ the Bell basis
  el(CNOTGate, [1, 2], 5),       // deferred X correction
  el(CZGate, [0, 2], 6),         // deferred Z correction
];

export const quantumTeleportationAlgorithm: QuantumAlgorithm = {
  id: 'quantum-teleportation',
  name: 'Quantum Teleportation',
  description: 'Transfer a quantum state from one qubit to another using entanglement (deferred-measurement form)',
  category: 'communication',
  difficulty: 'intermediate',
  qubitsRequired: 3,
  classicalBitsRequired: 2,
  learningObjectives: [
    'Understand quantum information transfer',
    'Learn about quantum entanglement applications',
    'Practice Bell state measurements',
    'Understand the principle of deferred measurement'
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
      title: 'Prepare State to Teleport',
      description: 'Rotate qubit 0 into the state |ψ⟩ that will be teleported',
      gates: teleportationCircuit.slice(0, 1),
      explanation: 'Ry(π/3) prepares |ψ⟩ = cos(π/6)|0⟩ + sin(π/6)|1⟩ on qubit 0, so P(0) = 3/4 and P(1) = 1/4. In a real protocol this state would be unknown; here we choose one so the transfer is verifiable.',
      mathematicalContext: '|ψ⟩₀ = cos(π/6)|0⟩ + sin(π/6)|1⟩ ≈ 0.866|0⟩ + 0.5|1⟩',
      expectedOutcome: 'Qubit 0 holds the quantum information we want to transfer to qubit 2.'
    },
    {
      id: 'step-2',
      title: 'Create Bell Pair',
      description: 'Create entangled Bell pair between qubits 1 and 2',
      gates: teleportationCircuit.slice(0, 3),
      explanation: 'Qubits 1 and 2 are entangled in the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. This shared entanglement is the resource for teleportation.',
      mathematicalContext: '|Φ⁺⟩₁₂ = (|00⟩ + |11⟩)/√2',
      expectedOutcome: 'Total state: |ψ⟩₀ ⊗ |Φ⁺⟩₁₂'
    },
    {
      id: 'step-3',
      title: 'Bell-Basis Rotation',
      description: 'Apply CNOT(0→1) then H(0) to rotate qubits 0,1 into the Bell basis',
      gates: teleportationCircuit.slice(0, 5),
      explanation: 'After this rotation, the four computational outcomes of qubits 0,1 correspond to the four Bell states. Qubit 2 now holds |ψ⟩ up to a known Pauli correction that depends on those outcomes.',
      mathematicalContext: '(measuring 00→I, 01→X, 10→Z, 11→XZ correction on qubit 2)',
      expectedOutcome: 'Qubit 2 holds |ψ⟩ up to a Pauli correction entangled with qubits 0,1.'
    },
    {
      id: 'step-4',
      title: 'Apply Deferred Corrections',
      description: 'Quantum-controlled CNOT(1→2) and CZ(0→2) replace the classical corrections',
      gates: teleportationCircuit,
      explanation: 'In the textbook protocol, qubits 0 and 1 are measured and X/Z are applied to qubit 2 conditioned on the two classical bits. The principle of deferred measurement says controlled-X from qubit 1 and controlled-Z from qubit 0 before measurement give identical statistics — and that form runs directly on a state-vector simulator.',
      mathematicalContext: 'Final state: (1/2)·Σ_{ab} |ab⟩₀₁ ⊗ |ψ⟩₂ — qubit 2 is exactly |ψ⟩, unentangled from 0,1',
      expectedOutcome: 'Qubit 2 measures 0 with probability 3/4 and 1 with probability 1/4 — the prepared state has been transferred.'
    },
    {
      id: 'step-5',
      title: 'Verify and Discuss',
      description: 'Measure: qubits 0,1 are uniformly random; qubit 2 reproduces |ψ⟩',
      gates: teleportationCircuit,
      explanation: 'Qubits 0 and 1 carry no information about |ψ⟩ (each outcome has probability 1/4), which is why teleportation cannot signal faster than light: without the two classical bits, qubit 2 alone looks maximally mixed in the real protocol.',
      mathematicalContext: 'P(q₂=0) = cos²(π/6) = 3/4, P(q₂=1) = sin²(π/6) = 1/4',
      expectedOutcome: 'The state has been destroyed on qubit 0 (no-cloning) and recreated on qubit 2.'
    }
  ],
  fullCircuit: teleportationCircuit,
  references: [
    'Bennett et al. - Teleporting an unknown quantum state via dual classical and EPR channels (1993)',
    'Bouwmeester et al. - Experimental quantum teleportation (1997)',
    'Nielsen & Chuang §4.4 - Principle of deferred measurement'
  ]
};

// Grover's Search Algorithm (3 qubits, marked item |101⟩, 2 iterations)
//
// Oracle: phase-flip |101⟩ only. CCZ flips |111⟩; conjugating qubit 1 with X
// maps the q₁=0 condition onto it, so X(1)·CCZ·X(1) flips exactly |101⟩.
// Diffusion: H⊗3 · X⊗3 · CCZ · X⊗3 · H⊗3 = 2|s⟩⟨s| − I (inversion about the mean).
const groverOracle = (pos: number): CircuitElement[] => [
  el(PauliXGate, [1], pos),
  el(CCZGate, [0, 1, 2], pos + 1),
  el(PauliXGate, [1], pos + 2),
];

const groverDiffusion = (pos: number): CircuitElement[] => [
  el(HadamardGate, [0], pos),
  el(HadamardGate, [1], pos),
  el(HadamardGate, [2], pos),
  el(PauliXGate, [0], pos + 1),
  el(PauliXGate, [1], pos + 1),
  el(PauliXGate, [2], pos + 1),
  el(CCZGate, [0, 1, 2], pos + 2),
  el(PauliXGate, [0], pos + 3),
  el(PauliXGate, [1], pos + 3),
  el(PauliXGate, [2], pos + 3),
  el(HadamardGate, [0], pos + 4),
  el(HadamardGate, [1], pos + 4),
  el(HadamardGate, [2], pos + 4),
];

const groverInit: CircuitElement[] = [
  el(HadamardGate, [0], 0),
  el(HadamardGate, [1], 0),
  el(HadamardGate, [2], 0),
];

const groverCircuit: CircuitElement[] = [
  ...groverInit,
  ...groverOracle(1),       // iteration 1
  ...groverDiffusion(4),
  ...groverOracle(9),       // iteration 2
  ...groverDiffusion(12),
];

export const groversSearchAlgorithm: QuantumAlgorithm = {
  id: 'grovers-search',
  name: "Grover's Search Algorithm",
  description: 'Quantum search finding the marked item |101⟩ among 8 with ~94.5% success after 2 iterations',
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
    time: 'O(√N) oracle queries for N = 2ⁿ items',
    space: 'O(n) qubits for N = 2ⁿ items'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Initialize Superposition',
      description: 'Create equal superposition over all possible states',
      gates: groverInit,
      explanation: 'Apply Hadamard gates to all qubits to create uniform superposition over all 8 possible states |000⟩ through |111⟩.',
      mathematicalContext: '|s⟩ = (1/√8)·Σₓ|x⟩, each amplitude 1/√8 ≈ 0.354',
      expectedOutcome: 'All database items have equal probability 1/8 = 12.5%.'
    },
    {
      id: 'step-2',
      title: 'Oracle Query (Iteration 1)',
      description: 'Phase-flip the marked item |101⟩ using X(1)·CCZ·X(1)',
      gates: [...groverInit, ...groverOracle(1)],
      explanation: 'CCZ phase-flips only |111⟩. Wrapping qubit 1 in X gates re-targets the flip to states with q₁ = 0, so exactly |101⟩ acquires a −1 phase. The probabilities are unchanged — the marked item is tagged in phase only.',
      mathematicalContext: 'O|x⟩ = (−1)^{f(x)}|x⟩ with f(x) = 1 ⟺ x = 101',
      expectedOutcome: 'Amplitude of |101⟩ is now −1/√8; all probabilities still 12.5%.'
    },
    {
      id: 'step-3',
      title: 'Diffusion (Iteration 1)',
      description: 'Invert all amplitudes about their mean: H⊗3 · X⊗3 · CCZ · X⊗3 · H⊗3',
      gates: [...groverInit, ...groverOracle(1), ...groverDiffusion(4)],
      explanation: 'The diffusion operator D = 2|s⟩⟨s| − I reflects every amplitude about the average. Because the marked amplitude is negative, the reflection amplifies it from −0.354 to +0.884.',
      mathematicalContext: 'After 1 iteration: P(101) = 25/32 ≈ 78.1%',
      expectedOutcome: 'The marked item already dominates the distribution.'
    },
    {
      id: 'step-4',
      title: 'Second Grover Iteration',
      description: 'Repeat oracle + diffusion once more',
      gates: groverCircuit,
      explanation: 'The optimal iteration count is ⌊(π/4)·√8⌋ = 2. A third iteration would overshoot and the success probability would start decreasing.',
      mathematicalContext: 'After 2 iterations: P(101) = 121/128 ≈ 94.5%',
      expectedOutcome: 'Measurement now yields |101⟩ with ≈ 94.5% probability, each other state ≈ 0.78%.'
    },
    {
      id: 'step-5',
      title: 'Measurement',
      description: 'Measure all qubits to read out the marked item',
      gates: groverCircuit,
      explanation: 'A classical search needs 4 queries on average over 8 items; Grover finds the marked item with 2 oracle queries at ≈ 94.5% success probability — the √N speedup.',
      mathematicalContext: 'P(101) = 121/128 ≈ 0.945',
      expectedOutcome: 'The measured bitstring is 101 with high probability.'
    }
  ],
  fullCircuit: groverCircuit,
  references: [
    'Grover, L.K. - A fast quantum mechanical algorithm for database search (1996)',
    'Boyer et al. - Tight bounds on quantum searching (1998)'
  ]
};

// Quantum Fourier Transform (3 qubits)
//
// QFT|x⟩ = (1/√8)·Σ_y e^{2πi·xy/8}|y⟩, with qubit 0 as the most significant
// bit. Each qubit gets a Hadamard followed by controlled phase rotations from
// every less-significant qubit; the final SWAP restores standard bit order.
const cp90 = controlledPhase(Math.PI / 2);
const cp45 = controlledPhase(Math.PI / 4);

const qftCircuit: CircuitElement[] = [
  el(HadamardGate, [0], 0),
  el(cp90, [1, 0], 1),     // control q1, target q0: phase π/2
  el(cp45, [2, 0], 2),     // control q2, target q0: phase π/4
  el(HadamardGate, [1], 3),
  el(cp90, [2, 1], 4),     // control q2, target q1: phase π/2
  el(HadamardGate, [2], 5),
  el(SWAPGate, [0, 2], 6), // bit reversal
];

export const quantumFourierTransformAlgorithm: QuantumAlgorithm = {
  id: 'quantum-fourier-transform',
  name: 'Quantum Fourier Transform',
  description: 'The quantum version of the discrete Fourier transform, in O(n²) gates',
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
    time: 'O(n²) gates for n qubits vs O(n·2ⁿ) classical FFT',
    space: 'O(n) qubits for a 2ⁿ-point transform'
  },
  steps: [
    {
      id: 'step-1',
      title: 'Input State Preparation',
      description: 'Prepare input state |x⟩ in the computational basis',
      gates: [],
      explanation: 'The input is a quantum state |x⟩ = |x₀x₁x₂⟩ with qubit 0 the most significant bit. For n = 3 qubits, x ranges from 0 to 7.',
      mathematicalContext: '|x⟩ = |x₀x₁x₂⟩ where x = 4x₀ + 2x₁ + x₂',
      expectedOutcome: 'Input state ready for Fourier transformation.'
    },
    {
      id: 'step-2',
      title: 'Transform the Most Significant Qubit',
      description: 'H on qubit 0, then CP(π/2) from qubit 1 and CP(π/4) from qubit 2',
      gates: qftCircuit.slice(0, 3),
      explanation: 'The Hadamard puts qubit 0 into (|0⟩ + e^{iπx₀}|1⟩)/√2; the controlled phases from the less-significant qubits refine that phase to encode the full binary fraction 0.x₀x₁x₂.',
      mathematicalContext: 'q₀ → (|0⟩ + e^{2πi·(0.x₀x₁x₂)}|1⟩)/√2',
      expectedOutcome: 'Qubit 0 carries the finest-grained phase information.'
    },
    {
      id: 'step-3',
      title: 'Transform the Middle Qubit',
      description: 'H on qubit 1, then CP(π/2) from qubit 2',
      gates: qftCircuit.slice(0, 5),
      explanation: 'Qubit 1 receives the same treatment with one fewer rotation: Hadamard, then a single controlled phase from qubit 2.',
      mathematicalContext: 'q₁ → (|0⟩ + e^{2πi·(0.x₁x₂)}|1⟩)/√2',
      expectedOutcome: 'Qubit 1 encodes the next coarser binary fraction.'
    },
    {
      id: 'step-4',
      title: 'Transform the Least Significant Qubit',
      description: 'Final Hadamard on qubit 2',
      gates: qftCircuit.slice(0, 6),
      explanation: 'The least significant qubit needs no controlled rotations — just a Hadamard.',
      mathematicalContext: 'q₂ → (|0⟩ + e^{2πi·(0.x₂)}|1⟩)/√2',
      expectedOutcome: 'All qubits now hold Fourier phases, but in reversed bit order.'
    },
    {
      id: 'step-5',
      title: 'Bit Reversal',
      description: 'SWAP qubits 0 and 2 to restore standard ordering',
      gates: qftCircuit,
      explanation: 'The phase-encoding pattern naturally produces the output qubits in reverse order; a SWAP of the outer qubits completes the transform so amplitudes match the DFT matrix directly.',
      mathematicalContext: 'QFT|x⟩ = (1/√8)·Σ_y e^{2πi·xy/8}|y⟩',
      expectedOutcome: 'The state vector equals the discrete Fourier transform of the input.'
    }
  ],
  fullCircuit: qftCircuit,
  references: [
    'Coppersmith, D. - An approximate Fourier transform useful in quantum factoring (1994)',
    'Shor, P.W. - Algorithms for quantum computation: discrete logarithms and factoring (1994)',
    'Nielsen & Chuang §5.1 - The quantum Fourier transform'
  ]
};

export const quantumAlgorithmTemplates: QuantumAlgorithm[] = [
  bellStateAlgorithm,
  quantumTeleportationAlgorithm,
  groversSearchAlgorithm,
  quantumFourierTransformAlgorithm
];
