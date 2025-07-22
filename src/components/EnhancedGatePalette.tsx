import React, { useState } from 'react';
import { QuantumGate } from '../types/quantum';
import { availableGates } from '../quantum/gates';
import { DraggableGate } from './DraggableGate';

interface EnhancedGatePaletteProps {
  onGateSelect?: (gate: QuantumGate) => void;
  selectedGate?: QuantumGate | null;
}

export const EnhancedGatePalette: React.FC<EnhancedGatePaletteProps> = ({ 
  onGateSelect,
  selectedGate 
}) => {
  const [expandedGate, setExpandedGate] = useState<QuantumGate | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'single' | 'multi'>('all');

  const filteredGates = availableGates.filter(gate => {
    switch (filterType) {
      case 'single':
        return gate.qubits === 1;
      case 'multi':
        return gate.qubits > 1;
      default:
        return true;
    }
  });

  console.log('[EnhancedGatePalette] Rendering with', availableGates.length, 'total gates,', filteredGates.length, 'filtered gates');
  console.log('[EnhancedGatePalette] Available gates:', availableGates.map(g => ({ name: g.name, matrix: !!g.matrix })));
  console.log('[EnhancedGatePalette] Filter type:', filterType);
  
  // Check for any gates with problematic matrices
  availableGates.forEach(gate => {
    if (!gate.matrix || !Array.isArray(gate.matrix) || gate.matrix.length === 0) {
      console.error('[EnhancedGatePalette] Gate with invalid matrix:', gate.name);
    }
  });

  const handleGateClick = (gate: QuantumGate) => {
    if (onGateSelect) {
      onGateSelect(gate);
    }
    setExpandedGate(expandedGate?.name === gate.name ? null : gate);
  };

  const formatMatrixElement = (element: any) => {
    try {
      if (typeof element === 'object' && element !== null && element.re !== undefined) {
        const real = Number(element.re) || 0;
        const imag = Number(element.im) || 0;
        
        if (Math.abs(imag) < 1e-10) {
          return real.toFixed(3).replace(/\.?0+$/, '');
        } else if (Math.abs(real) < 1e-10) {
          return `${imag.toFixed(3).replace(/\.?0+$/, '')}i`;
        } else {
          const imagStr = imag.toFixed(3).replace(/\.?0+$/, '');
          return `${real.toFixed(3).replace(/\.?0+$/, '')}${imag >= 0 ? '+' : ''}${imagStr}i`;
        }
      }
      return String(element || 0);
    } catch (error) {
      console.warn('[EnhancedGatePalette] Error formatting matrix element:', element, error);
      return '0';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Gate Palette</h2>
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('single')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'single' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Single
          </button>
          <button
            onClick={() => setFilterType('multi')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'multi' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Multi
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-gray-800 rounded text-sm text-gray-300">
          <p className="mb-1"><strong>Instructions:</strong></p>
          <p className="mb-1">• Drag gates to the circuit grid to place them</p>
          <p className="mb-1">• Click a gate to see its matrix representation</p>
          <p>• Use filters to show specific gate types</p>
          <p className="mt-2 text-xs text-gray-500">Debug: {availableGates.length} gates loaded</p>
        </div>

        {/* Simple test gates (always visible) */}
        <div className="mb-4">
          <h3 className="text-white text-sm font-semibold mb-2">Quick Test</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-700 text-white p-3 rounded text-center text-sm">
              X Gate
            </div>
            <div className="bg-yellow-700 text-white p-3 rounded text-center text-sm">
              H Gate
            </div>
            <div className="bg-blue-700 text-white p-3 rounded text-center text-sm">
              Z Gate
            </div>
            <div className="bg-purple-700 text-white p-3 rounded text-center text-sm">
              CNOT
            </div>
          </div>
        </div>

        {filteredGates.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredGates.map((gate) => {
              try {
                return (
                  <div key={gate.name} className="space-y-2">
                    <DraggableGate
                      gate={gate}
                      isSelected={selectedGate?.name === gate.name}
                      onClick={() => handleGateClick(gate)}
                    />
                    
                    {expandedGate?.name === gate.name && (
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-white font-semibold mb-2">
                          {gate.name} Matrix
                        </h4>
                        <div className="font-mono text-sm">
                          <div className="grid gap-1" style={{ 
                            gridTemplateColumns: `repeat(${gate.matrix?.[0]?.length || 2}, 1fr)` 
                          }}>
                            {(gate.matrix && Array.isArray(gate.matrix) ? gate.matrix.flat() : []).map((element, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-700 p-2 rounded text-center text-blue-400"
                              >
                                {formatMatrixElement(element)}
                              </div>
                            ))}
                            {(!gate.matrix || !Array.isArray(gate.matrix) || gate.matrix.length === 0) && (
                              <div className="text-red-400 text-center">Matrix data unavailable</div>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                          <p><strong>Description:</strong></p>
                          <p>{getGateDescription(gate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              } catch (error) {
                console.error('[EnhancedGatePalette] Error rendering gate:', gate.name, error);
                return (
                  <div key={gate.name} className="bg-red-900 border border-red-600 rounded p-3">
                    <p className="text-red-200 text-sm">
                      Error rendering gate: {gate.name}
                    </p>
                    <p className="text-red-400 text-xs mt-1">
                      Check console for details
                    </p>
                  </div>
                );
              }
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <p>No gates match the current filter.</p>
              <p className="text-sm mt-2">Total available gates: {availableGates.length}</p>
            </div>
            <button
              onClick={() => setFilterType('all')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Show All Gates
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function getGateDescription(gate: QuantumGate): string {
  switch (gate.name) {
    case 'Hadamard':
      return 'Creates superposition by rotating |0⟩ to (|0⟩ + |1⟩)/√2 and |1⟩ to (|0⟩ - |1⟩)/√2';
    case 'Pauli-X':
      return 'Bit flip gate: |0⟩ → |1⟩ and |1⟩ → |0⟩. Equivalent to classical NOT gate.';
    case 'Pauli-Y':
      return 'Bit and phase flip: |0⟩ → i|1⟩ and |1⟩ → -i|0⟩';
    case 'Pauli-Z':
      return 'Phase flip gate: |0⟩ → |0⟩ and |1⟩ → -|1⟩. Flips the phase of |1⟩ state.';
    case 'CNOT':
      return 'Controlled NOT gate: flips target qubit if control qubit is |1⟩. Creates entanglement.';
    default:
      return 'Quantum gate operation.';
  }
}