import { describe, it, expect } from 'vitest';
import { QuantumCircuit, mulberry32 } from '../quantum/circuit';
import { QuantumOperations } from '../quantum/operations';

const SQRT2 = Math.sqrt(2);

describe('QuantumCircuit fluent API', () => {
  it('builds a Bell state with h(0).cx(0,1)', () => {
    const circuit = new QuantumCircuit(2).h(0).cx(0, 1);
    const state = circuit.statevector();

    expect(state.getAmplitude(0).re).toBeCloseTo(1 / SQRT2, 10);
    expect(state.getAmplitude(1).re).toBeCloseTo(0, 10);
    expect(state.getAmplitude(2).re).toBeCloseTo(0, 10);
    expect(state.getAmplitude(3).re).toBeCloseTo(1 / SQRT2, 10);
  });

  it('samples Bell-state shots: only 00 and 11, roughly half each', () => {
    const circuit = new QuantumCircuit(2).h(0).cx(0, 1).measureAll();
    const { counts, shots } = circuit.run({ shots: 2000, seed: 42 });

    expect(Object.keys(counts).sort()).toEqual(['00', '11']);
    expect((counts['00'] || 0) + (counts['11'] || 0)).toBe(shots);
    expect(counts['00'] / shots).toBeGreaterThan(0.45);
    expect(counts['00'] / shots).toBeLessThan(0.55);
  });

  it('measures a subset of qubits in ascending order', () => {
    // 3 qubits, X on q1 only; measure q2 and q1 → bitstring is [q1, q2] = "10"
    const circuit = new QuantumCircuit(3).x(1).measure(2, 1);
    const { counts, measuredQubits } = circuit.run({ shots: 100, seed: 7 });

    expect(measuredQubits).toEqual([1, 2]);
    expect(counts).toEqual({ '10': 100 });
  });

  it('treats a circuit without measure ops as measure-all', () => {
    const circuit = new QuantumCircuit(2).x(0);
    const { counts } = circuit.run({ shots: 50, seed: 1 });
    expect(counts).toEqual({ '10': 50 });
  });

  it('handles mid-circuit measurement via trajectories', () => {
    // Measure q0 after H, then copy it onto q1: outcomes must be correlated.
    const circuit = new QuantumCircuit(2).h(0).measure(0).cx(0, 1).measureAll();
    const { counts, shots } = circuit.run({ shots: 500, seed: 99 });

    expect(Object.keys(counts).sort()).toEqual(['00', '11']);
    expect((counts['00'] || 0) + (counts['11'] || 0)).toBe(shots);
  });

  it('builds a 10-qubit GHZ state beyond the old 5-qubit limit', () => {
    const circuit = new QuantumCircuit(10);
    circuit.h(0);
    for (let q = 1; q < 10; q++) circuit.cx(0, q);

    const probs = circuit.probabilities();
    expect(probs[0]).toBeCloseTo(0.5, 10);
    expect(probs[probs.length - 1]).toBeCloseTo(0.5, 10);
  });

  it('statevector() rejects circuits with measurement or noise', () => {
    expect(() => new QuantumCircuit(1).h(0).measure(0).statevector()).toThrow();
    expect(() => new QuantumCircuit(1).bitFlip(0.5, 0).statevector()).toThrow();
  });

  it('validates qubit indices and shot counts', () => {
    expect(() => new QuantumCircuit(2).h(2)).toThrow('out of range');
    expect(() => new QuantumCircuit(2).cx(0, 0)).toThrow('distinct');
    expect(() => new QuantumCircuit(1).run({ shots: 0 })).toThrow('positive integer');
    expect(() => new QuantumCircuit(0)).toThrow();
  });

  it('is reproducible with a fixed seed', () => {
    const make = () => new QuantumCircuit(2).h(0).cx(0, 1).measureAll().run({ shots: 200, seed: 1234 });
    expect(make().counts).toEqual(make().counts);
  });

  it('mulberry32 yields uniform values in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('noise channels', () => {
  it('bitFlip(1.0) deterministically flips', () => {
    const circuit = new QuantumCircuit(1).bitFlip(1.0, 0).measure(0);
    const { counts } = circuit.run({ shots: 100, seed: 5 });
    expect(counts).toEqual({ '1': 100 });
  });

  it('bitFlip(0) never flips', () => {
    const circuit = new QuantumCircuit(1).bitFlip(0, 0).measure(0);
    const { counts } = circuit.run({ shots: 100, seed: 5 });
    expect(counts).toEqual({ '0': 100 });
  });

  it('phaseFlip(1.0) between Hadamards acts as X (HZH = X)', () => {
    const circuit = new QuantumCircuit(1).h(0).phaseFlip(1.0, 0).h(0).measure(0);
    const { counts } = circuit.run({ shots: 100, seed: 5 });
    expect(counts).toEqual({ '1': 100 });
  });

  it('bitFlip(p) flips a ~p fraction of shots', () => {
    const p = 0.3;
    const shots = 4000;
    const circuit = new QuantumCircuit(1).bitFlip(p, 0).measure(0);
    const { counts } = circuit.run({ shots, seed: 11 });

    const flipped = (counts['1'] || 0) / shots;
    expect(flipped).toBeGreaterThan(p - 0.03);
    expect(flipped).toBeLessThan(p + 0.03);
  });

  it('depolarizing(p) flips |0⟩ with probability 2p/3 (X and Y flip, Z does not)', () => {
    const p = 0.75;
    const shots = 4000;
    const circuit = new QuantumCircuit(1).depolarizing(p, 0).measure(0);
    const { counts } = circuit.run({ shots, seed: 23 });

    const flipped = (counts['1'] || 0) / shots;
    expect(flipped).toBeGreaterThan(0.5 - 0.03);
    expect(flipped).toBeLessThan(0.5 + 0.03);
  });

  it('rejects probabilities outside [0, 1]', () => {
    expect(() => new QuantumCircuit(1).bitFlip(1.5, 0)).toThrow();
    expect(() => new QuantumCircuit(1).depolarizing(-0.1, 0)).toThrow();
  });
});

describe('OpenQASM 2.0 interop', () => {
  it('exports the expected program text', () => {
    const circuit = new QuantumCircuit(2).h(0).cx(0, 1).rz(Math.PI / 2, 1).measureAll();
    const qasm = circuit.toQasm();

    expect(qasm).toContain('OPENQASM 2.0;');
    expect(qasm).toContain('include "qelib1.inc";');
    expect(qasm).toContain('qreg q[2];');
    expect(qasm).toContain('h q[0];');
    expect(qasm).toContain('cx q[0],q[1];');
    expect(qasm).toContain(`rz(${Math.PI / 2}) q[1];`);
    expect(qasm).toContain('measure q[0] -> c[0];');
    expect(qasm).toContain('measure q[1] -> c[1];');
  });

  it('round-trips a parameterized circuit with fidelity 1', () => {
    const original = new QuantumCircuit(3)
      .h(0)
      .t(1)
      .sdg(2)
      .rx(0.3, 0)
      .ry(1.1, 1)
      .rz(-0.7, 2)
      .p(Math.PI / 5, 0)
      .cx(0, 1)
      .cz(1, 2)
      .swap(0, 2)
      .cp(Math.PI / 4, 0, 2)
      .ccx(0, 1, 2);

    const reimported = QuantumCircuit.fromQasm(original.toQasm());
    const fidelity = QuantumOperations.calculateFidelity(
      original.statevector(),
      reimported.statevector()
    );
    expect(fidelity).toBeCloseTo(1, 10);
  });

  it('round-trips CCZ through its H·CCX·H decomposition', () => {
    const original = new QuantumCircuit(3).h(0).h(1).h(2).ccz(0, 1, 2);
    const reimported = QuantumCircuit.fromQasm(original.toQasm());

    const fidelity = QuantumOperations.calculateFidelity(
      original.statevector(),
      reimported.statevector()
    );
    expect(fidelity).toBeCloseTo(1, 10);
  });

  it('parses angle expressions, broadcasts, and whole-register measure', () => {
    const qasm = `
      OPENQASM 2.0;
      include "qelib1.inc";
      // prepare uniform superposition with a phase
      qreg q[2];
      creg c[2];
      h q;
      u1(pi/4) q[0];
      rz(-pi/2) q[1];
      barrier q;
      measure q -> c;
    `;

    const circuit = QuantumCircuit.fromQasm(qasm);
    expect(circuit.numQubits).toBe(2);

    const { counts, shots } = circuit.run({ shots: 400, seed: 3 });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(shots);
    // phases don't change computational-basis probabilities: ~uniform
    for (const key of ['00', '01', '10', '11']) {
      expect(counts[key] / shots).toBeGreaterThan(0.15);
    }
  });

  it('evaluates compound angle expressions', () => {
    const qasm = 'qreg q[1]; rz(2*pi/4 - pi/2) q[0];';
    const circuit = QuantumCircuit.fromQasm(qasm);
    // 2π/4 − π/2 = 0, so the circuit is the identity
    const probs = circuit.probabilities();
    expect(probs[0]).toBeCloseTo(1, 10);
  });

  it('rejects unknown gates and malformed programs', () => {
    expect(() => QuantumCircuit.fromQasm('qreg q[1]; foo q[0];')).toThrow('Unsupported QASM gate');
    expect(() => QuantumCircuit.fromQasm('h q[0];')).toThrow('before qreg');
    expect(() => QuantumCircuit.fromQasm('qreg q[1]; h q[5];')).toThrow('out of range');
    expect(() => QuantumCircuit.fromQasm('qreg q[1]; rz(pi/) q[0];')).toThrow();
  });

  it('refuses to export noise channels', () => {
    const circuit = new QuantumCircuit(1).h(0).bitFlip(0.1, 0);
    expect(() => circuit.toQasm()).toThrow('noise');
  });
});
