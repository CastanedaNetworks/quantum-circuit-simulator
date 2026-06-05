import React from 'react';
import { SimulationResult } from '../quantum/simulator';

interface SimulationResultsProps {
  result: SimulationResult | null;
  numQubits: number;
}

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white border border-slate-200 rounded-md shadow-sm">
    <div className="px-5 py-3 border-b border-slate-200">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Simulation Results
      </h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
    {children}
  </h3>
);

export const SimulationResults: React.FC<SimulationResultsProps> = ({ result, numQubits }) => {
  if (!result) {
    return (
      <Panel>
        <p className="text-sm text-slate-500">
          No simulation results yet. Add gates to see the quantum state evolution.
        </p>
      </Panel>
    );
  }

  const { finalState, executionLog } = result;
  const probabilities = finalState.getMeasurementProbabilities();
  const qubitProbabilities = [];

  for (let i = 0; i < numQubits; i++) {
    qubitProbabilities.push(finalState.getQubitMeasurementProbabilities(i));
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm max-h-[28rem] overflow-y-auto">
      <div className="px-5 py-3 border-b border-slate-200 sticky top-0 bg-white">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Simulation Results
        </h2>
      </div>
      <div className="p-5 space-y-5">
        {/* Current State */}
        <div>
          <SectionLabel>State Vector</SectionLabel>
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2">
            <code className="text-blue-800 text-sm font-mono break-all">
              {finalState.toString()}
            </code>
          </div>
        </div>

        {/* Measurement Probabilities */}
        <div>
          <SectionLabel>Measurement Probabilities</SectionLabel>
          <div className="space-y-1.5">
            {probabilities.map((prob, index) => {
              if (prob < 1e-10) return null;
              const basisState = finalState.basisStateToString(index);
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-slate-700 font-mono text-sm w-16">|{basisState}⟩</span>
                  <div className="flex-1 bg-slate-100 rounded-sm h-2 overflow-hidden">
                    <div
                      className="bg-blue-700 h-2 transition-all duration-300"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-500 text-xs font-mono w-14 text-right">
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Qubit Probabilities */}
        <div>
          <SectionLabel>Per-Qubit Probabilities</SectionLabel>
          <div className="grid grid-cols-1 gap-2">
            {qubitProbabilities.map((qProb, index) => (
              <div key={index} className="border border-slate-200 rounded px-3 py-2">
                <div className="text-slate-700 text-xs font-mono mb-1.5">q{index}</div>
                <div className="flex gap-4">
                  {(
                    [
                      { label: '|0⟩', value: qProb.prob0 },
                      { label: '|1⟩', value: qProb.prob1 },
                    ] as const
                  ).map(({ label, value }) => (
                    <div key={label} className="flex-1">
                      <div className="flex justify-between text-xs font-mono mb-0.5">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-600">{(value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-sm h-1">
                        <div
                          className="bg-slate-500 h-1 rounded-sm"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Log */}
        <div>
          <SectionLabel>Execution Log</SectionLabel>
          <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2 max-h-28 overflow-y-auto">
            {executionLog.map((entry, index) => (
              <div key={index} className="text-slate-600 text-xs font-mono mb-0.5">
                <span className="text-slate-400">{String(index + 1).padStart(2, '0')}</span>{' '}
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
