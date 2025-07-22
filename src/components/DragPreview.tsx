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
          <div className="bg-blue-600 border-2 border-blue-400 rounded-lg p-3 shadow-lg transform rotate-3">
            <div className="text-white text-center">
              <div className="text-xl font-bold">{item.gate.symbol}</div>
              <div className="text-xs mt-1">{item.gate.name}</div>
            </div>
          </div>
        );
      
      case DragTypes.PLACED_GATE:
        return (
          <div className="bg-purple-600 border-2 border-purple-400 rounded-lg p-3 shadow-lg transform -rotate-2">
            <div className="text-white text-center">
              <div className="text-xl font-bold">{item.placedGate.gate.symbol}</div>
              <div className="text-xs mt-1">Moving...</div>
            </div>
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