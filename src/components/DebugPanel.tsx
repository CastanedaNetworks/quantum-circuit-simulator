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
      <div className={`bg-gray-800 border border-gray-600 rounded-lg shadow-xl transition-all duration-300 ${isExpanded ? 'w-96' : 'w-48'}`}>
        <div 
          className="p-3 bg-gray-700 rounded-t-lg cursor-pointer flex justify-between items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-white text-sm font-semibold">Debug Panel</span>
          <span className="text-gray-300 text-xs">
            {isExpanded ? '−' : '+'}
          </span>
        </div>
        
        {isExpanded && (
          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            <div>
              <h4 className="text-white text-xs font-semibold mb-1">App State</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Simulator:</span>
                  <span className={simulator ? 'text-green-400' : 'text-red-400'}>
                    {simulator ? 'Ready' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Circuit Gates:</span>
                  <span className="text-white">{circuit.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sim Result:</span>
                  <span className={simulationResult ? 'text-green-400' : 'text-gray-400'}>
                    {simulationResult ? 'Available' : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {simulator && (
              <div>
                <h4 className="text-white text-xs font-semibold mb-1">Simulator Info</h4>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Qubits:</span>
                    <span className="text-white">{simulator.getNumQubits?.() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Log Entries:</span>
                    <span className="text-white">{simulator.getExecutionLog?.()?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {simulationResult && (
              <div>
                <h4 className="text-white text-xs font-semibold mb-1">Latest Result</h4>
                <div className="text-xs">
                  <div className="bg-gray-900 p-2 rounded font-mono text-blue-400 max-h-20 overflow-auto">
                    {simulationResult.finalState?.toString?.() || 'No state data'}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-600">
              <button 
                onClick={() => {
                  console.log('[Debug] Current app state:', {
                    simulator,
                    simulationResult,
                    circuit,
                    timestamp: new Date().toISOString()
                  });
                }}
                className="w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
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