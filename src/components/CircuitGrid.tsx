import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { DragTypes, DragItem, PlacedGate } from '../types/dragAndDrop';
import { QuantumGate } from '../types/quantum';
import { PlacedGateComponent } from './PlacedGateComponent';

interface CircuitGridProps {
  numQubits: number;
  numColumns: number;
  placedGates: PlacedGate[];
  onGatePlaced: (gate: PlacedGate) => void;
  onGateRemoved: (gateId: string) => void;
  onGateMoved: (gateId: string, newPosition: { row: number; col: number }) => void;
}

interface GridCellProps {
  row: number;
  col: number;
  onDrop: (gate: QuantumGate, position: { row: number; col: number }) => void;
  isOccupied: boolean;
  placedGate?: PlacedGate;
}

const GridCell: React.FC<GridCellProps> = ({ row, col, onDrop, isOccupied, placedGate }) => {
  console.log('[GridCell] Creating drop target for:', row, col, 'occupied:', isOccupied);
  
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DragTypes.GATE,
    drop: (item: DragItem) => {
      console.log('[GridCell] Item dropped:', item, 'at position:', row, col);
      if (!isOccupied) {
        console.log('[GridCell] Calling onDrop for gate:', item.gate.name);
        onDrop(item.gate, { row, col });
      } else {
        console.log('[GridCell] Cell occupied, drop rejected');
      }
    },
    canDrop: () => !isOccupied,
    collect: (monitor: any) => {
      const isOver = monitor.isOver();
      const canDrop = monitor.canDrop();
      if (isOver || canDrop) {
        console.log('[GridCell] Hover state:', { row, col, isOver, canDrop });
      }
      return { isOver, canDrop };
    },
  });

  const cellRef = useRef<HTMLDivElement>(null);
  drop(cellRef);

  const getCellClasses = () => {
    const baseClasses = 'w-16 h-16 border border-gray-600 relative transition-all duration-200';
    
    if (isOccupied && placedGate) {
      return `${baseClasses} bg-blue-900 border-blue-500`;
    }
    
    if (isOver && canDrop) {
      return `${baseClasses} bg-green-900 border-green-500 border-2`;
    }
    
    if (canDrop) {
      return `${baseClasses} bg-gray-800 hover:bg-gray-700`;
    }
    
    return `${baseClasses} bg-gray-900`;
  };

  return (
    <div ref={cellRef} className={getCellClasses()}>
      {placedGate && (
        <PlacedGateComponent
          placedGate={placedGate}
          onRemove={() => {}}
          onMove={() => {}}
        />
      )}
    </div>
  );
};

export const CircuitGrid: React.FC<CircuitGridProps> = ({
  numQubits,
  numColumns,
  placedGates,
  onGatePlaced,
  onGateRemoved,
}) => {
  const [connectionMode, setConnectionMode] = useState(false);

  const handleGatePlaced = (gate: QuantumGate, position: { row: number; col: number }) => {
    const newGate: PlacedGate = {
      id: `gate-${Date.now()}-${Math.random()}`,
      gate,
      position,
      targetQubits: gate.qubits === 1 ? [position.row] : [position.row, position.row + 1],
    };
    onGatePlaced(newGate);
  };

  const isPositionOccupied = (row: number, col: number): boolean => {
    return placedGates.some(gate => 
      gate.position.row === row && gate.position.col === col
    );
  };

  const getPlacedGateAt = (row: number, col: number): PlacedGate | undefined => {
    return placedGates.find(gate => 
      gate.position.row === row && gate.position.col === col
    );
  };

  console.log('[CircuitGrid] Rendering with', numQubits, 'qubits,', numColumns, 'columns,', placedGates.length, 'placed gates');

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Circuit Builder</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setConnectionMode(!connectionMode)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              connectionMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {connectionMode ? 'Exit Connection Mode' : 'Connection Mode'}
          </button>
          <button
            onClick={() => placedGates.forEach(gate => onGateRemoved(gate.id))}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mb-2 text-xs text-gray-400">
        Grid: {numQubits} qubits × {numColumns} columns • Gates: {placedGates.length}
      </div>

      <div className="relative">
        {/* Qubit labels and wires */}
        <div className="flex">
          <div className="w-16 flex flex-col">
            {Array.from({ length: numQubits }, (_, qIndex) => (
              <div key={qIndex} className="h-16 flex items-center justify-center">
                <span className="text-white font-mono text-sm">q{qIndex}</span>
              </div>
            ))}
          </div>

          {/* Circuit grid */}
          <div className="flex-1 relative" style={{ minHeight: `${numQubits * 64}px` }}>
            {/* Quantum wires */}
            {Array.from({ length: numQubits }, (_, qIndex) => (
              <div
                key={`wire-${qIndex}`}
                className="absolute h-0.5 bg-gray-500 w-full"
                style={{
                  top: `${(qIndex + 0.5) * 64}px`,
                  left: 0,
                  right: 0,
                }}
              />
            ))}

            {/* Grid background for visual reference */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(156, 163, 175, 0.1) 0px, rgba(156, 163, 175, 0.1) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(90deg, rgba(156, 163, 175, 0.1) 0px, rgba(156, 163, 175, 0.1) 1px, transparent 1px, transparent 64px)',
                backgroundSize: '64px 64px'
              }}
            />

            {/* Gate placement grid */}
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${numColumns}, minmax(64px, 1fr))`,
                gridTemplateRows: `repeat(${numQubits}, 64px)`,
                maxWidth: '100%'
              }}
            >
              {Array.from({ length: numQubits * numColumns }, (_, index) => {
                const row = Math.floor(index / numColumns);
                const col = index % numColumns;
                const isOccupied = isPositionOccupied(row, col);
                const placedGate = getPlacedGateAt(row, col);

                return (
                  <GridCell
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    onDrop={handleGatePlaced}
                    isOccupied={isOccupied}
                    placedGate={placedGate}
                  />
                );
              })}
            </div>

            {/* Connection lines for multi-qubit gates */}
            {placedGates
              .filter(gate => gate.gate.qubits > 1)
              .map(gate => (
                <div key={`connection-${gate.id}`}>
                  {gate.targetQubits.map((_, index) => {
                    if (index === gate.targetQubits.length - 1) return null;
                    
                    const startY = (gate.targetQubits[index] + 0.5) * 64 + (gate.position.row * 1);
                    const endY = (gate.targetQubits[index + 1] + 0.5) * 64 + ((gate.targetQubits[index + 1]) * 1);
                    const x = (gate.position.col + 0.5) * 64 + (gate.position.col * 1);
                    
                    return (
                      <div
                        key={`line-${index}`}
                        className="absolute w-0.5 bg-blue-400"
                        style={{
                          left: `${x}px`,
                          top: `${Math.min(startY, endY)}px`,
                          height: `${Math.abs(endY - startY)}px`,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
          <p className="mb-1">
            <strong>Instructions:</strong> Drag gates from the palette to place them on the circuit.
          </p>
          <p className="mb-1">
            • Single-qubit gates can be placed on any qubit wire
          </p>
          <p>
            • Multi-qubit gates will automatically connect to adjacent qubits
          </p>
        </div>
      </div>
    </div>
  );
};