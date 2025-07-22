import React, { useState, useEffect } from 'react';
import { BlochSphere } from './BlochSphere';
import { BlochVector, BlochSphereUtils } from '../utils/blochSphere';
import { QuantumState } from '../quantum/state';

interface EnhancedBlochSphereProps {
  quantumState: QuantumState;
  onStateChange?: (newState: QuantumState) => void;
}

export const EnhancedBlochSphere: React.FC<EnhancedBlochSphereProps> = ({
  quantumState,
  onStateChange
}) => {
  const [currentVector, setCurrentVector] = useState<BlochVector>({ x: 0, y: 0, z: 1 });
  const [selectedAxis, setSelectedAxis] = useState<'X' | 'Y' | 'Z'>('Z');
  const [showMeasurementAxes, setShowMeasurementAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  useEffect(() => {
    if (quantumState.getNumQubits() === 1) {
      const vector = BlochSphereUtils.stateToBlochVector(quantumState);
      setCurrentVector(vector);
    }
  }, [quantumState]);

  const handlePresetState = (stateName: string) => {
    const commonStates = BlochSphereUtils.getCommonStates();
    const vector = commonStates[stateName];
    
    if (vector && onStateChange) {
      const newState = BlochSphereUtils.blochVectorToState(vector);
      onStateChange(newState);
    }
  };

  const handleCustomState = (theta: number, phi: number) => {
    if (onStateChange) {
      const vector = BlochSphereUtils.sphericalToBlochVector({
        theta: (theta * Math.PI) / 180,
        phi: (phi * Math.PI) / 180,
        r: 1
      });
      const newState = BlochSphereUtils.blochVectorToState(vector);
      onStateChange(newState);
    }
  };

  const getMeasurementProbability = (axis: 'X' | 'Y' | 'Z') => {
    const axisVectors = {
      X: { x: 1, y: 0, z: 0 },
      Y: { x: 0, y: 1, z: 0 },
      Z: { x: 0, y: 0, z: 1 }
    };
    
    return BlochSphereUtils.getMeasurementProbability(currentVector, axisVectors[axis]);
  };

  const sphericalCoords = BlochSphereUtils.blochVectorToSpherical(currentVector);

  return (
    <div className="space-y-6">
      {/* Main Bloch Sphere */}
      <BlochSphere
        quantumState={quantumState}
        showMeasurementAxes={showMeasurementAxes}
        showGrid={showGrid}
        animationDuration={animationSpeed}
      />

      {/* Controls Panel */}
      <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Bloch Sphere Controls</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preset States */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Preset States</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(BlochSphereUtils.getCommonStates()).map((stateName) => (
                <button
                  key={stateName}
                  onClick={() => handlePresetState(stateName)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-mono"
                >
                  {stateName}
                </button>
              ))}
            </div>
          </div>

          {/* Custom State Controls */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Custom State</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Theta (θ): {(sphericalCoords.theta * 180 / Math.PI).toFixed(1)}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={sphericalCoords.theta * 180 / Math.PI}
                  onChange={(e) => handleCustomState(
                    parseFloat(e.target.value),
                    sphericalCoords.phi * 180 / Math.PI
                  )}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Phi (φ): {(sphericalCoords.phi * 180 / Math.PI).toFixed(1)}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={sphericalCoords.phi * 180 / Math.PI}
                  onChange={(e) => handleCustomState(
                    sphericalCoords.theta * 180 / Math.PI,
                    parseFloat(e.target.value)
                  )}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Measurement Probabilities */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Measurement Probabilities</h4>
          <div className="grid grid-cols-3 gap-4">
            {(['X', 'Y', 'Z'] as const).map((axis) => {
              const { probUp, probDown } = getMeasurementProbability(axis);
              return (
                <div
                  key={axis}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedAxis === axis
                      ? 'bg-blue-900 border-blue-500'
                      : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedAxis(axis)}
                >
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      axis === 'X' ? 'text-red-400' :
                      axis === 'Y' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {axis}-Axis
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">+{axis}:</span>
                        <span className="text-white font-mono">
                          {(probUp * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">-{axis}:</span>
                        <span className="text-white font-mono">
                          {(probDown * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          axis === 'X' ? 'bg-red-500' :
                          axis === 'Y' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${probUp * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Display Options */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-3">Display Options</h4>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showMeasurementAxes}
                onChange={(e) => setShowMeasurementAxes(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
              />
              <span className="text-gray-300">Show Measurement Axes</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
              />
              <span className="text-gray-300">Show Coordinate Grid</span>
            </label>
          </div>
          
          <div className="mt-3">
            <label className="block text-gray-300 text-sm mb-1">
              Animation Speed: {animationSpeed}ms
            </label>
            <input
              type="range"
              min="100"
              max="3000"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* State Information */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-3">Current State Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-2">Cartesian Coordinates:</div>
              <div className="space-y-1 font-mono">
                <div>x = <span className="text-red-400">{currentVector.x.toFixed(4)}</span></div>
                <div>y = <span className="text-green-400">{currentVector.y.toFixed(4)}</span></div>
                <div>z = <span className="text-blue-400">{currentVector.z.toFixed(4)}</span></div>
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-2">Spherical Coordinates:</div>
              <div className="space-y-1 font-mono">
                <div>θ = <span className="text-yellow-400">{(sphericalCoords.theta * 180 / Math.PI).toFixed(2)}°</span></div>
                <div>φ = <span className="text-purple-400">{(sphericalCoords.phi * 180 / Math.PI).toFixed(2)}°</span></div>
                <div>r = <span className="text-cyan-400">{sphericalCoords.r.toFixed(4)}</span></div>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="text-gray-400 mb-2">Quantum State:</div>
            <div className="text-white font-mono text-sm bg-gray-900 p-2 rounded">
              {quantumState.toString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};