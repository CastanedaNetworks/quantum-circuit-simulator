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
      case 'beginner': return 'bg-green-50 text-green-700 border border-green-200';
      case 'intermediate': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'advanced': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
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
    <div className="bg-white border border-slate-200 rounded-md shadow-sm">
      <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Quantum Algorithm Templates
        </h2>
        <div className="text-xs font-mono text-slate-500">
          {filteredAlgorithms.length} algorithm{filteredAlgorithms.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="p-5">
      {/* Filters */}
      <div className="mb-5 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded text-sm text-slate-700 px-2 py-1"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-white border border-slate-300 rounded text-sm text-slate-700 px-2 py-1"
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
      <div className="space-y-2">
        {filteredAlgorithms.map((algorithm) => (
          <div
            key={algorithm.id}
            className={`border rounded transition-colors ${
              selectedAlgorithm?.id === algorithm.id
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {/* Algorithm Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => handleAlgorithmSelect(algorithm)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-9 h-9 text-lg bg-slate-100 border border-slate-200 text-slate-600 rounded">{getCategoryIcon(algorithm.category)}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {algorithm.name}
                    </h3>
                    <p className="text-sm text-slate-500">{algorithm.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wide ${getDifficultyColor(algorithm.difficulty)}`}>
                    {algorithm.difficulty}
                  </span>
                  <span className="font-mono text-slate-500 text-xs">
                    {algorithm.qubitsRequired} qubit{algorithm.qubitsRequired !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Algorithm Details */}
            {selectedAlgorithm?.id === algorithm.id && (
              <div className="border-t border-slate-200">
                {/* Algorithm Info Tabs */}
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Overview */}
                    <div>
                      <button
                        onClick={() => toggleSection(`${algorithm.id}-overview`)}
                        className="flex items-center justify-between w-full text-left p-2 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-900">Overview & Applications</span>
                        <span className="font-mono text-slate-400">
                          {expandedSections.has(`${algorithm.id}-overview`) ? '−' : '+'}
                        </span>
                      </button>

                      {expandedSections.has(`${algorithm.id}-overview`) && (
                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Learning Objectives</h4>
                              <ul className="text-slate-700 space-y-1">
                                {algorithm.learningObjectives.map((objective, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    {objective}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Applications</h4>
                              <ul className="text-slate-700 space-y-1">
                                {algorithm.applications.map((application, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    {application}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500">Time Complexity:</span>
                                <span className="text-slate-900 ml-2 font-mono">{algorithm.complexity.time}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Space Complexity:</span>
                                <span className="text-slate-900 ml-2 font-mono">{algorithm.complexity.space}</span>
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
                        className="flex items-center justify-between w-full text-left p-2 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-900">Prerequisites</span>
                        <span className="font-mono text-slate-400">
                          {expandedSections.has(`${algorithm.id}-prerequisites`) ? '−' : '+'}
                        </span>
                      </button>

                      {expandedSections.has(`${algorithm.id}-prerequisites`) && (
                        <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded">
                          <ul className="text-slate-700 text-sm space-y-1">
                            {algorithm.prerequisites.map((prereq, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-amber-600 mr-2">⚠</span>
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
                        className="flex items-center justify-between w-full text-left p-2 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-900">
                          Step-by-Step Implementation ({algorithm.steps.length} steps)
                        </span>
                        <span className="font-mono text-slate-400">
                          {expandedSections.has(`${algorithm.id}-steps`) ? '−' : '+'}
                        </span>
                      </button>

                      {expandedSections.has(`${algorithm.id}-steps`) && (
                        <div className="mt-2 space-y-3">
                          {algorithm.steps.map((step, stepIdx) => (
                            <div
                              key={step.id}
                              className="p-3 bg-slate-50 rounded border border-slate-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-slate-900">
                                  Step {stepIdx + 1}: {step.title}
                                </h4>
                                <button
                                  onClick={() => onStepSelect(algorithm, step)}
                                  className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded border border-blue-700 hover:bg-blue-800 transition-colors"
                                >
                                  Load Step
                                </button>
                              </div>

                              <p className="text-slate-600 text-sm mb-3">{step.description}</p>

                              <div className="text-xs text-slate-500 space-y-2">
                                <div>
                                  <strong className="text-slate-700">Explanation:</strong> {step.explanation}
                                </div>

                                {step.mathematicalContext && (
                                  <div>
                                    <strong className="text-slate-700">Mathematics:</strong>
                                    <code className="ml-2 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-blue-800">
                                      {step.mathematicalContext}
                                    </code>
                                  </div>
                                )}

                                {step.expectedOutcome && (
                                  <div>
                                    <strong className="text-slate-700">Expected Outcome:</strong> {step.expectedOutcome}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Load Full Algorithm */}
                    <div className="pt-4 border-t border-slate-200">
                      <button
                        onClick={() => onAlgorithmSelect(algorithm)}
                        className="w-full px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded border border-blue-700 hover:bg-blue-800 transition-colors"
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
        <div className="text-center py-8">
          <p className="text-sm text-slate-500 mb-4">No algorithms match the selected filters.</p>
          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterDifficulty('all');
            }}
            className="px-3 py-1.5 bg-blue-700 text-white text-sm font-medium rounded border border-blue-700 hover:bg-blue-800 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
      </div>
    </div>
  );
};