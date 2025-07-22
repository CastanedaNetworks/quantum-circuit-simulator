import React from 'react';
import { useDrag } from 'react-dnd';
import { DragTypes, DragItem } from '../types/dragAndDrop';
import { QuantumGate } from '../types/quantum';

interface DraggableGateProps {
  gate: QuantumGate;
  isSelected?: boolean;
  onClick?: () => void;
}

export const DraggableGate: React.FC<DraggableGateProps> = ({ 
  gate, 
  isSelected = false, 
  onClick 
}) => {
  console.log('[DraggableGate] Rendering gate:', gate.name, 'selected:', isSelected);
  
  const [{ isDragging }, drag] = useDrag({
    type: DragTypes.GATE,
    item: (): DragItem => {
      console.log('[DraggableGate] Creating drag item for:', gate.name);
      return {
        type: DragTypes.GATE,
        gate,
        id: `gate-${gate.name}-${Date.now()}`,
      };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      console.log('[DraggableGate] Drag ended for:', gate.name, 'dropped:', monitor.didDrop());
    },
  });
  
  console.log('[DraggableGate] isDragging:', isDragging, 'drag ref:', !!drag);

  const getGateColor = () => {
    switch (gate.name) {
      case 'Hadamard':
        return isSelected 
          ? 'bg-yellow-600 border-yellow-400 shadow-yellow-500/50' 
          : 'bg-yellow-700 border-yellow-600 hover:bg-yellow-600';
      case 'Pauli-X':
        return isSelected 
          ? 'bg-red-600 border-red-400 shadow-red-500/50' 
          : 'bg-red-700 border-red-600 hover:bg-red-600';
      case 'Pauli-Y':
        return isSelected 
          ? 'bg-green-600 border-green-400 shadow-green-500/50' 
          : 'bg-green-700 border-green-600 hover:bg-green-600';
      case 'Pauli-Z':
        return isSelected 
          ? 'bg-blue-600 border-blue-400 shadow-blue-500/50' 
          : 'bg-blue-700 border-blue-600 hover:bg-blue-600';
      case 'CNOT':
        return isSelected 
          ? 'bg-purple-600 border-purple-400 shadow-purple-500/50' 
          : 'bg-purple-700 border-purple-600 hover:bg-purple-600';
      default:
        return isSelected 
          ? 'bg-gray-600 border-gray-400 shadow-gray-500/50' 
          : 'bg-gray-700 border-gray-600 hover:bg-gray-600';
    }
  };

  const getGateIcon = () => {
    switch (gate.symbol) {
      case 'H':
        return (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">H</div>
            <div className="text-xs mt-1">Hadamard</div>
          </div>
        );
      case 'X':
        return (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">X</div>
            <div className="text-xs mt-1">NOT</div>
          </div>
        );
      case 'Y':
        return (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">Y</div>
            <div className="text-xs mt-1">Pauli-Y</div>
          </div>
        );
      case 'Z':
        return (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">Z</div>
            <div className="text-xs mt-1">Phase</div>
          </div>
        );
      case 'CX':
        return (
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-4 h-0.5 bg-white"></div>
              <div className="w-4 h-4 border-2 border-white rounded-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-white"></div>
                  <div className="w-0.5 h-2 bg-white absolute"></div>
                </div>
              </div>
            </div>
            <div className="text-xs mt-1">CNOT</div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{gate.symbol}</div>
            <div className="text-xs mt-1">{gate.name}</div>
          </div>
        );
    }
  };

  return (
    <div
      ref={drag}
      onClick={() => {
        // Only handle click if it wasn't a drag operation
        if (!isDragging && onClick) {
          onClick();
        }
      }}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 cursor-move select-none min-h-[80px] flex flex-col justify-center
        ${getGateColor()}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'}
        ${isSelected ? 'shadow-lg transform scale-105' : ''}
      `}
      style={{ minWidth: '120px' }}
      onMouseDown={() => console.log('[DraggableGate] Mouse down on:', gate.name)}
    >
      <div className="text-white text-center">
        {getGateIcon()}
      </div>
      
      <div className="text-center mt-2">
        <div className="text-xs text-gray-200">
          {gate.qubits} qubit{gate.qubits > 1 ? 's' : ''}
        </div>
      </div>

      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-white text-sm font-semibold">Dragging...</div>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      )}

      {/* Fallback indicator if drag is broken */}
      {!drag && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Drag disabled"></div>
        </div>
      )}
    </div>
  );
};