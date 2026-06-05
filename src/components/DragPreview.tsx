import React from 'react';
import { useDragLayer } from 'react-dnd';
import { DragTypes } from '../types/dragAndDrop';

interface DragPreviewProps {}

export const DragPreview: React.FC<DragPreviewProps> = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor: any) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    currentOffset: monitor.getClientOffset(),
  }));

  if (!isDragging || !currentOffset || !item) {
    return null;
  }

  const renderPreview = () => {
    switch (item.type) {
      case DragTypes.GATE:
        return (
          <div className="w-11 h-11 flex items-center justify-center rounded border border-slate-800 bg-white shadow-md">
            <span className="text-slate-900 font-mono text-lg font-semibold">{item.gate.symbol}</span>
          </div>
        );

      case DragTypes.PLACED_GATE:
        return (
          <div className="w-11 h-11 flex items-center justify-center rounded border border-blue-600 bg-blue-50 shadow-md">
            <span className="text-blue-800 font-mono text-lg font-semibold">{item.placedGate.gate.symbol}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed pointer-events-none z-50 transition-transform duration-100"
      style={{
        left: currentOffset.x - 25,
        top: currentOffset.y - 25,
      }}
    >
      {renderPreview()}
    </div>
  );
};