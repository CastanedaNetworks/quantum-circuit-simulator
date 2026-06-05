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
  onClick,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: DragTypes.GATE,
    item: (): DragItem => ({
      type: DragTypes.GATE,
      gate,
      id: `gate-${gate.name}-${Date.now()}`,
    }),
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onClick={() => {
        if (!isDragging && onClick) onClick();
      }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-move select-none transition-colors ${
        isSelected
          ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
          : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'
      } ${isDragging ? 'opacity-40' : ''}`}
      title={`${gate.name} — drag to the circuit grid`}
    >
      {/* Gate symbol — boxed, monospace, like a circuit-diagram element */}
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded border border-slate-800 bg-white text-slate-900 font-mono text-base font-semibold">
        {gate.symbol}
      </div>

      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">{gate.name}</div>
        <div className="text-[11px] uppercase tracking-wide text-slate-400 font-mono">
          {gate.qubits} qubit{gate.qubits > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
