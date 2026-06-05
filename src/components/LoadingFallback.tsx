import React from 'react';

interface LoadingFallbackProps {
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading…',
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-700 rounded-full animate-spin mx-auto mb-5" />
        <h1 className="text-base font-semibold text-slate-900 tracking-tight">
          Quantum Circuit Simulator
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-mono">{message}</p>
      </div>
    </div>
  );
};

export const ComponentLoadingFallback: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="bg-white rounded-md p-6 border border-slate-200">
      <div className="flex items-center space-x-3">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-700 rounded-full animate-spin" />
        <span className="text-sm text-slate-500 font-mono">Loading {name}…</span>
      </div>
    </div>
  );
};
