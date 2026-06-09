import { describe, it, expect } from 'vitest';
import { QuantumCircuit } from '../quantum/circuit';

// Default keeps the regular test run fast. For the full curve:
//   $env:BENCH_MAX_QUBITS=24; npm run test:run -- src/tests/benchmark.test.ts
const MAX_QUBITS = Number(process.env.BENCH_MAX_QUBITS ?? 16);

describe('state-vector scaling benchmark', () => {
  it(
    `builds GHZ states up to ${MAX_QUBITS} qubits and logs timing`,
    { timeout: 300_000 },
    () => {
      const rows: Array<{ qubits: number; amplitudes: number; gates: number; ms: number }> = [];

      for (let n = 4; n <= MAX_QUBITS; n += 4) {
        const circuit = new QuantumCircuit(n);
        circuit.h(0);
        for (let q = 1; q < n; q++) circuit.cx(0, q);

        const start = performance.now();
        const state = circuit.statevector();
        const ms = performance.now() - start;

        rows.push({ qubits: n, amplitudes: 2 ** n, gates: n, ms });

        // GHZ: all weight on |0...0⟩ and |1...1⟩
        expect(state.getMeasurementProbability(0)).toBeCloseTo(0.5, 8);
        expect(state.getMeasurementProbability(2 ** n - 1)).toBeCloseTo(0.5, 8);
      }

      console.log('\n qubits | amplitudes | gates | total ms | ms/gate');
      console.log(' ------ | ---------- | ----- | -------- | -------');
      for (const r of rows) {
        console.log(
          ` ${String(r.qubits).padStart(6)} | ${String(r.amplitudes).padStart(10)} | ${String(r.gates).padStart(5)} | ${r.ms.toFixed(1).padStart(8)} | ${(r.ms / r.gates).toFixed(2).padStart(7)}`
        );
      }
    }
  );
});
