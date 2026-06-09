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

  const createConnection = useCallback(
    (fromQubit: number, toQubit: number) => {
      // Find gates that could be connected
      const connectableGates = placedGates.filter(gate =>
        gate.gate.qubits > 1 &&
        (gate.targetQubits.includes(fromQubit) || gate.targetQubits.includes(toQubit))
      );

      if (connectableGates.length > 0) {
        const gate = connectableGates[0];
        // Preserve the drawn direction: the qubit the user dragged FROM becomes
        // the control, the one dragged TO becomes the target.
        const newTargetQubits = [fromQubit, toQubit];

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
    },
    [placedGates, onGateUpdated]
  );

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
    [isConnectionMode, connectionState, createConnection]
  );

  const renderConnectionOverlay = () => {
    if (!isConnectionMode) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Connection indicators */}
        {Array.from({ length: numQubits }, (_, qIndex) => (
          <div
            key={`connection-indicator-${qIndex}`}
            className={`absolute w-6 h-6 rounded-full border transition-colors pointer-events-auto cursor-pointer ${
              connectionState.sourceQubit === qIndex
                ? 'bg-blue-700 border-blue-800'
                : connectionState.isConnecting
                ? 'bg-blue-100 border-blue-400 hover:bg-blue-200'
                : 'bg-white border-slate-400 hover:bg-slate-100'
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
              stroke="#1d4ed8"
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
      <div className="absolute -bottom-16 left-0 right-0 bg-white border border-slate-200 rounded p-2 text-sm text-slate-600 shadow-sm">
        {connectionState.isConnecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-blue-700 rounded-full animate-pulse"></div>
            <span>Click another qubit to complete the connection</span>
            <button
              onClick={() => setConnectionState({
                sourceGateId: null,
                sourceQubit: null,
                isConnecting: false,
              })}
              className="ml-auto px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded text-xs hover:border-red-300 hover:text-red-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-slate-400 rounded-full"></div>
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