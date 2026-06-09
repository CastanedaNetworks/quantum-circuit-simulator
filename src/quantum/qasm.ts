import type { CircuitOp } from './circuit';

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Map from our gate symbols to qelib1 gate names. Parameterized entries take
 * their angle from gate.params. CCZ has no qelib1 name and is exported as its
 * exact decomposition H·CCX·H on the last qubit.
 */
const QASM_NAMES: Record<string, string> = {
  H: 'h',
  X: 'x',
  Y: 'y',
  Z: 'z',
  S: 's',
  'S†': 'sdg',
  T: 't',
  'T†': 'tdg',
  RX: 'rx',
  RY: 'ry',
  RZ: 'rz',
  P: 'u1',
  CX: 'cx',
  CY: 'cy',
  CZ: 'cz',
  CH: 'ch',
  SWAP: 'swap',
  CCX: 'ccx',
  CP: 'cu1',
  CRZ: 'crz',
};

export function instructionsToQasm(numQubits: number, ops: readonly CircuitOp[]): string {
  const lines: string[] = [
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    `qreg q[${numQubits}];`,
    `creg c[${numQubits}];`,
  ];

  for (const op of ops) {
    if (op.kind === 'noise') {
      throw new Error('OpenQASM 2.0 cannot represent noise channels; export the ideal circuit instead');
    }
    if (op.kind === 'measure') {
      lines.push(`measure q[${op.qubit}] -> c[${op.qubit}];`);
      continue;
    }

    const { gate, qubits } = op;
    const args = qubits.map(q => `q[${q}]`).join(',');

    if (gate.symbol === 'CCZ') {
      const t = qubits[2];
      lines.push(`h q[${t}];`);
      lines.push(`ccx q[${qubits[0]}],q[${qubits[1]}],q[${t}];`);
      lines.push(`h q[${t}];`);
      continue;
    }

    const qasmName = QASM_NAMES[gate.symbol];
    if (!qasmName) {
      throw new Error(`Gate ${gate.name} has no OpenQASM 2.0 representation`);
    }

    if (gate.params && gate.params.length > 0) {
      lines.push(`${qasmName}(${gate.params.join(',')}) ${args};`);
    } else {
      lines.push(`${qasmName} ${args};`);
    }
  }

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export type ParsedInstruction =
  | { kind: 'gate'; name: string; params: number[]; qubits: number[] }
  | { kind: 'measure'; qubit: number };

export interface ParsedProgram {
  numQubits: number;
  instructions: ParsedInstruction[];
}

/**
 * Parse an OpenQASM 2.0 program (single quantum register, qelib1 gate subset,
 * no user-defined gates). Angle parameters support pi, + - * / and parentheses.
 */
export function parseQasm(source: string): ParsedProgram {
  // Strip line comments, then split on statement terminators.
  const cleaned = source.replace(/\/\/[^\n]*/g, '');
  const statements = cleaned
    .split(';')
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => s.length > 0);

  let qregName: string | null = null;
  let numQubits = 0;
  const instructions: ParsedInstruction[] = [];

  for (const stmt of statements) {
    if (/^OPENQASM\s/i.test(stmt) || /^include\s/.test(stmt) || /^barrier\b/.test(stmt) || /^creg\s/.test(stmt)) {
      continue;
    }

    const qreg = stmt.match(/^qreg\s+(\w+)\s*\[\s*(\d+)\s*\]$/);
    if (qreg) {
      if (qregName !== null) {
        throw new Error('Only a single quantum register is supported');
      }
      qregName = qreg[1];
      numQubits = parseInt(qreg[2], 10);
      continue;
    }

    const measure = stmt.match(/^measure\s+(\w+)\s*(?:\[\s*(\d+)\s*\])?\s*->\s*\w+\s*(?:\[\s*\d+\s*\])?$/);
    if (measure) {
      requireRegister(qregName, stmt);
      if (measure[1] !== qregName) {
        throw new Error(`Unknown register in: ${stmt}`);
      }
      if (measure[2] !== undefined) {
        instructions.push({ kind: 'measure', qubit: checkIndex(parseInt(measure[2], 10), numQubits, stmt) });
      } else {
        for (let q = 0; q < numQubits; q++) {
          instructions.push({ kind: 'measure', qubit: q });
        }
      }
      continue;
    }

    const gateApp = stmt.match(/^([a-zA-Z_]\w*)\s*(?:\(([^)]*)\))?\s+(.+)$/);
    if (gateApp) {
      requireRegister(qregName, stmt);
      const name = gateApp[1].toLowerCase();
      const params = gateApp[2] !== undefined && gateApp[2].trim() !== ''
        ? gateApp[2].split(',').map(evaluateAngle)
        : [];

      const argTokens = gateApp[3].split(',').map(a => a.trim());
      const indexed = argTokens.map(arg => {
        const m = arg.match(/^(\w+)\s*(?:\[\s*(\d+)\s*\])?$/);
        if (!m || m[1] !== qregName) {
          throw new Error(`Unknown register in: ${stmt}`);
        }
        return m[2] !== undefined ? checkIndex(parseInt(m[2], 10), numQubits, stmt) : null;
      });

      // Whole-register broadcast (e.g. "h q;") is allowed for one-qubit gates.
      if (indexed.length === 1 && indexed[0] === null) {
        for (let q = 0; q < numQubits; q++) {
          instructions.push({ kind: 'gate', name, params, qubits: [q] });
        }
      } else {
        if (indexed.some(i => i === null)) {
          throw new Error(`Whole-register arguments are only supported for single-qubit gates: ${stmt}`);
        }
        instructions.push({ kind: 'gate', name, params, qubits: indexed as number[] });
      }
      continue;
    }

    throw new Error(`Cannot parse QASM statement: ${stmt}`);
  }

  if (qregName === null) {
    throw new Error('QASM program declares no qreg');
  }

  return { numQubits, instructions };
}

