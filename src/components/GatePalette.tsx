import React from 'react';
import { QuantumGate } from '../types/quantum';
import { availableGates } from '../quantum/gates';

interface GatePaletteProps {
  onGateSelect: (gate: QuantumGate) => void;
  selectedGate: QuantumGate | null;
}

export const GatePalette: React.FC<GatePaletteProps> = ({ onGateSelect, selectedGate }) => {
  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">Quantum Gates</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {availableGates.map((gate) => (
          <button
            key={gate.name}
            onClick={() => onGateSelect(gate)}
            className={`p-4 rounded-lg transition-all duration-200 ${
              selectedGate?.name === gate.name
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <div className="text-2xl font-bold mb-1">{gate.symbol}</div>
            <div className="text-sm">{gate.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              {gate.qubits} qubit{gate.qubits > 1 ? 's' : ''}
            </div>
          </button>
        ))}
      </div>
      
      {selectedGate && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h3 className="text-lg font-semibold text-white mb-2">Gate Matrix</h3>
          <div className="text-xs font-mono text-gray-300">
            {selectedGate.matrix.map((row, i) => (
              <div key={i} className="flex gap-4">
                {row.map((val, j) => (
                  <span key={j} className="text-blue-400">
                    {val.toString()}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};