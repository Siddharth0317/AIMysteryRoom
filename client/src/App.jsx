import React from 'react';

export default function App() {
  return (
    <div className="relative min-h-screen bg-cyber-bg cyber-grid flex flex-col items-center justify-center p-6 text-cyber-text">
      <div className="cyber-scanlines absolute inset-0"></div>
      
      <div className="relative z-10 max-w-xl w-full bg-cyber-surface border border-cyber-border rounded-lg p-8 shadow-terminal backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-cyber-cyan animate-pulse"></span>
            <h1 className="font-display text-xl font-bold tracking-wider text-cyber-cyan">
              AI MYSTERY ROOM // TERMINAL
            </h1>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyber-subsurface border border-cyber-border text-cyber-green">
            PHASE 0: READY
          </span>
        </div>

        <div className="font-mono text-sm space-y-3 text-cyber-muted">
          <p className="text-cyber-text">
            &gt; Core runtime initialized. Architecture verified.
          </p>
          <p>
            &gt; Technology Stack: React + Vite + Tailwind CSS + Node/Express + Gemini API.
          </p>
          <p className="text-cyber-cyan">
            &gt; Awaiting Phase 1 UI Skeleton deployment...
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-cyber-border/60 flex items-center justify-between text-xs font-mono text-cyber-muted">
          <span>SEC-POLICY: ZERO-LEAKAGE</span>
          <span className="text-cyber-green">SYS: NOMINAL</span>
        </div>
      </div>
    </div>
  );
}
