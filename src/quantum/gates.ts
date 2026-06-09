import { Complex, complex } from 'mathjs';
import { QuantumGate } from '../types/quantum';

const SQRT2 = Math.sqrt(2);

// ---------------------------------------------------------------------------
// Fixed single-qubit gates
// ---------------------------------------------------------------------------

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

export const SGate: QuantumGate = {
  name: 'S',
  symbol: 'S',
  qubits: 1,
  matrix: [
    [complex(1), complex(0)],
    [complex(0), complex(0, 1)]
  ]
};

export const SDaggerGate: QuantumGate = {
  name: 'S†',
  symbol: 'S†',
  qubits: 1,
  matrix: [
    [complex(1), complex(0)],
    [complex(0), complex(0, -1)]
  ]
};

export const TGate: QuantumGate = {
  name: 'T',
  symbol: 'T',
  qubits: 1,
  matrix: [
    [complex(1), complex(0)],
    [complex(0), complex(1 / SQRT2, 1 / SQRT2)]
  ]
};

export const TDaggerGate: QuantumGate = {
  name: 'T†',
  symbol: 'T†',
  qubits: 1,
  matrix: [
    [complex(1), complex(0)],
    [complex(0), complex(1 / SQRT2, -1 / SQRT2)]
  ]
};

// ---------------------------------------------------------------------------
// Parameterized single-qubit gates
// ---------------------------------------------------------------------------

function formatAngle(theta: number): string {
  // Render common multiples of π exactly, fall back to 4 decimals.
  const inPi = theta / Math.PI;
  for (const den of [1, 2, 3, 4, 6, 8]) {
    const num = inPi * den;
    if (Math.abs(num - Math.round(num)) < 1e-12 && Math.round(num) !== 0) {
      const n = Math.round(num);
      const numStr = n === 1 ? '' : n === -1 ? '-' : String(n);
      return den === 1 ? `${numStr}π` : `${numStr}π/${den}`;
    }
  }
  if (theta === 0) return '0';
  return String(+theta.toFixed(4));
}

/** Rotation about the x-axis: Rx(θ) = exp(-iθX/2) */
export function rx(theta: number): QuantumGate {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  return {
    name: `Rx(${formatAngle(theta)})`,
    symbol: 'RX',
    qubits: 1,
    params: [theta],
    matrix: [
      [complex(c), complex(0, -s)],
      [complex(0, -s), complex(c)]
    ]
  };
}

/** Rotation about the y-axis: Ry(θ) = exp(-iθY/2) */
export function ry(theta: number): QuantumGate {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  return {
    name: `Ry(${formatAngle(theta)})`,
    symbol: 'RY',
    qubits: 1,
    params: [theta],
    matrix: [
      [complex(c), complex(-s)],
      [complex(s), complex(c)]
    ]
  };
}

/** Rotation about the z-axis: Rz(θ) = exp(-iθZ/2) */
export function rz(theta: number): QuantumGate {
  const half = theta / 2;
  return {
    name: `Rz(${formatAngle(theta)})`,
    symbol: 'RZ',
    qubits: 1,
    params: [theta],
    matrix: [
      [complex(Math.cos(half), -Math.sin(half)), complex(0)],
      [complex(0), complex(Math.cos(half), Math.sin(half))]
    ]
  };
}

/** Phase gate P(θ) = diag(1, e^{iθ}). P(π)=Z, P(π/2)=S, P(π/4)=T. */
export function phase(theta: number): QuantumGate {
  return {
    name: `P(${formatAngle(theta)})`,
    symbol: 'P',
    qubits: 1,
    params: [theta],
    matrix: [
      [complex(1), complex(0)],
      [complex(0), complex(Math.cos(theta), Math.sin(theta))]
    ]
  };
}

// ---------------------------------------------------------------------------
// Controlled gates
// ---------------------------------------------------------------------------

/**
 * Build the controlled version of any gate: identity on the subspace where a
 * control is |0⟩, the original gate where all controls are |1⟩. Control
 * qubits come first in the target list when the gate is applied.
 */
export function controlled(gate: QuantumGate, numControls = 1): QuantumGate {
  if (numControls < 1) {
    throw new Error('numControls must be at least 1');
  }

  const baseDim = gate.matrix.length;
  const dim = baseDim * (1 << numControls);
  const matrix: Complex[][] = [];
  for (let r = 0; r < dim; r++) {
    const row: Complex[] = new Array(dim).fill(complex(0));
    matrix.push(row);
  }

  // Identity everywhere except the all-controls-on block in the bottom-right.
  const blockStart = dim - baseDim;
  for (let i = 0; i < blockStart; i++) {
    matrix[i][i] = complex(1);
  }
  for (let r = 0; r < baseDim; r++) {
    for (let c = 0; c < baseDim; c++) {
      matrix[blockStart + r][blockStart + c] = gate.matrix[r][c];
    }
  }

  const prefix = 'C'.repeat(numControls);
  return {
    name: `${prefix}${gate.symbol}`,
    symbol: `${prefix}${gate.symbol}`,
    qubits: gate.qubits + numControls,
    params: gate.params,
    matrix
  };
}

/** Controlled phase rotation CP(θ) = diag(1, 1, 1, e^{iθ}) — the QFT workhorse. */
export function controlledPhase(theta: number): QuantumGate {
  const gate = controlled(phase(theta));
  return { ...gate, name: `CP(${formatAngle(theta)})`, symbol: 'CP' };
}

export const CNOTGate: QuantumGate = {
  ...controlled(PauliXGate),
  name: 'CNOT',
  symbol: 'CX'
};

export const CZGate: QuantumGate = {
  ...controlled(PauliZGate),
  name: 'CZ',
  symbol: 'CZ'
};

export const SWAPGate: QuantumGate = {
  name: 'SWAP',
  symbol: 'SWAP',
  qubits: 2,
  matrix: [
    [complex(1), complex(0), complex(0), complex(0)],
    [complex(0), complex(0), complex(1), complex(0)],
    [complex(0), complex(1), complex(0), complex(0)],
    [complex(0), complex(0), complex(0), complex(1)]
  ]
};

/** Toffoli (CCX): flips the third qubit when both controls are |1⟩. */
export const ToffoliGate: QuantumGate = {
  ...controlled(PauliXGate, 2),
  name: 'Toffoli',
  symbol: 'CCX'
};

/** CCZ: phase-flips |111⟩. Symmetric in all three qubits. */
export const CCZGate: QuantumGate = {
  ...controlled(PauliZGate, 2),
  name: 'CCZ',
  symbol: 'CCZ'
};

// Gates shown in the drag-and-drop palette. Parameterized gates (rx/ry/rz/
// phase/controlledPhase) are available through the QuantumCircuit API.
export const availableGates = [
  HadamardGate,
  PauliXGate,
  PauliYGate,
  PauliZGate,
  SGate,
  TGate,
  CNOTGate,
  CZGate,
  SWAPGate,
  ToffoliGate
];
