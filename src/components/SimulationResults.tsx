import React from 'react';
import { SimulationResult } from '../quantum/simulator';

interface SimulationResultsProps {
  result: SimulationResult | null;
  numQubits: number;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({ result, numQubits }) => {
  if (!result) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Simulation Results</h2>
        <p className="text-gray-400">No simulation results yet. Add gates to see the quantum state evolution.</p>
      </div>
    );
  }

  const { finalState, executionLog } = result;
  const probabilities = finalState.getMeasurementProbabilities();
  const qubitProbabilities = [];
  
  for (let i = 0; i < numQubits; i++) {
    qubitProbabilities.push(finalState.getQubitMeasurementProbabilities(i));
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl space-y-4 max-h-96 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Simulation Results</h2>
      
      {/* Current State */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Current State</h3>
        <div className="bg-gray-800 rounded p-3">
          <code className="text-blue-400 text-sm font-mono">
            {finalState.toString()}
          </code>
        </div>
      </div>

      {/* Measurement Probabilities */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Measurement Probabilities</h3>
        <div className="space-y-2">
          {probabilities.map((prob, index) => {
            if (prob < 1e-10) return null;
            const basisState = finalState.basisStateToString(index);
            return (
              <div key={index} className="flex justify-between items-center bg-gray-800 rounded p-2">
                <span className="text-white font-mono">|{basisState}⟩</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-300 text-sm w-16 text-right">
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Qubit Probabilities */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Individual Qubit Probabilities</h3>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
          {qubitProbabilities.map((qProb, index) => (
            <div key={index} className="bg-gray-800 rounded p-3">
              <div className="text-white mb-1">Qubit {index}</div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">|0⟩</span>
                    <span className="text-gray-300">{(qProb.prob0 * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${qProb.prob0 * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">|1⟩</span>
                    <span className="text-gray-300">{(qProb.prob1 * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full"
                      style={{ width: `${qProb.prob1 * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Log */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Execution Log</h3>
        <div className="bg-gray-800 rounded p-3 max-h-24 overflow-y-auto">
          {executionLog.map((entry, index) => (
            <div key={index} className="text-gray-300 text-sm mb-1">
              {index + 1}. {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};