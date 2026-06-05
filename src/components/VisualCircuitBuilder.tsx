import React, { useState, useEffect } from 'react';
import { CircuitGrid } from './CircuitGrid';
import { ConnectionManager } from './ConnectionManager';
import { PlacedGate } from '../types/dragAndDrop';
import { CircuitElement } from '../types/quantum';

interface VisualCircuitBuilderProps {
  numQubits: number;
  onCircuitChange: (circuit: CircuitElement[]) => void;
  onRunCircuit?: () => void;
}

export const VisualCircuitBuilder: React.FC<VisualCircuitBuilderProps> = ({
  numQubits,
  onCircuitChange,
  onRunCircuit,
}) => {
  const [placedGates, setPlacedGates] = useState<PlacedGate[]>([]);
  const [connectionMode, setConnectionMode] = useState(false);
  const numColumns = 8; // Number of time steps in the circuit

  // Convert placed gates to circuit elements for simulation
  useEffect(() => {
    const circuitElements: CircuitElement[] = placedGates.map((placedGate) => ({
      gate: placedGate.gate,
      targetQubits: placedGate.targetQubits,
      position: placedGate.position.col, // Use column as time position
    }));

    onCircuitChange(circuitElements);
  }, [placedGates, onCircuitChange]);

  const handleGatePlaced = (gate: PlacedGate) => {
    setPlacedGates(prev => [...prev, gate]);
  };

  const handleGateRemoved = (gateId: string) => {
    setPlacedGates(prev => prev.filter(gate => gate.id !== gateId));
  };

  const handleGateMoved = (gateId: string, newPosition: { row: number; col: number }) => {
    setPlacedGates(prev =>
      prev.map(gate =>
        gate.id === gateId
          ? { ...gate, position: newPosition }
          : gate
      )
    );
  };

  const handleGateUpdated = (gateId: string, updatedGate: PlacedGate) => {
    setPlacedGates(prev =>
      prev.map(gate =>
        gate.id === gateId ? updatedGate : gate
      )
    );
  };

  const clearAllGates = () => {
    setPlacedGates([]);
  };

  const exportCircuit = () => {
    const circuitData = {
      numQubits,
      gates: placedGates.map(gate => ({
        gateName: gate.gate.name,
        position: gate.position,
        targetQubits: gate.targetQubits,
      })),
    };
    
    const dataStr = JSON.stringify(circuitData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quantum-circuit.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getCircuitStats = () => {
    const gatesByType = placedGates.reduce((acc, gate) => {
      acc[gate.gate.name] = (acc[gate.gate.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const depth = Math.max(...placedGates.map(gate => gate.position.col), 0) + 1;
    const totalGates = placedGates.length;

    return { gatesByType, depth, totalGates };
  };

  const stats = getCircuitStats();

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-md shadow-sm">
        {/* Header with controls */}
        <div className="flex justify-between items-center gap-4 px-5 py-3 border-b border-slate-200 flex-wrap">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Visual Circuit Builder
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag gates from the palette to build your circuit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRunCircuit}
              disabled={placedGates.length === 0}
              className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded border border-blue-700 hover:bg-blue-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
            >
              ▶ Run
            </button>

            <button
              onClick={() => setConnectionMode(!connectionMode)}
              className={`px-3 py-1.5 text-sm font-medium rounded border transition-colors ${
                connectionMode
                  ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {connectionMode ? 'Exit Connections' : 'Connections'}
            </button>

            <button
              onClick={exportCircuit}
              disabled={placedGates.length === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
            >
              Export
            </button>

            <button
              onClick={clearAllGates}
              disabled={placedGates.length === 0}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:border-red-300 hover:text-red-700 disabled:text-slate-400 disabled:border-slate-200 disabled:hover:border-slate-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="p-5">

        {/* Circuit stats */}
        {placedGates.length > 0 && (
          <div className="mb-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-6 text-sm">
              <div className="text-slate-500">
                Total gates
                <span className="text-slate-900 ml-2 font-mono font-semibold">{stats.totalGates}</span>
              </div>
              <div className="text-slate-500">
                Depth
                <span className="text-slate-900 ml-2 font-mono font-semibold">{stats.depth}</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs font-mono">
              {Object.entries(stats.gatesByType).map(([gateName, count]) => (
                <div key={gateName} className="text-slate-500">
                  <span className="text-slate-700">{gateName}</span> ×{count}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main circuit area */}
        <div className="relative mb-6">
          <CircuitGrid
            numQubits={numQubits}
            numColumns={numColumns}
            placedGates={placedGates}
            onGatePlaced={handleGatePlaced}
            onGateRemoved={handleGateRemoved}
            onGateMoved={handleGateMoved}
          />
          
          <ConnectionManager
            placedGates={placedGates}
            onGateUpdated={handleGateUpdated}
            isConnectionMode={connectionMode}
            numQubits={numQubits}
          />
        </div>

        {/* Instructions panel */}
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Instructions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-600">
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Basic Operations</h4>
              <ul className="space-y-1 text-[13px]">
                <li>Drag gates from the palette to place them</li>
                <li>Double-click placed gates to remove them</li>
                <li>Single-qubit gates place on the selected qubit</li>
                <li>Multi-qubit gates connect adjacent qubits</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Advanced Features</h4>
              <ul className="space-y-1 text-[13px]">
                <li>Use Connections for custom qubit links</li>
                <li>Export circuits as JSON for later use</li>
                <li>Monitor circuit statistics in real-time</li>
                <li>Visual feedback shows drag operations</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};