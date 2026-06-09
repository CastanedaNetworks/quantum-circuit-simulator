import React, { useRef } from 'react';
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
  canPlace: (gate: QuantumGate) => boolean;
}

const GridCell: React.FC<GridCellProps> = ({ row, col, onDrop, isOccupied, placedGate, canPlace }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: DragTypes.GATE,
    drop: (item: DragItem) => {
      if (canPlace(item.gate)) {
        onDrop(item.gate, { row, col });
      }
    },
    canDrop: (item: DragItem) => canPlace(item.gate),
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const cellRef = useRef<HTMLDivElement>(null);
  drop(cellRef);

  const getCellClasses = () => {
    const baseClasses = 'w-16 h-16 border border-slate-200 relative transition-colors';

    if (isOccupied && placedGate) {
      return `${baseClasses} bg-blue-50 border-blue-300`;
    }

    if (isOver && canDrop) {
      return `${baseClasses} bg-blue-100 border-blue-500`;
    }

    if (canDrop) {
      return `${baseClasses} bg-white hover:bg-slate-50`;
    }

    return `${baseClasses} bg-white`;
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

const CELL = 64; // px — matches the w-16/h-16 cell size

export const CircuitGrid: React.FC<CircuitGridProps> = ({
  numQubits,
  numColumns,
  placedGates,
  onGatePlaced,
}) => {
  const handleGatePlaced = (gate: QuantumGate, position: { row: number; col: number }) => {
    const newGate: PlacedGate = {
      id: `gate-${Date.now()}-${Math.random()}`,
      gate,
      position,
      // A k-qubit gate spans k consecutive wires starting at the drop row;
      // for controlled gates the drop row is the (first) control.
      targetQubits: Array.from({ length: gate.qubits }, (_, k) => position.row + k),
    };
    onGatePlaced(newGate);
  };

  // A cell is covered if any gate in the same column spans its row.
  const isPositionOccupied = (row: number, col: number): boolean => {
    return placedGates.some(gate =>
      gate.position.col === col &&
      row >= gate.position.row &&
      row < gate.position.row + gate.gate.qubits
    );
  };

  // A gate fits if it stays on the grid and none of the wires it would span
  // are already covered in that column.
  const canPlaceGate = (gate: QuantumGate, row: number, col: number): boolean => {
    if (row + gate.qubits > numQubits) return false;
    for (let k = 0; k < gate.qubits; k++) {
      if (isPositionOccupied(row + k, col)) return false;
    }
    return true;
  };

  const getPlacedGateAt = (row: number, col: number): PlacedGate | undefined => {
    return placedGates.find(gate => 
      gate.position.row === row && gate.position.col === col
    );
  };

  const gridWidth = numColumns * CELL;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex" style={{ width: 'max-content' }}>
        {/* Qubit labels */}
        <div className="flex flex-col flex-shrink-0 pr-3">
          {Array.from({ length: numQubits }, (_, qIndex) => (
            <div
              key={qIndex}
              className="flex items-center justify-end"
              style={{ height: CELL }}
            >
              <span className="text-slate-500 font-mono text-sm">q{qIndex}</span>
            </div>
          ))}
        </div>

        {/* Circuit grid + wires */}
        <div
          className="relative flex-shrink-0"
          style={{ width: gridWidth, height: numQubits * CELL }}
        >
          {/* Quantum wires */}
          {Array.from({ length: numQubits }, (_, qIndex) => (
            <div
              key={`wire-${qIndex}`}
              className="absolute h-px bg-slate-300"
              style={{ top: (qIndex + 0.5) * CELL, left: 0, width: gridWidth }}
            />
          ))}

          {/* Gate placement grid */}
          <div
            className="grid absolute inset-0"
            style={{
              gridTemplateColumns: `repeat(${numColumns}, ${CELL}px)`,
              gridTemplateRows: `repeat(${numQubits}, ${CELL}px)`,
            }}
          >
            {Array.from({ length: numQubits * numColumns }, (_, index) => {
              const row = Math.floor(index / numColumns);
              const col = index % numColumns;
              return (
                <GridCell
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  onDrop={handleGatePlaced}
                  isOccupied={isPositionOccupied(row, col)}
                  placedGate={getPlacedGateAt(row, col)}
                  canPlace={(gate) => canPlaceGate(gate, row, col)}
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

                  const startY = (gate.targetQubits[index] + 0.5) * CELL;
                  const endY = (gate.targetQubits[index + 1] + 0.5) * CELL;
                  const x = (gate.position.col + 0.5) * CELL;

                  return (
                    <div
                      key={`line-${index}`}
                      className="absolute w-px bg-slate-800"
                      style={{
                        left: x,
                        top: Math.min(startY, endY),
                        height: Math.abs(endY - startY),
                      }}
                    />
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};