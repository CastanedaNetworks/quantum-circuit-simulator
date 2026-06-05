import React, { useState } from 'react';

interface DebugPanelProps {
  simulator: any;
  simulationResult: any;
  circuit: any[];
  isVisible?: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  simulator,
  simulationResult,
  circuit,
  isVisible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white border border-slate-200 rounded-md shadow-md transition-all duration-300 ${isExpanded ? 'w-96' : 'w-48'}`}>
        <div
          className="px-3 py-2 bg-slate-50 border-b border-slate-200 rounded-t-md cursor-pointer flex justify-between items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Debug Panel</span>
          <span className="text-slate-400 text-xs font-mono">
            {isExpanded ? '−' : '+'}
          </span>
        </div>

        {isExpanded && (
          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">App State</h4>
              <div className="text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Simulator</span>
                  <span className={simulator ? 'text-green-600' : 'text-red-600'}>
                    {simulator ? 'Ready' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Circuit Gates</span>
                  <span className="text-slate-800">{circuit.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sim Result</span>
                  <span className={simulationResult ? 'text-green-600' : 'text-slate-400'}>
                    {simulationResult ? 'Available' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {simulator && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Simulator Info</h4>
                <div className="text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Qubits</span>
                    <span className="text-slate-800">{simulator.getNumQubits?.() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Log Entries</span>
                    <span className="text-slate-800">{simulator.getExecutionLog?.()?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {simulationResult && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Latest Result</h4>
                <div className="text-xs">
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded font-mono text-blue-800 max-h-20 overflow-auto break-all">
                    {simulationResult.finalState?.toString?.() || 'No state data'}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  console.log('[Debug] Current app state:', {
                    simulator,
                    simulationResult,
                    circuit,
                  });
                }}
                className="w-full px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50 transition-colors"
              >
                Log State to Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};