function requireRegister(qregName: string | null, stmt: string): void {
  if (qregName === null) {
    throw new Error(`Statement before qreg declaration: ${stmt}`);
  }
}

function checkIndex(index: number, numQubits: number, stmt: string): number {
  if (index < 0 || index >= numQubits) {
    throw new Error(`Qubit index out of range in: ${stmt}`);
  }
  return index;
}

// ---------------------------------------------------------------------------
// Angle expression evaluator: numbers, pi, + - * /, parentheses, unary minus.
// ---------------------------------------------------------------------------

function evaluateAngle(expression: string): number {
  const parser = new AngleParser(expression);
  const value = parser.parseExpression();
  parser.expectEnd();
  return value;
}

class AngleParser {
  private pos = 0;

  constructor(private readonly text: string) {}

  parseExpression(): number {
    let value = this.parseTerm();
    for (;;) {
      this.skipSpace();
      const c = this.text[this.pos];
      if (c === '+') {
        this.pos++;
        value += this.parseTerm();
      } else if (c === '-') {
        this.pos++;
        value -= this.parseTerm();
      } else {
        return value;
      }
    }
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    for (;;) {
      this.skipSpace();
      const c = this.text[this.pos];
      if (c === '*') {
        this.pos++;
        value *= this.parseFactor();
      } else if (c === '/') {
        this.pos++;
        value /= this.parseFactor();
      } else {
        return value;
      }
    }
  }

  private parseFactor(): number {
    this.skipSpace();
    const c = this.text[this.pos];

    if (c === '-') {
      this.pos++;
      return -this.parseFactor();
    }
    if (c === '+') {
      this.pos++;
      return this.parseFactor();
    }
    if (c === '(') {
      this.pos++;
      const value = this.parseExpression();
      this.skipSpace();
      if (this.text[this.pos] !== ')') {
        throw new Error(`Expected ')' in angle expression: ${this.text}`);
      }
      this.pos++;
      return value;
    }

    const rest = this.text.slice(this.pos);
    const pi = rest.match(/^pi\b/i);
    if (pi) {
      this.pos += 2;
      return Math.PI;
    }

    const num = rest.match(/^\d+(\.\d+)?([eE][+-]?\d+)?/);
    if (num) {
      this.pos += num[0].length;
      return parseFloat(num[0]);
    }

    throw new Error(`Cannot parse angle expression: ${this.text}`);
  }

  expectEnd(): void {
    this.skipSpace();
    if (this.pos < this.text.length) {
      throw new Error(`Unexpected trailing input in angle expression: ${this.text}`);
    }
  }

  private skipSpace(): void {
    while (this.text[this.pos] === ' ') this.pos++;
  }
}
