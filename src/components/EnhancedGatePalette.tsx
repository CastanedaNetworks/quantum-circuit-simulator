import React, { useState } from 'react';
import { QuantumGate } from '../types/quantum';
import { availableGates } from '../quantum/gates';
import { DraggableGate } from './DraggableGate';

interface EnhancedGatePaletteProps {
  onGateSelect?: (gate: QuantumGate) => void;
  selectedGate?: QuantumGate | null;
}

type FilterType = 'all' | 'single' | 'multi';

export const EnhancedGatePalette: React.FC<EnhancedGatePaletteProps> = ({
  onGateSelect,
  selectedGate,
}) => {
  const [expandedGate, setExpandedGate] = useState<QuantumGate | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');

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

  const handleGateClick = (gate: QuantumGate) => {
    if (onGateSelect) onGateSelect(gate);
    setExpandedGate(expandedGate?.name === gate.name ? null : gate);
  };

  const formatMatrixElement = (element: any) => {
    try {
      if (typeof element === 'object' && element !== null && element.re !== undefined) {
        const real = Number(element.re) || 0;
        const imag = Number(element.im) || 0;
        const trim = (n: number) => n.toFixed(3).replace(/\.?0+$/, '');
        if (Math.abs(imag) < 1e-10) return trim(real);
        if (Math.abs(real) < 1e-10) return `${trim(imag)}i`;
        return `${trim(real)}${imag >= 0 ? '+' : ''}${trim(imag)}i`;
      }
      return String(element || 0);
    } catch {
      return '0';
    }
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'single', label: 'Single' },
    { id: 'multi', label: 'Multi' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm">
      <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Gate Palette
        </h2>
        <div className="flex border border-slate-300 rounded overflow-hidden">
          {filters.map(({ id, label }, i) => (
            <button
              key={id}
              onClick={() => setFilterType(id)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                i > 0 ? 'border-l border-slate-300' : ''
              } ${
                filterType === id
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Drag a gate onto the circuit grid to place it. Click a gate to inspect its
          matrix.
        </p>

        {filteredGates.length > 0 ? (
          <div className="space-y-2">
            {filteredGates.map(gate => (
              <div key={gate.name} className="space-y-2">
                <DraggableGate
                  gate={gate}
                  isSelected={selectedGate?.name === gate.name}
                  onClick={() => handleGateClick(gate)}
                />

                {expandedGate?.name === gate.name && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-3">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      {gate.name} matrix
                    </h4>
                    <div className="font-mono text-sm">
                      <div
                        className="grid gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${gate.matrix?.[0]?.length || 2}, 1fr)`,
                        }}
                      >
                        {(gate.matrix && Array.isArray(gate.matrix) ? gate.matrix.flat() : []).map(
                          (element, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-slate-200 px-2 py-1.5 rounded-sm text-center text-blue-800 text-xs"
                            >
                              {formatMatrixElement(element)}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                      {getGateDescription(gate)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 mb-4">No gates match the current filter.</p>
            <button
              onClick={() => setFilterType('all')}
              className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 transition-colors"
            >
              Show all gates
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
      return 'Bit flip gate: |0⟩ → |1⟩ and |1⟩ → |0⟩. Equivalent to the classical NOT gate.';
    case 'Pauli-Y':
      return 'Bit and phase flip: |0⟩ → i|1⟩ and |1⟩ → -i|0⟩';
    case 'Pauli-Z':
      return 'Phase flip gate: |0⟩ → |0⟩ and |1⟩ → -|1⟩. Flips the phase of the |1⟩ state.';
    case 'CNOT':
      return 'Controlled-NOT: flips the target qubit when the control qubit is |1⟩. Creates entanglement.';
    case 'S':
      return 'Phase gate: |1⟩ → i|1⟩, a 90° rotation about the z-axis. S² = Z.';
    case 'T':
      return 'π/8 gate: |1⟩ → e^{iπ/4}|1⟩. Together with H and CNOT it makes a universal gate set.';
    case 'CZ':
      return 'Controlled-Z: phase-flips |11⟩. Symmetric — either qubit can be viewed as the control.';
    case 'SWAP':
      return 'Exchanges the states of two qubits.';
    case 'Toffoli':
      return 'Controlled-controlled-NOT: flips the target only when both controls are |1⟩. The reversible AND gate.';
    default:
      return 'Quantum gate operation.';
  }
}
