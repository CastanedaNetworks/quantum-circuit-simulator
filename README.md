# Quantum Circuit Simulator

An exact state-vector quantum circuit simulator written in TypeScript, with an interactive React front-end. The engine tracks the full 2ⁿ complex amplitude vector, supports registers up to **24 qubits**, and has no DOM dependencies — it runs in the browser, in Node, and in tests. The UI layers a drag-and-drop circuit builder, measurement histograms, a Bloch sphere, and step-by-step algorithm walkthroughs on top of it.

![TypeScript](https://img.shields.io/badge/typescript-5.2-blue)
![React](https://img.shields.io/badge/react-18.2-blue)
![Tests](https://img.shields.io/badge/tests-105%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

**Engine**
- Exact state-vector simulation on `Float64Array` storage, up to 24 qubits
- Full gate set: H, X, Y, Z, S, S†, T, T†, parameterized Rx(θ)/Ry(θ)/Rz(θ)/P(θ), CNOT, CY, CZ, CH, SWAP, CP(θ), CRZ(θ), Toffoli (CCX), CCZ — plus a `controlled()` factory that builds the controlled version of *any* gate with any number of controls
- Measurement: exact probability distributions, shot-based sampling, single-qubit measurement with correct state collapse, mid-circuit measurement
- Noise channels: bit-flip, phase-flip, and depolarizing, simulated by stochastic Pauli trajectories with a seedable RNG for reproducible runs
- OpenQASM 2.0 export and import (qelib1 gate subset)

**Algorithm demos** (all verified by unit tests)
- Bell state preparation
- Quantum teleportation (deferred-measurement form)
- Grover's search — finds the marked item |101⟩ with probability 121/128 ≈ 94.5% after 2 iterations
- Quantum Fourier transform — matches the DFT matrix exactly on all basis inputs

**UI**
- Drag-and-drop circuit builder (4-qubit grid) with multi-qubit gate placement
- Exact probability bars and a sampled 1024-shot histogram
- Interactive 3D Bloch sphere for single-qubit states
- Step-by-step algorithm execution with explanations of the math at each step

## Quick start

```bash
git clone https://github.com/CastanedaNetworks/quantum-circuit-simulator.git
cd quantum-circuit-simulator
npm install
npm run dev        # UI at http://localhost:5173
npm run test:run   # run the test suite
```

## Using the engine as a library

The engine lives under `src/quantum/` and is re-exported from `src/lib.ts`. Circuits are built with a fluent API:

```ts
import { QuantumCircuit } from './src/lib';

// Bell state:  ──H──●──   measure
//                   │
//              ─────⊕──   measure
const bell = new QuantumCircuit(2);
bell.h(0).cx(0, 1).measureAll();

const { counts } = bell.run({ shots: 1024, seed: 42 });
// → { '00': 514, '11': 510 }   (only correlated outcomes — entanglement)

const state = new QuantumCircuit(2).h(0).cx(0, 1).statevector();
state.toString();              // (1/√2)|00⟩ + (1/√2)|11⟩
state.getMeasurementProbabilities(); // [0.5, 0, 0, 0.5]
```

Parameterized and multi-controlled gates:

```ts
import { QuantumCircuit, controlled, ry } from './src/lib';

const circuit = new QuantumCircuit(3);
circuit
  .ry(Math.PI / 3, 0)          // rotation by θ = π/3
  .cp(Math.PI / 4, 0, 1)       // controlled phase
  .ccx(0, 1, 2)                // Toffoli
  .gate(controlled(ry(0.7), 2), 0, 1, 2); // double-controlled Ry — any gate, any controls
```

Noise and reproducibility:

```ts
const noisy = new QuantumCircuit(2);
noisy.h(0).cx(0, 1)
  .bitFlip(0.05, 0)        // 5% X error on qubit 0
  .depolarizing(0.02, 1)   // 2% depolarizing on qubit 1
  .measureAll();

noisy.run({ shots: 4096, seed: 7 }); // seeded → deterministic counts
```

OpenQASM 2.0 interop:

```ts
const qasm = bell.toQasm();
// OPENQASM 2.0;
// include "qelib1.inc";
// qreg q[2];
// creg c[2];
// h q[0];
// cx q[0],q[1];
// measure q[0] -> c[0];
// measure q[1] -> c[1];

const reimported = QuantumCircuit.fromQasm(qasm);
```

### Conventions

Qubit 0 is the **most significant bit**: the basis state |q₀q₁…qₙ₋₁⟩ reads left to right, and bitstring keys in `counts` follow the same order (Nielsen & Chuang convention). This is the opposite of Qiskit's little-endian ordering — when comparing outputs, reverse the bitstrings.

## The math

**State.** An n-qubit register is a unit vector |ψ⟩ ∈ ℂ^(2ⁿ): |ψ⟩ = Σₓ aₓ|x⟩ with Σ|aₓ|² = 1. The simulator stores the 2ⁿ amplitudes as two `Float64Array`s (real and imaginary parts).

**Gates.** A k-qubit gate is a 2ᵏ×2ᵏ unitary U. Rather than building the full 2ⁿ×2ⁿ operator U ⊗ I ⊗ …, the engine applies U directly: for each of the 2ⁿ⁻ᵏ assignments of the non-target qubits it gathers the 2ᵏ amplitudes spanned by the target qubits, multiplies by U, and scatters the results back. Cost: O(2ⁿ·2ᵏ) per gate, memory O(2ⁿ).

**Measurement.** Measuring qubit q yields 1 with probability p₁ = Σ_{x: xq=1} |aₓ|²; the state then collapses to the matching amplitudes renormalized by 1/√p. Shot sampling draws bitstrings from the exact final distribution (single simulation, then multinomial sampling) unless the circuit contains noise or mid-circuit measurement, in which case each shot runs its own trajectory.

**Noise.** Channels are simulated by stochastic unraveling: e.g. the bit-flip channel ρ → (1−p)ρ + p·XρX is realized by applying X with probability p in each trajectory. Averaged over shots this reproduces the channel statistics exactly, without a density-matrix representation. The depolarizing channel applies X, Y, or Z each with probability p/3.

## Algorithm demos

| Algorithm | Qubits | Result (tested) |
|---|---|---|
| Bell state | 2 | P(00) = P(11) = 1/2, perfectly correlated |
| Teleportation (deferred measurement) | 3 | Ry(π/3) state transferred to qubit 2 exactly; qubits 0,1 uniformly random |
| Grover (marked item 101) | 3 | P(101) = 121/128 ≈ 94.5% after 2 iterations |
| QFT | 3 | Equals the DFT matrix on all 8 basis inputs |

The Grover oracle is built from first principles — X(1)·CCZ·X(1) phase-flips exactly |101⟩ — and the diffusion operator is the textbook H⊗ⁿ·X⊗ⁿ·CCZ·X⊗ⁿ·H⊗ⁿ inversion about the mean. Teleportation uses the principle of deferred measurement (controlled-X/Z corrections in place of classically-conditioned ones), which is the exact equivalent expressible in a pure state-vector simulator.

## Performance and the exponential wall

State-vector simulation is exact but exponential: n qubits need 2ⁿ complex amplitudes (16 bytes each) and every gate touches all of them. Measured on this engine (GHZ circuit, n gates, `npm run bench`):

| Qubits | Amplitudes | Memory (state) | ms/gate |
|---|---|---|---|
| 8 | 256 | 4 KB | < 0.1 |
| 12 | 4,096 | 64 KB | 0.4 |
| 16 | 65,536 | 1 MB | 2 |
| 20 | 1,048,576 | 16 MB | 23 |
| 24 | 16,777,216 | 256 MB | 371 |

Each +4 qubits multiplies both memory and time per gate by 16. Extrapolating: 30 qubits would need 16 GB of state and minutes per gate; 40 qubits, 16 TB. That is the exponential wall — and the reason the engine caps registers at 24 qubits, which is roughly what a browser tab can hold. (Production simulators reach ~30–45 qubits with distributed memory, gate fusion, and SIMD, but the asymptotics are inescapable; this is precisely why quantum hardware is interesting.)

By default `npm run bench` stops at 16 qubits to keep CI fast; set `BENCH_MAX_QUBITS=24` for the full curve.

## Testing

```bash
npm run test:run   # 105 tests
npm run bench      # scaling benchmark
npm run lint
```

The suite covers known gate outputs (including phase/rotation gates and complex-amplitude paths), entanglement correlations, measurement collapse, state fidelity, every algorithm template's final distribution, QASM round-trips, and seeded noise statistics.

## Project structure

```
src/
├── quantum/              # Pure simulation engine (no DOM dependencies)
│   ├── state.ts          # QuantumState: 2^n amplitude vector on Float64Arrays
│   ├── operations.ts     # k-qubit gate application, measurement, sampling, fidelity
│   ├── gates.ts          # Gate definitions + controlled()/rotation factories
│   ├── circuit.ts        # QuantumCircuit fluent API, shots, noise trajectories
│   ├── qasm.ts           # OpenQASM 2.0 export/import
│   └── simulator.ts      # Stateful wrapper used by the UI (history, logs)
├── algorithms/           # Algorithm templates (Bell, teleport, Grover, QFT)
├── components/           # React UI (circuit builder, histograms, Bloch sphere)
├── utils/                # Bloch sphere math
├── tests/                # Vitest suites + scaling benchmark
└── lib.ts                # Library entry point
```

## Roadmap

- Density-matrix simulation mode for exact (non-sampled) noise
- More algorithms: Deutsch–Jozsa, Bernstein–Vazirani, phase estimation
- UI: qubit-count selector, angle input for parameterized gates, QASM import/export from the interface
- Gate fusion and other engine optimizations

## License

MIT — see [LICENSE](LICENSE).

## Author

**Louis Castaneda** — [CastanedaNetworks](https://github.com/CastanedaNetworks)

Built with React, TypeScript, Vite, Tailwind CSS, Three.js, and mathjs. Gate conventions follow Nielsen & Chuang, *Quantum Computation and Quantum Information*.
