import React, { useState, useEffect } from 'react';
import { EnhancedBlochSphere } from './EnhancedBlochSphere';
import { QuantumSimulator } from '../quantum/simulator';
import { QuantumState } from '../quantum/state';
import { availableGates } from '../quantum/gates';
import { QuantumGate } from '../types/quantum';

interface SingleQubitSimulatorProps {}

export const SingleQubitSimulator: React.FC<SingleQubitSimulatorProps> = () => {
  const [simulator, setSimulator] = useState<QuantumSimulator | null>(null);
  const [currentState, setCurrentState] = useState<QuantumState | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [selectedGate, setSelectedGate] = useState<QuantumGate | null>(null);

  // Initialize simulator
  useEffect(() => {
    const sim = new QuantumSimulator(1);
    setSimulator(sim);
    setCurrentState(sim.getCurrentState());
    setExecutionLog(sim.getExecutionLog());
  }, []);

  const handleStateChange = (newState: QuantumState) => {
    if (simulator) {
      // Create new simulator with custom state
      const newSimulator = new QuantumSimulator(1);
      newSimulator.setInitialState(newState.getAmplitudes().map(amp => amp.re));
      setSimulator(newSimulator);
      setCurrentState(newSimulator.getCurrentState());
      setExecutionLog(newSimulator.getExecutionLog());
    }
  };

  const applyGate = (gate: QuantumGate) => {
    if (simulator && gate.qubits === 1) {
      try {
        simulator.applyGate(gate, [0]);
        setCurrentState(simulator.getCurrentState());
        setExecutionLog(simulator.getExecutionLog());
      } catch (error) {
        // Gate application failed; state is unchanged.
      }
    }
  };

  const resetSimulator = () => {
    if (simulator) {
      simulator.reset();
      setCurrentState(simulator.getCurrentState());
      setExecutionLog(simulator.getExecutionLog());
    }
  };

  const measureQubit = () => {
    if (simulator) {
      const result = simulator.measureQubit(0);
      setCurrentState(simulator.getCurrentState());
      setExecutionLog(simulator.getExecutionLog());
      return result;
    }
    return null;
  };

  const singleQubitGates = availableGates.filter(gate => gate.qubits === 1);

  if (!currentState) {
    return <div className="text-sm text-slate-500">Loading simulator...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bloch Sphere Visualization */}
      <EnhancedBlochSphere
        quantumState={currentState}
        onStateChange={handleStateChange}
      />

      {/* Gate Controls */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm">
        <div className="px-5 py-3 border-b border-slate-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Single Qubit Operations
          </h2>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gate Selection */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Quantum Gates
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {singleQubitGates.map((gate) => (
                  <button
                    key={gate.name}
                    onClick={() => {
                      setSelectedGate(gate);
                      applyGate(gate);
                    }}
                    className={`p-3 rounded border transition-colors ${
                      selectedGate?.name === gate.name
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                        : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xl font-mono font-semibold text-slate-900 mb-1">
                        {gate.symbol}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {gate.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Gate Information */}
              {selectedGate && (
                <div className="mt-4 bg-slate-50 border border-slate-200 rounded p-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {selectedGate.name} Gate
                  </h4>
                  <div className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {getGateDescription(selectedGate)}
                  </div>
                  <div className="font-mono text-xs">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Matrix</div>
                    <div className="grid grid-cols-2 gap-1">
                      {selectedGate.matrix.flat().map((element, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 px-2 py-1.5 rounded-sm text-center text-blue-800">
                          {formatMatrixElement(element)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulator Controls */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Simulator Controls
              </h3>
              <div className="space-y-3">
                <button
                  onClick={resetSimulator}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 hover:border-red-300 hover:text-red-700 transition-colors"
                >
                  Reset to |0⟩
                </button>

                <button
                  onClick={measureQubit}
                  className="w-full px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded border border-blue-700 hover:bg-blue-800 transition-colors"
                >
                  Measure Qubit
                </button>

                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Current Probabilities</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">P(|0⟩):</span>
                      <span className="text-slate-800 font-mono text-sm">
                        {(currentState.getMeasurementProbability(0) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 text-sm">P(|1⟩):</span>
                      <span className="text-slate-800 font-mono text-sm">
                        {(currentState.getMeasurementProbability(1) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Log */}
          <div className="mt-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Execution Log
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 max-h-32 overflow-y-auto">
              {executionLog.map((entry, index) => (
                <div key={index} className="text-slate-600 text-xs font-mono mb-0.5">
                  <span className="text-slate-400">{String(index + 1).padStart(2, '0')}</span>{' '}
                  {entry}
                </div>
              ))}
            </div>
          </div>

          {/* Common Quantum Circuits */}
          <div className="mt-6">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Common Circuits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  resetSimulator();
                  if (simulator) {
                    simulator.applyGate(availableGates.find(g => g.name === 'Hadamard')!, [0]);
                    setCurrentState(simulator.getCurrentState());
                    setExecutionLog(simulator.getExecutionLog());
                  }
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Create Superposition
              </button>

              <button
                onClick={() => {
                  resetSimulator();
                  if (simulator) {
                    simulator.applyGate(availableGates.find(g => g.name === 'Pauli-X')!, [0]);
                    setCurrentState(simulator.getCurrentState());
                    setExecutionLog(simulator.getExecutionLog());
                  }
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Bit Flip
              </button>

              <button
                onClick={() => {
                  resetSimulator();
                  if (simulator) {
                    const hadamard = availableGates.find(g => g.name === 'Hadamard')!;
                    const pauliZ = availableGates.find(g => g.name === 'Pauli-Z')!;
                    simulator.applyGate(hadamard, [0]);
                    simulator.applyGate(pauliZ, [0]);
                    simulator.applyGate(hadamard, [0]);
                    setCurrentState(simulator.getCurrentState());
                    setExecutionLog(simulator.getExecutionLog());
                  }
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Phase Flip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getGateDescription(gate: QuantumGate): string {
  switch (gate.name) {
    case 'Hadamard':
      return 'Creates superposition by rotating the qubit state. Transforms |0⟩ → (|0⟩ + |1⟩)/√2';
    case 'Pauli-X':
      return 'Bit flip gate that swaps |0⟩ and |1⟩ states. Quantum equivalent of classical NOT gate.';
    case 'Pauli-Y':
      return 'Combined bit and phase flip. Rotates around Y-axis of Bloch sphere.';
    case 'Pauli-Z':
      return 'Phase flip gate that adds -1 phase to |1⟩ state. Rotates around Z-axis.';
    default:
      return 'Quantum gate operation.';
  }
}

function formatMatrixElement(element: any): string {
  if (typeof element === 'object' && element.re !== undefined) {
    const real = parseFloat(element.re.toFixed(3));
    const imag = parseFloat(element.im.toFixed(3));
    
    if (Math.abs(imag) < 0.001) {
      return real.toString();
    } else if (Math.abs(real) < 0.001) {
      return `${imag}i`;
    } else {
      return `${real}${imag >= 0 ? '+' : ''}${imag}i`;
    }
  }
  return element.toString();
}