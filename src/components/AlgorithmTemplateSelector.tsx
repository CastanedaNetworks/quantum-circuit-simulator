import React, { useState } from 'react';
import { QuantumAlgorithm, AlgorithmStep } from '../types/algorithms';
import { quantumAlgorithmTemplates } from '../algorithms/templates';

interface AlgorithmTemplateSelectorProps {
  onAlgorithmSelect: (algorithm: QuantumAlgorithm) => void;
  onStepSelect: (algorithm: QuantumAlgorithm, step: AlgorithmStep) => void;
}

export const AlgorithmTemplateSelector: React.FC<AlgorithmTemplateSelectorProps> = ({
  onAlgorithmSelect,
  onStepSelect
}) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<QuantumAlgorithm | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const categories = ['all', 'entanglement', 'communication', 'search', 'transform', 'arithmetic'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredAlgorithms = quantumAlgorithmTemplates.filter(algorithm => {
    const categoryMatch = filterCategory === 'all' || algorithm.category === filterCategory;
    const difficultyMatch = filterDifficulty === 'all' || algorithm.difficulty === filterDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAlgorithmSelect = (algorithm: QuantumAlgorithm) => {
    setSelectedAlgorithm(algorithm);
    onAlgorithmSelect(algorithm);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-900/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/20';
      case 'advanced': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entanglement': return '🔗';
      case 'communication': return '📡';
      case 'search': return '🔍';
      case 'transform': return '🔄';
      case 'arithmetic': return '🧮';
      default: return '⚛️';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quantum Algorithm Templates</h2>
        <div className="text-sm text-gray-400">
          {filteredAlgorithms.length} algorithm{filteredAlgorithms.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-600"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-1">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-600"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Algorithm List */}
      <div className="space-y-4">
        {filteredAlgorithms.map((algorithm) => (
          <div
            key={algorithm.id}
            className={`border rounded-lg transition-all duration-200 ${
              selectedAlgorithm?.id === algorithm.id
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-600 bg-gray-800'
            }`}
          >
            {/* Algorithm Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
              onClick={() => handleAlgorithmSelect(algorithm)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(algorithm.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {algorithm.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{algorithm.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(algorithm.difficulty)}`}>
                    {algorithm.difficulty}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {algorithm.qubitsRequired} qubit{algorithm.qubitsRequired !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Algorithm Details */}
            {selectedAlgorithm?.id === algorithm.id && (
              <div className="border-t border-gray-600">
                {/* Algorithm Info Tabs */}
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Overview */}
                    <div>
                      <button
                        onClick={() => toggleSection(`${algorithm.id}-overview`)}
                        className="flex items-center justify-between w-full text-left p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium text-white">Overview & Applications</span>
                        <span className="text-gray-400">
                          {expandedSections.has(`${algorithm.id}-overview`) ? '−' : '+'}
                        </span>
                      </button>
                      
                      {expandedSections.has(`${algorithm.id}-overview`) && (
                        <div className="mt-2 p-3 bg-gray-800/50 rounded">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-white mb-2">Learning Objectives</h4>
                              <ul className="text-gray-300 space-y-1">
                                {algorithm.learningObjectives.map((objective, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-blue-400 mr-2">•</span>
                                    {objective}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-white mb-2">Applications</h4>
                              <ul className="text-gray-300 space-y-1">
                                {algorithm.applications.map((application, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-400 mr-2">•</span>
                                    {application}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-700">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Time Complexity:</span>
                                <span className="text-white ml-2 font-mono">{algorithm.complexity.time}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Space Complexity:</span>
                                <span className="text-white ml-2 font-mono">{algorithm.complexity.space}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prerequisites */}
                    <div>
                      <button
                        onClick={() => toggleSection(`${algorithm.id}-prerequisites`)}
                        className="flex items-center justify-between w-full text-left p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium text-white">Prerequisites</span>
                        <span className="text-gray-400">
                          {expandedSections.has(`${algorithm.id}-prerequisites`) ? '−' : '+'}
                        </span>
                      </button>
                      
                      {expandedSections.has(`${algorithm.id}-prerequisites`) && (
                        <div className="mt-2 p-3 bg-gray-800/50 rounded">
                          <ul className="text-gray-300 text-sm space-y-1">
                            {algorithm.prerequisites.map((prereq, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-yellow-400 mr-2">⚠</span>
                                {prereq}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Breakdown */}
                    <div>
                      <button
                        onClick={() => toggleSection(`${algorithm.id}-steps`)}
                        className="flex items-center justify-between w-full text-left p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium text-white">
                          Step-by-Step Implementation ({algorithm.steps.length} steps)
                        </span>
                        <span className="text-gray-400">
                          {expandedSections.has(`${algorithm.id}-steps`) ? '−' : '+'}
                        </span>
                      </button>
                      
                      {expandedSections.has(`${algorithm.id}-steps`) && (
                        <div className="mt-2 space-y-3">
                          {algorithm.steps.map((step, stepIdx) => (
                            <div
                              key={step.id}
                              className="p-3 bg-gray-800/50 rounded border border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">
                                  Step {stepIdx + 1}: {step.title}
                                </h4>
                                <button
                                  onClick={() => onStepSelect(algorithm, step)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                >
                                  Load Step
                                </button>
                              </div>
                              
                              <p className="text-gray-300 text-sm mb-3">{step.description}</p>
                              
                              <div className="text-xs text-gray-400 space-y-2">
                                <div>
                                  <strong>Explanation:</strong> {step.explanation}
                                </div>
                                
                                {step.mathematicalContext && (
                                  <div>
                                    <strong>Mathematics:</strong>
                                    <code className="ml-2 px-2 py-1 bg-gray-900 rounded font-mono text-blue-400">
                                      {step.mathematicalContext}
                                    </code>
                                  </div>
                                )}
                                
                                {step.expectedOutcome && (
                                  <div>
                                    <strong>Expected Outcome:</strong> {step.expectedOutcome}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Load Full Algorithm */}
                    <div className="pt-4 border-t border-gray-700">
                      <button
                        onClick={() => onAlgorithmSelect(algorithm)}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Load Complete Algorithm ({algorithm.fullCircuit.length} gates)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAlgorithms.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No algorithms match the selected filters.</p>
          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterDifficulty('all');
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};