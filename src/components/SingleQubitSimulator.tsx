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
        console.error('Error applying gate:', error);
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
    return <div className="text-white">Loading simulator...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bloch Sphere Visualization */}
      <EnhancedBlochSphere
        quantumState={currentState}
        onStateChange={handleStateChange}
      />

      {/* Gate Controls */}
      <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Single Qubit Operations</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gate Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quantum Gates</h3>
            <div className="grid grid-cols-2 gap-3">
              {singleQubitGates.map((gate) => (
                <button
                  key={gate.name}
                  onClick={() => {
                    setSelectedGate(gate);
                    applyGate(gate);
                  }}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedGate?.name === gate.name
                      ? 'bg-blue-900 border-blue-500 shadow-lg'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">
                      {gate.symbol}
                    </div>
                    <div className="text-sm text-gray-300">
                      {gate.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Gate Information */}
            {selectedGate && (
              <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                <h4 className="text-white font-semibold mb-2">{selectedGate.name} Gate</h4>
                <div className="text-sm text-gray-300 mb-3">
                  {getGateDescription(selectedGate)}
                </div>
                <div className="font-mono text-xs">
                  <div className="text-gray-400 mb-1">Matrix:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {selectedGate.matrix.flat().map((element, idx) => (
                      <div key={idx} className="bg-gray-700 p-1 rounded text-center text-blue-400">
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
            <h3 className="text-lg font-semibold text-white mb-3">Simulator Controls</h3>
            <div className="space-y-3">
              <button
                onClick={resetSimulator}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reset to |0⟩
              </button>
              
              <button
                onClick={measureQubit}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Measure Qubit
              </button>

              <div className="p-3 bg-gray-800 rounded">
                <h4 className="text-white font-semibold mb-2">Current Probabilities</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">P(|0⟩):</span>
                    <span className="text-white font-mono">
                      {(currentState.getMeasurementProbability(0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">P(|1⟩):</span>
                    <span className="text-white font-mono">
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
          <h3 className="text-lg font-semibold text-white mb-3">Execution Log</h3>
          <div className="bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
            {executionLog.map((entry, index) => (
              <div key={index} className="text-gray-300 text-sm mb-1">
                {index + 1}. {entry}
              </div>
            ))}
          </div>
        </div>

        {/* Common Quantum Circuits */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Common Circuits</h3>
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
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
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
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Phase Flip
            </button>
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