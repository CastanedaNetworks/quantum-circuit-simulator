import React from 'react';
import { useDrag } from 'react-dnd';
import { DragTypes, PlacedGate } from '../types/dragAndDrop';

interface PlacedGateComponentProps {
  placedGate: PlacedGate;
  onRemove: (gateId: string) => void;
  onMove: (gateId: string, newPosition: { row: number; col: number }) => void;
}

export const PlacedGateComponent: React.FC<PlacedGateComponentProps> = ({
  placedGate,
  onRemove,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: DragTypes.PLACED_GATE,
    item: { type: DragTypes.PLACED_GATE, placedGate },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(placedGate.id);
  };

  const getGateColor = () => {
    switch (placedGate.gate.name) {
      case 'Hadamard':
        return 'bg-yellow-600 border-yellow-500';
      case 'Pauli-X':
        return 'bg-red-600 border-red-500';
      case 'Pauli-Y':
        return 'bg-green-600 border-green-500';
      case 'Pauli-Z':
        return 'bg-blue-600 border-blue-500';
      case 'CNOT':
        return 'bg-purple-600 border-purple-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  const getGateShape = () => {
    if (placedGate.gate.symbol === 'CX') {
      // CNOT gate - show control and target
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {placedGate.targetQubits[0] === placedGate.position.row ? (
            // Control qubit (filled circle)
            <div className="w-4 h-4 bg-white rounded-full" />
          ) : (
            // Target qubit (circle with plus)
            <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-4 h-0.5 bg-white" />
              <div className="w-0.5 h-4 bg-white absolute" />
            </div>
          )}
        </div>
      );
    }

    // Single qubit gate - show symbol
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">
          {placedGate.gate.symbol}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={drag}
      className={`absolute inset-2 rounded cursor-move transition-all duration-200 border-2 ${getGateColor()} ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      }`}
      onDoubleClick={handleDoubleClick}
      title={`${placedGate.gate.name} - Double click to remove`}
    >
      {getGateShape()}
      
      {/* Hover tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
        {placedGate.gate.name}
      </div>
    </div>
  );
};