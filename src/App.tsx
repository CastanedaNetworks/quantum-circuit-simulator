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
import { EnhancedBlochSphere } from './components/EnhancedBlochSphere';
import { AlgorithmTemplateSelector } from './components/AlgorithmTemplateSelector';
import { AlgorithmStepExecutor } from './components/AlgorithmStepExecutor';
import { DragPreview } from './components/DragPreview';
import { CircuitElement, QuantumGate } from './types/quantum';
import { QuantumAlgorithm, AlgorithmStep } from './types/algorithms';
import { QuantumSimulator } from './quantum/simulator';

function App() {
  console.log('[App] Component initializing...');
  
  const [numQubits] = useState(4);
  const [circuit, setCircuit] = useState<CircuitElement[]>([]);
  const [selectedGate, setSelectedGate] = useState<QuantumGate | null>(null);
  const [simulator, setSimulator] = useState<QuantumSimulator | null>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'circuit' | 'bloch' | 'algorithms'>('circuit');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<QuantumAlgorithm | null>(null);
  const [algorithmMode, setAlgorithmMode] = useState<'browse' | 'execute'>('browse');
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  console.log('[App] State initialized, numQubits:', numQubits);

  useEffect(() => {
    console.log('[App] Creating QuantumSimulator with', numQubits, 'qubits');
    
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setInitError(null);
        
        // Add a small delay to see loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newSimulator = new QuantumSimulator(numQubits);
        setSimulator(newSimulator);
        console.log('[App] QuantumSimulator created successfully');
        
        setIsLoading(false);
      } catch (error) {
        console.error('[App] Error creating QuantumSimulator:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, [numQubits]);

  const handleCircuitChange = (newCircuit: CircuitElement[]) => {
    console.log('[App] Circuit changed, new circuit:', newCircuit);
    setCircuit(newCircuit);
    // Auto-execute circuit as gates are placed
    runSimulation(newCircuit);
  };

  const runSimulation = (circuitToRun?: CircuitElement[]) => {
    const currentCircuit = circuitToRun || circuit;
    console.log('[App] Running simulation with circuit:', currentCircuit);
    
    if (simulator) {
      console.log('[App] Simulator available, executing circuit');
      simulator.reset();
      try {
        const result = simulator.executeCircuit(currentCircuit);
        console.log('[App] Simulation successful, result:', result);
        setSimulationResult(result);
      } catch (error) {
        console.error('[App] Simulation error:', error);
        setSimulationResult(null);
      }
    } else {
      console.warn('[App] No simulator available for circuit execution');
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

  console.log('[App] Rendering app, activeTab:', activeTab);
  console.log('[App] Current state - simulator:', !!simulator, 'simulationResult:', !!simulationResult, 'isLoading:', isLoading);

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingFallback message="Initializing quantum simulator..." />;
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Initialization Error</h2>
          <p className="text-gray-300 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  console.log('[App] Rendering with DndProvider, backend:', HTML5Backend);
  
  return (
    <ErrorBoundary componentName="App Root">
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-gray-950 text-white">
        <header className="bg-gray-900 shadow-xl">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Quantum Circuit Simulator
                </h1>
                <p className="text-gray-400 mt-2">Design and visualize quantum circuits with drag & drop</p>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('circuit')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeTab === 'circuit' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Circuit Builder
                </button>
                <button
                  onClick={() => setActiveTab('algorithms')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeTab === 'algorithms' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Algorithms
                </button>
                <button
                  onClick={() => setActiveTab('bloch')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeTab === 'bloch' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Bloch Sphere
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {activeTab === 'circuit' ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SimpleErrorBoundary name="VisualCircuitBuilder">
                    <VisualCircuitBuilder
                      numQubits={numQubits}
                      onCircuitChange={handleCircuitChange}
                      onRunCircuit={handleRunCircuit}
                    />
                  </SimpleErrorBoundary>
                  
                  <SimpleErrorBoundary name="SimulationResults">
                    <SimulationResults
                      result={simulationResult}
                      numQubits={numQubits}
                    />
                  </SimpleErrorBoundary>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SimpleErrorBoundary name="CircuitVisualization3D">
                    <CircuitVisualization3D
                      circuit={circuit}
                      numQubits={numQubits}
                    />
                  </SimpleErrorBoundary>
                  
                  {simulationResult && simulationResult.finalState && (
                    <SimpleErrorBoundary name="BlochSphereVisualization">
                      <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Quantum State Visualization</h3>
                        <div className="h-96">
                          <EnhancedBlochSphere
                            quantumState={simulationResult.finalState}
                          />
                        </div>
                      </div>
                    </SimpleErrorBoundary>
                  )}
                </div>
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
                    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
                      <h3 className="text-xl font-bold text-white mb-4">Getting Started</h3>
                      <div className="space-y-3 text-sm text-gray-300">
                        <p>• Browse quantum algorithm templates by category</p>
                        <p>• Click an algorithm to see detailed explanations</p>
                        <p>• Load individual steps or complete algorithms</p>
                        <p>• Execute step-by-step with explanations</p>
                      </div>
                      <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700 rounded">
                        <h4 className="font-semibold text-blue-400 mb-1">Available Algorithms</h4>
                        <ul className="text-blue-300 text-sm space-y-1">
                          <li>• Bell State Preparation</li>
                          <li>• Quantum Teleportation</li>
                          <li>• Grover's Search Algorithm</li>
                          <li>• Quantum Fourier Transform</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedAlgorithm ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setAlgorithmMode('browse')}
                      className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      ← Back to Algorithms
                    </button>
                    <div className="text-gray-400 text-sm">
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
        <DebugPanel 
          simulator={simulator}
          simulationResult={simulationResult}
          circuit={circuit}
        />
        </div>
      </DndProvider>
    </ErrorBoundary>
  );
}

export default App;