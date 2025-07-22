import { complex } from 'mathjs';
import { QuantumGate } from '../types/quantum';

const SQRT2 = Math.sqrt(2);

export const HadamardGate: QuantumGate = {
  name: 'Hadamard',
  symbol: 'H',
  qubits: 1,
  matrix: [
    [complex(1 / SQRT2), complex(1 / SQRT2)],
    [complex(1 / SQRT2), complex(-1 / SQRT2)]
  ]
};

export const PauliXGate: QuantumGate = {
  name: 'Pauli-X',
  symbol: 'X',
  qubits: 1,
  matrix: [
    [complex(0), complex(1)],
    [complex(1), complex(0)]
  ]
};

export const PauliYGate: QuantumGate = {
  name: 'Pauli-Y',
  symbol: 'Y',
  qubits: 1,
  matrix: [
    [complex(0), complex(0, -1)],
    [complex(0, 1), complex(0)]
  ]
};

export const PauliZGate: QuantumGate = {
  name: 'Pauli-Z',
  symbol: 'Z',
  qubits: 1,
  matrix: [
    [complex(1), complex(0)],
    [complex(0), complex(-1)]
  ]
};

export const CNOTGate: QuantumGate = {
  name: 'CNOT',
  symbol: 'CX',
  qubits: 2,
  matrix: [
    [complex(1), complex(0), complex(0), complex(0)],
    [complex(0), complex(1), complex(0), complex(0)],
    [complex(0), complex(0), complex(0), complex(1)],
    [complex(0), complex(0), complex(1), complex(0)]
  ]
};

export const availableGates = [
  HadamardGate,
  PauliXGate,
  PauliYGate,
  PauliZGate,
  CNOTGate
];