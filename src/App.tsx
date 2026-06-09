import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ErrorBoundary, SimpleErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { DebugPanel } from './components/DebugPanel';
import { VisualCircuitBuilder } from './components/VisualCircuitBuilder';
import { EnhancedGatePalette } from './components/EnhancedGatePalette';
import { CircuitVisualization3D } from './components/CircuitVisualization3D';
import { SimulationResults } from './components/SimulationResults';
import { SingleQubitSimulator } from './components/SingleQubitSimulator';
import { BlochSphere } from './components/BlochSphere';
import { AlgorithmTemplateSelector } from './components/AlgorithmTemplateSelector';
import { AlgorithmStepExecutor } from './components/AlgorithmStepExecutor';
import { DragPreview } from './components/DragPreview';
import { CircuitElement, QuantumGate } from './types/quantum';
import { QuantumAlgorithm, AlgorithmStep } from './types/algorithms';
import { QuantumSimulator } from './quantum/simulator';

function App() {
  const [numQubits] = useState(4);
  const [circuit, setCircuit] = useState<CircuitElement[]>([]);
  const [selectedGate, setSelectedGate] = useState<QuantumGate | null>(null);
  const [simulator, setSimulator] = useState<QuantumSimulator | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'circuit' | 'bloch' | 'algorithms'>('circuit');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<QuantumAlgorithm | null>(null);
  const [algorithmMode, setAlgorithmMode] = useState<'browse' | 'execute'>('browse');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setInitError(null);

        const newSimulator = new QuantumSimulator(numQubits);
        setSimulator(newSimulator);

        setIsLoading(false);
      } catch (error) {
        console.error('Error creating QuantumSimulator:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [numQubits]);

  const handleCircuitChange = (newCircuit: CircuitElement[]) => {
    setCircuit(newCircuit);
    // Auto-execute circuit as gates are placed
    runSimulation(newCircuit);
  };

  const runSimulation = (circuitToRun?: CircuitElement[]) => {
    const currentCircuit = circuitToRun || circuit;

    if (simulator) {
      simulator.reset();
      try {
        const result = simulator.executeCircuit(currentCircuit);
        setSimulationResult(result);
        setSimulationError(null);
      } catch (error) {
        console.error('Simulation error:', error);
        setSimulationResult(null);
        setSimulationError(error instanceof Error ? error.message : 'Simulation failed');
      }
    }
  };

  const handleRunCircuit = () => {
    runSimulation();
  };

  const handleGateSelect = (gate: QuantumGate) => {
    setSelectedGate(gate);
  };

  const handleAlgorithmSelect = (algorithm: QuantumAlgorithm) => {
    setSelectedAlgorithm(algorithm);
    setAlgorithmMode('execute');
    setCircuit(algorithm.fullCircuit);
  };

  const handleStepSelect = (algorithm: QuantumAlgorithm, step: AlgorithmStep) => {
    setSelectedAlgorithm(algorithm);
    setAlgorithmMode('execute');
    setCircuit(step.gates);
  };

  const handleAlgorithmStepChange = () => {
    // Handle step change if needed
  };

  const handleAlgorithmCircuitUpdate = (newCircuit: CircuitElement[]) => {
    setCircuit(newCircuit);
    handleCircuitChange(newCircuit);
  };

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingFallback message="Initializing quantum simulator..." />;
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md bg-white border border-slate-200 rounded-md shadow-sm p-8">
          <div className="w-10 h-10 border border-red-300 bg-red-50 text-red-700 rounded flex items-center justify-center mx-auto mb-4 font-mono text-lg">
            !
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">Initialization Error</h2>
          <p className="text-sm text-slate-500 font-mono mb-5">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary componentName="App Root">
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end pt-5">
              <div className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded border border-slate-800 flex items-center justify-center font-mono text-sm font-semibold text-slate-900">
                    Q
                  </div>
                  <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                    Quantum Circuit Simulator
                  </h1>
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    {numQubits}-qubit
                  </span>
                </div>
              </div>

              {/* Tab Navigation — underline style */}
              <nav className="flex gap-6">
                {([
                  ['circuit', 'Circuit Builder'],
                  ['algorithms', 'Algorithms'],
                  ['bloch', 'Bloch Sphere'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`pb-3 -mb-px text-sm font-medium border-b-2 transition-colors ${
                      activeTab === id
                        ? 'text-blue-700 border-blue-700'
                        : 'text-slate-500 border-transparent hover:text-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {activeTab === 'circuit' ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                {/* Circuit builder gets the full width so the grid has room */}
                <SimpleErrorBoundary name="VisualCircuitBuilder">
                  <VisualCircuitBuilder
                    numQubits={numQubits}
                    onCircuitChange={handleCircuitChange}
                    onRunCircuit={handleRunCircuit}
                  />
                </SimpleErrorBoundary>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SimpleErrorBoundary name="SimulationResults">
                    <SimulationResults
                      result={simulationResult}
                      numQubits={numQubits}
                      error={simulationError}
                    />
                  </SimpleErrorBoundary>

                  <SimpleErrorBoundary name="CircuitVisualization3D">
                    <CircuitVisualization3D
                      circuit={circuit}
                      numQubits={numQubits}
                    />
                  </SimpleErrorBoundary>
                </div>

                {simulationResult && simulationResult.finalState && (
                  <SimpleErrorBoundary name="BlochSphereVisualization">
                    <BlochSphere quantumState={simulationResult.finalState} />
                  </SimpleErrorBoundary>
                )}
              </div>
              
              <div className="xl:col-span-1">
                <SimpleErrorBoundary name="EnhancedGatePalette">
                  <EnhancedGatePalette
                    onGateSelect={handleGateSelect}
                    selectedGate={selectedGate}
                  />
                </SimpleErrorBoundary>
              </div>
            </div>
          ) : activeTab === 'algorithms' ? (
            <div className="max-w-7xl mx-auto">
              {algorithmMode === 'browse' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <AlgorithmTemplateSelector
                      onAlgorithmSelect={handleAlgorithmSelect}
                      onStepSelect={handleStepSelect}
                    />
                  </div>
                  <div className="xl:col-span-1">
                    <div className="bg-white border border-slate-200 rounded-md shadow-sm">
                      <div className="px-5 py-3 border-b border-slate-200">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Getting Started
                        </h3>
                      </div>
                      <div className="p-5">
                        <ul className="space-y-2 text-sm text-slate-600">
                          <li>Browse quantum algorithm templates by category</li>
                          <li>Click an algorithm to see detailed explanations</li>
                          <li>Load individual steps or complete algorithms</li>
                          <li>Execute step-by-step with explanations</li>
                        </ul>
                        <div className="mt-5 pt-4 border-t border-slate-200">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Available Algorithms
                          </h4>
                          <ul className="text-sm text-slate-700 space-y-1 font-mono">
                            <li>Bell State Preparation</li>
                            <li>Quantum Teleportation</li>
                            <li>Grover's Search Algorithm</li>
                            <li>Quantum Fourier Transform</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedAlgorithm ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setAlgorithmMode('browse')}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
                    >
                      ← Back to Algorithms
                    </button>
                    <div className="text-slate-500 text-sm font-mono">
                      {selectedAlgorithm.qubitsRequired} qubits required
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AlgorithmStepExecutor
                      algorithm={selectedAlgorithm}
                      onStepChange={handleAlgorithmStepChange}
                      onCircuitUpdate={handleAlgorithmCircuitUpdate}
                    />
                    <div className="space-y-6">
                      <SimulationResults
                        result={simulationResult}
                        numQubits={selectedAlgorithm.qubitsRequired}
                        error={simulationError}
                      />
                      <CircuitVisualization3D
                        circuit={circuit}
                        numQubits={selectedAlgorithm.qubitsRequired}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <SingleQubitSimulator />
            </div>
          )}
        </main>
        
        <DragPreview />
        
        {/* Debug Panel - only in development */}
        {import.meta.env.DEV && (
          <DebugPanel
            simulator={simulator}
            simulationResult={simulationResult}
            circuit={circuit}
          />
        )}
        </div>
      </DndProvider>
    </ErrorBoundary>
  );
}

export default App;