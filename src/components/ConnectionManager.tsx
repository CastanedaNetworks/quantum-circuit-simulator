import React, { useState, useCallback } from 'react';
import { PlacedGate } from '../types/dragAndDrop';

interface ConnectionManagerProps {
  placedGates: PlacedGate[];
  onGateUpdated: (gateId: string, updatedGate: PlacedGate) => void;
  isConnectionMode: boolean;
  numQubits: number;
}

interface ConnectionState {
  sourceGateId: string | null;
  sourceQubit: number | null;
  isConnecting: boolean;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  placedGates,
  onGateUpdated,
  isConnectionMode,
  numQubits,
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    sourceGateId: null,
    sourceQubit: null,
    isConnecting: false,
  });

  const handleQubitClick = useCallback(
    (qubitIndex: number, gateId?: string) => {
      if (!isConnectionMode) return;

      if (!connectionState.isConnecting) {
        // Start connection
        setConnectionState({
          sourceGateId: gateId || null,
          sourceQubit: qubitIndex,
          isConnecting: true,
        });
      } else {
        // Complete connection
        if (
          connectionState.sourceQubit !== null &&
          connectionState.sourceQubit !== qubitIndex
        ) {
          createConnection(
            connectionState.sourceQubit,
            qubitIndex
          );
        }
        
        // Reset connection state
        setConnectionState({
          sourceGateId: null,
          sourceQubit: null,
          isConnecting: false,
        });
      }
    },
    [isConnectionMode, connectionState]
  );

  const createConnection = (
    fromQubit: number,
    toQubit: number
  ) => {
    // Find gates that could be connected
    const connectableGates = placedGates.filter(gate => 
      gate.gate.qubits > 1 && 
      (gate.targetQubits.includes(fromQubit) || gate.targetQubits.includes(toQubit))
    );

    if (connectableGates.length > 0) {
      const gate = connectableGates[0];
      const newTargetQubits = [fromQubit, toQubit].sort((a, b) => a - b);
      
      const updatedGate: PlacedGate = {
        ...gate,
        targetQubits: newTargetQubits,
        connections: [
          ...(gate.connections || []),
          { fromQubit, toQubit }
        ]
      };

      onGateUpdated(gate.id, updatedGate);
    }
  };

  const renderConnectionOverlay = () => {
    if (!isConnectionMode) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Connection indicators */}
        {Array.from({ length: numQubits }, (_, qIndex) => (
          <div
            key={`connection-indicator-${qIndex}`}
            className={`absolute w-6 h-6 rounded-full border-2 transition-all duration-200 pointer-events-auto cursor-pointer ${
              connectionState.sourceQubit === qIndex
                ? 'bg-yellow-500 border-yellow-400'
                : connectionState.isConnecting
                ? 'bg-blue-500 border-blue-400 hover:bg-blue-400'
                : 'bg-gray-600 border-gray-500 hover:bg-gray-500'
            }`}
            style={{
              top: `${qIndex * 64 + 32 - 12}px`,
              left: '-12px',
            }}
            onClick={() => handleQubitClick(qIndex)}
            title={
              connectionState.isConnecting
                ? `Connect to qubit ${qIndex}`
                : `Start connection from qubit ${qIndex}`
            }
          />
        ))}

        {/* Connection preview line */}
        {connectionState.isConnecting && connectionState.sourceQubit !== null && (
          <svg className="absolute inset-0 w-full h-full">
            <line
              x1={0}
              y1={connectionState.sourceQubit * 64 + 32}
              x2={0}
              y2={connectionState.sourceQubit * 64 + 32}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </svg>
        )}
      </div>
    );
  };

  const renderConnectionGuide = () => {
    if (!isConnectionMode) return null;

    return (
      <div className="absolute -bottom-16 left-0 right-0 bg-gray-800 rounded p-2 text-sm text-gray-300">
        {connectionState.isConnecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Click another qubit to complete the connection</span>
            <button
              onClick={() => setConnectionState({
                sourceGateId: null,
                sourceQubit: null,
                isConnecting: false,
              })}
              className="ml-auto px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Click a qubit to start connecting multi-qubit gates</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {renderConnectionOverlay()}
      {renderConnectionGuide()}
    </div>
  );
};