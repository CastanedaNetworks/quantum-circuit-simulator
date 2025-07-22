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
      <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Visual Circuit Builder</h2>
            <p className="text-gray-400 text-sm mt-1">
              Drag gates from the palette to build your quantum circuit
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onRunCircuit}
              disabled={placedGates.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors font-semibold"
            >
              ▶ Run Circuit
            </button>
            
            <button
              onClick={() => setConnectionMode(!connectionMode)}
              className={`px-4 py-2 rounded transition-colors ${
                connectionMode 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {connectionMode ? 'Exit Connection Mode' : 'Connection Mode'}
            </button>
            
            <button
              onClick={exportCircuit}
              disabled={placedGates.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
            >
              Export Circuit
            </button>
            
            <button
              onClick={clearAllGates}
              disabled={placedGates.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Circuit stats */}
        {placedGates.length > 0 && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex space-x-6">
                <div>
                  <span className="text-gray-400 text-sm">Total Gates:</span>
                  <span className="text-white ml-2 font-semibold">{stats.totalGates}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Circuit Depth:</span>
                  <span className="text-white ml-2 font-semibold">{stats.depth}</span>
                </div>
              </div>
              
              <div className="flex space-x-4 text-sm">
                {Object.entries(stats.gatesByType).map(([gateName, count]) => (
                  <div key={gateName} className="text-gray-300">
                    <span className="font-semibold">{gateName}:</span> {count}
                  </div>
                ))}
              </div>
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
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-1">Basic Operations:</h4>
              <ul className="space-y-1">
                <li>• Drag gates from the palette to place them</li>
                <li>• Double-click placed gates to remove them</li>
                <li>• Single-qubit gates place on the selected qubit</li>
                <li>• Multi-qubit gates automatically connect adjacent qubits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Advanced Features:</h4>
              <ul className="space-y-1">
                <li>• Use Connection Mode for custom qubit connections</li>
                <li>• Export circuits as JSON for later use</li>
                <li>• Monitor circuit statistics in real-time</li>
                <li>• Visual feedback shows drag operations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};