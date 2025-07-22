import React, { useState } from 'react';
import { CircuitElement, QuantumGate } from '../types/quantum';

interface CircuitBuilderProps {
  numQubits: number;
  onCircuitChange: (circuit: CircuitElement[]) => void;
  selectedGate?: QuantumGate | null;
}

export const CircuitBuilder: React.FC<CircuitBuilderProps> = ({ numQubits, onCircuitChange, selectedGate }) => {
  const [circuit, setCircuit] = useState<CircuitElement[]>([]);

  const addGateToCircuit = (gate: QuantumGate, targetQubits: number[]) => {
    const newElement: CircuitElement = {
      gate,
      targetQubits,
      position: circuit.length
    };
    const updatedCircuit = [...circuit, newElement];
    setCircuit(updatedCircuit);
    onCircuitChange(updatedCircuit);
  };

  const removeGate = (position: number) => {
    const updatedCircuit = circuit.filter((_, idx) => idx !== position);
    setCircuit(updatedCircuit);
    onCircuitChange(updatedCircuit);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Circuit Builder</h2>
      
      <div className="relative">
        {Array.from({ length: numQubits }, (_, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex items-center">
              <span className="text-white mr-4 w-16">|q{idx}⟩</span>
              <div 
                className="flex-1 h-0.5 bg-gray-600 relative cursor-pointer hover:bg-gray-500 transition-colors"
                onClick={() => {
                  if (selectedGate) {
                    if (selectedGate.qubits === 1) {
                      addGateToCircuit(selectedGate, [idx]);
                    } else if (selectedGate.qubits === 2 && idx < numQubits - 1) {
                      addGateToCircuit(selectedGate, [idx, idx + 1]);
                    }
                  }
                }}>
                {circuit
                  .filter(el => el.targetQubits.includes(idx))
                  .map((el, gateIdx) => (
                    <div
                      key={gateIdx}
                      className="absolute -top-4 bg-blue-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700 transition-colors"
                      style={{ left: `${el.position * 80}px` }}
                      onClick={() => removeGate(el.position)}
                    >
                      {el.gate.symbol}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
        
        {selectedGate && (
          <div className="mt-6 p-4 bg-gray-800 rounded">
            <p className="text-white mb-2">
              Selected Gate: <span className="font-bold">{selectedGate.name}</span>
            </p>
            <p className="text-gray-400 text-sm">
              Click on a qubit line to add the gate
            </p>
          </div>
        )}
      </div>
    </div>
  );
};