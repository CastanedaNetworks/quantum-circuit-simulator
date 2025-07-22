import React from 'react';

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Quantum-inspired loading animation */}
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          
          {/* Quantum dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          Quantum Circuit Simulator
        </h2>
        <p className="text-gray-400">{message}</p>
        
        {/* Debug info */}
        <div className="mt-4 text-xs text-gray-500">
          <p>Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export const ComponentLoadingFallback: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-300">Loading {name}...</span>
      </div>
    </div>
  );
};