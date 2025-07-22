import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isAutoPlay && currentStep < algorithm.steps.length) {
      const timer = setTimeout(() => {
        executeNextStep();
      }, autoPlaySpeed);
      return () => clearTimeout(timer);
    } else if (isAutoPlay && currentStep >= algorithm.steps.length) {
      setIsAutoPlay(false);
    }
  }, [isAutoPlay, currentStep, autoPlaySpeed, algorithm.steps.length]);

  const executeStep = (stepIndex: number) => {
    if (!simulator || stepIndex >= algorithm.steps.length) return;

    const step = algorithm.steps[stepIndex];
    
    // Reset simulator and execute all steps up to and including current step
    simulator.reset();
    
    for (let i = 0; i <= stepIndex; i++) {
      const currentStepGates = algorithm.steps[i].gates;
      currentStepGates.forEach(gate => {
        simulator.applyGate(gate.gate, gate.targetQubits);
      });
    }

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
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{algorithm.name}</h2>
          <p className="text-gray-400 text-sm">Step-by-Step Execution</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">
            Step {currentStep + 1} of {algorithm.steps.length}
          </span>
          <div className="w-32 bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Step Information */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            {currentStepData.title}
          </h3>
          <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm">
            Step {currentStep + 1}
          </span>
        </div>
        
        <p className="text-gray-300 mb-3">{currentStepData.description}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-white mb-2">Explanation</h4>
            <p className="text-gray-300 text-sm">{currentStepData.explanation}</p>
          </div>
          
          {currentStepData.mathematicalContext && (
            <div>
              <h4 className="font-semibold text-white mb-2">Mathematics</h4>
              <div className="bg-gray-900 p-3 rounded font-mono text-blue-400 text-sm">
                {currentStepData.mathematicalContext}
              </div>
            </div>
          )}
        </div>
        
        {currentStepData.expectedOutcome && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded">
            <h4 className="font-semibold text-green-400 mb-1">Expected Outcome</h4>
            <p className="text-green-300 text-sm">{currentStepData.expectedOutcome}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={resetExecution}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            disabled={currentStep === 0}
          >
            Reset
          </button>
          
          <button
            onClick={executePreviousStep}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            disabled={currentStep === 0}
          >
            ← Previous
          </button>
          
          <button
            onClick={executeNextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={currentStep === algorithm.steps.length - 1}
          >
            Next →
          </button>
          
          <button
            onClick={executeFullAlgorithm}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Execute All
          </button>
          
          <button
            onClick={toggleAutoPlay}
            className={`px-4 py-2 rounded transition-colors ${
              isAutoPlay 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isAutoPlay ? 'Stop Auto-Play' : 'Auto-Play'}
          </button>
        </div>

        {/* Auto-play speed control */}
        <div className="flex items-center space-x-3">
          <label className="text-gray-300 text-sm">Auto-play Speed:</label>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={autoPlaySpeed}
            onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
            className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-400 text-sm">{autoPlaySpeed}ms</span>
        </div>
      </div>

      {/* Step Results */}
      {execution?.results && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Current State</h3>
          
          {execution.results.stepResults[currentStep] && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800 rounded">
                <h4 className="font-semibold text-white mb-2">Quantum State</h4>
                <div className="bg-gray-900 p-2 rounded font-mono text-blue-400 text-sm">
                  {execution.results.stepResults[currentStep].finalState}
                </div>
              </div>
              
              <div className="p-3 bg-gray-800 rounded">
                <h4 className="font-semibold text-white mb-2">Measurement Probabilities</h4>
                <div className="space-y-1">
                  {Object.entries(execution.results.stepResults[currentStep].probabilities)
                    .filter(([_, prob]) => prob > 0.001)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([state, prob]) => (
                      <div key={state} className="flex justify-between text-sm">
                        <span className="text-gray-300 font-mono">|{state}⟩</span>
                        <span className="text-white">{(prob * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step Timeline */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Algorithm Timeline</h3>
        <div className="space-y-2">
          {algorithm.steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 rounded cursor-pointer transition-all duration-200 ${
                index === currentStep
                  ? 'bg-blue-900/50 border border-blue-500'
                  : index < currentStep
                  ? 'bg-green-900/20 border border-green-700'
                  : 'bg-gray-800 border border-gray-600'
              }`}
              onClick={() => executeStep(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === currentStep
                      ? 'bg-blue-500 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{step.title}</div>
                    <div className="text-gray-400 text-sm">{step.description}</div>
                  </div>
                </div>
                
                <div className="text-gray-400 text-xs">
                  {step.gates.length} gate{step.gates.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm Completion */}
      {currentStep === algorithm.steps.length - 1 && (
        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-green-400">Algorithm Complete!</h4>
              <p className="text-green-300 text-sm">
                You have successfully executed all steps of the {algorithm.name} algorithm.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};