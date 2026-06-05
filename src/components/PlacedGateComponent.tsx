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

  const isCnot = placedGate.gate.symbol === 'CX';
  const isControl = placedGate.targetQubits[0] === placedGate.position.row;

  const getGateShape = () => {
    if (isCnot) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {isControl ? (
            // Control qubit — solid dot
            <div className="w-3 h-3 bg-slate-900 rounded-full" />
          ) : (
            // Target qubit — ⊕ symbol
            <div className="w-6 h-6 border border-slate-900 rounded-full flex items-center justify-center">
              <div className="w-3.5 h-px bg-slate-900" />
              <div className="w-px h-3.5 bg-slate-900 absolute" />
            </div>
          )}
        </div>
      );
    }

    // Single-qubit gate — boxed monospace letter, as in a circuit diagram
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-slate-900 font-mono font-semibold text-sm">
          {placedGate.gate.symbol}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={drag}
      className={`absolute inset-2 rounded-sm cursor-move transition-opacity ${
        isCnot ? '' : 'border border-slate-900 bg-white'
      } ${isDragging ? 'opacity-40' : ''}`}
      onDoubleClick={handleDoubleClick}
      title={`${placedGate.gate.name} — double-click to remove`}
    >
      {getGateShape()}
    </div>
  );
};
