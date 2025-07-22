import React from 'react';
import { QuantumGate } from '../types/quantum';

interface SimpleGateCardProps {
  gate: QuantumGate;
  isSelected?: boolean;
  onClick?: () => void;
}

export const SimpleGateCard: React.FC<SimpleGateCardProps> = ({
  gate,
  isSelected = false,
  onClick
}) => {
  const getGateColor = () => {
    switch (gate.name) {
      case 'Hadamard':
        return isSelected 
          ? 'bg-yellow-600 border-yellow-400' 
          : 'bg-yellow-700 border-yellow-600 hover:bg-yellow-600';
      case 'Pauli-X':
        return isSelected 
          ? 'bg-red-600 border-red-400' 
          : 'bg-red-700 border-red-600 hover:bg-red-600';
      case 'Pauli-Y':
        return isSelected 
          ? 'bg-green-600 border-green-400' 
          : 'bg-green-700 border-green-600 hover:bg-green-600';
      case 'Pauli-Z':
        return isSelected 
          ? 'bg-blue-600 border-blue-400' 
          : 'bg-blue-700 border-blue-600 hover:bg-blue-600';
      case 'CNOT':
        return isSelected 
          ? 'bg-purple-600 border-purple-400' 
          : 'bg-purple-700 border-purple-600 hover:bg-purple-600';
      default:
        return isSelected 
          ? 'bg-gray-600 border-gray-400' 
          : 'bg-gray-700 border-gray-600 hover:bg-gray-600';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 cursor-pointer select-none min-h-[80px] flex flex-col justify-center transition-all duration-200
        ${getGateColor()}
        ${isSelected ? 'shadow-lg transform scale-105' : 'hover:scale-105'}
      `}
      style={{ minWidth: '120px' }}
    >
      <div className="text-white text-center">
        <div className="text-2xl font-bold mb-1">{gate.symbol}</div>
        <div className="text-xs">{gate.name}</div>
      </div>
      
      <div className="text-center mt-2">
        <div className="text-xs text-gray-200">
          {gate.qubits} qubit{gate.qubits > 1 ? 's' : ''}
        </div>
      </div>

      {isSelected && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
};