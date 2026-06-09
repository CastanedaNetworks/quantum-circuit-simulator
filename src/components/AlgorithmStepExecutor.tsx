import React, { useState, useEffect, useRef } from 'react';
import { QuantumAlgorithm, AlgorithmExecution } from '../types/algorithms';
import { QuantumSimulator } from '../quantum/simulator';
import { CircuitElement } from '../types/quantum';

interface AlgorithmStepExecutorProps {
  algorithm: QuantumAlgorithm;
  onStepChange: (step: number) => void;
  onCircuitUpdate: (circuit: CircuitElement[]) => void;
}

export const AlgorithmStepExecutor: React.FC<AlgorithmStepExecutorProps> = ({
  algorithm,
  onStepChange,
  onCircuitUpdate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [simulator, setSimulator] = useState<QuantumSimulator | null>(null);
  const [execution, setExecution] = useState<AlgorithmExecution | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(2000);

  useEffect(() => {
    const sim = new QuantumSimulator(algorithm.qubitsRequired);
    setSimulator(sim);
    setExecution({
      algorithmId: algorithm.id,
      currentStep: 0,
      isExecuting: false,
      results: {
        stepResults: [],
        finalResult: {
          success: false,
          output: null
        }
      }
    });
  }, [algorithm]);

  // Keep the latest executeNextStep in a ref so the auto-play timer effect
  // doesn't need the (re-created every render) callback in its deps.
  const executeNextStepRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isAutoPlay && currentStep < algorithm.steps.length) {
      const timer = setTimeout(() => {
        executeNextStepRef.current();
      }, autoPlaySpeed);
      return () => clearTimeout(timer);
    } else if (isAutoPlay && currentStep >= algorithm.steps.length) {
      setIsAutoPlay(false);
    }
  }, [isAutoPlay, currentStep, autoPlaySpeed, algorithm.steps.length]);

  const executeStep = (stepIndex: number) => {
    if (!simulator || stepIndex >= algorithm.steps.length) return;

    const step = algorithm.steps[stepIndex];

    // Each step's gates array is the full (cumulative) circuit up to that
    // step, so reset and apply exactly that list — applying earlier steps too
    // would run their gates twice.
    simulator.reset();

    step.gates.forEach(gate => {
      simulator.applyGate(gate.gate, gate.targetQubits);
    });

    const currentState = simulator.getCurrentState();
    const probabilities = currentState.getMeasurementProbabilities();
    
    // Update execution results
    if (execution) {
      const newStepResult = {
        stepId: step.id,
        finalState: currentState.toString(),
        probabilities: probabilities.reduce((acc, prob, idx) => {
          acc[currentState.basisStateToString(idx)] = prob;
          return acc;
        }, {} as Record<string, number>)
      };

      const updatedExecution = {
        ...execution,
        currentStep: stepIndex,
        results: {
          ...execution.results!,
          stepResults: [
            ...execution.results!.stepResults.slice(0, stepIndex),
            newStepResult
          ]
        }
      };
      
      setExecution(updatedExecution);
    }

    setCurrentStep(stepIndex);
    onStepChange(stepIndex);
    onCircuitUpdate(step.gates);
  };

  const executeNextStep = () => {
    if (currentStep < algorithm.steps.length - 1) {
      executeStep(currentStep + 1);
    }
  };
  executeNextStepRef.current = executeNextStep;

  const executePreviousStep = () => {
    if (currentStep > 0) {
      executeStep(currentStep - 1);
    }
  };

  const resetExecution = () => {
    executeStep(0);
    setIsAutoPlay(false);
  };

  const executeFullAlgorithm = () => {
    executeStep(algorithm.steps.length - 1);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const currentStepData = algorithm.steps[currentStep];
  const progress = ((currentStep + 1) / algorithm.steps.length) * 100;

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm">
      <div className="flex justify-between items-center gap-4 px-5 py-3 border-b border-slate-200 flex-wrap">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {algorithm.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Step-by-Step Execution</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm font-mono">
            Step {currentStep + 1} of {algorithm.steps.length}
          </span>
          <div className="w-32 bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">

      {/* Current Step Information */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            {currentStepData.title}
          </h3>
          <span className="px-2 py-1 bg-blue-700 text-white rounded text-xs font-medium">
            Step {currentStep + 1}
          </span>
        </div>

        <p className="text-slate-600 text-sm mb-3">{currentStepData.description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Explanation</h4>
            <p className="text-slate-600 text-sm">{currentStepData.explanation}</p>
          </div>

          {currentStepData.mathematicalContext && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Mathematics</h4>
              <div className="bg-white border border-slate-200 rounded px-3 py-2 font-mono text-blue-800 text-sm">
                {currentStepData.mathematicalContext}
              </div>
            </div>
          )}
        </div>

        {currentStepData.expectedOutcome && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 mb-1">Expected Outcome</h4>
            <p className="text-slate-700 text-sm">{currentStepData.expectedOutcome}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={resetExecution}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
            disabled={currentStep === 0}
          >
            Reset
          </button>

          <button
            onClick={executePreviousStep}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
            disabled={currentStep === 0}
          >
            ← Previous
          </button>

          <button
            onClick={executeNextStep}
            className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded border border-blue-700 hover:bg-blue-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
            disabled={currentStep === algorithm.steps.length - 1}
          >
            Next →
          </button>

          <button
            onClick={executeFullAlgorithm}
            className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded border border-blue-700 hover:bg-blue-800 transition-colors"
          >
            Execute All
          </button>

          <button
            onClick={toggleAutoPlay}
            className={`px-3 py-1.5 text-sm font-medium rounded border transition-colors ${
              isAutoPlay
                ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isAutoPlay ? 'Stop Auto-Play' : 'Auto-Play'}
          </button>
        </div>

        {/* Auto-play speed control */}
        <div className="flex items-center gap-3">
          <label className="text-slate-600 text-sm">Auto-play Speed:</label>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={autoPlaySpeed}
            onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
            className="w-32 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-slate-500 text-sm font-mono">{autoPlaySpeed}ms</span>
        </div>
      </div>

      {/* Step Results */}
      {execution?.results && (
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Current State</h3>

          {execution.results.stepResults[currentStep] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Quantum State</h4>
                <div className="bg-white border border-slate-200 rounded px-3 py-2 font-mono text-blue-800 text-sm break-all">
                  {execution.results.stepResults[currentStep].finalState}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Measurement Probabilities</h4>
                <div className="space-y-1">
                  {Object.entries(execution.results.stepResults[currentStep].probabilities)
                    .filter(([_, prob]) => prob > 0.001)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([state, prob]) => (
                      <div key={state} className="flex justify-between text-sm">
                        <span className="text-slate-700 font-mono">|{state}⟩</span>
                        <span className="text-slate-900 font-mono">{(prob * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step Timeline */}
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Algorithm Timeline</h3>
        <div className="space-y-2">
          {algorithm.steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 rounded cursor-pointer border transition-all duration-200 ${
                index === currentStep
                  ? 'bg-blue-700 border-blue-700'
                  : index < currentStep
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => executeStep(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                    index === currentStep
                      ? 'bg-white text-blue-700 border-white'
                      : index < currentStep
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-400 border-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${index === currentStep ? 'text-white' : 'text-slate-900'}`}>{step.title}</div>
                    <div className={`text-sm ${index === currentStep ? 'text-blue-100' : 'text-slate-500'}`}>{step.description}</div>
                  </div>
                </div>

                <div className={`text-xs font-mono ${index === currentStep ? 'text-blue-100' : 'text-slate-400'}`}>
                  {step.gates.length} gate{step.gates.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm Completion */}
      {currentStep === algorithm.steps.length - 1 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Algorithm Complete!</h4>
              <p className="text-slate-700 text-sm">
                You have successfully executed all steps of the {algorithm.name} algorithm.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};