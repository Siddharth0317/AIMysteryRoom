import React, { useState } from 'react';
import TopNav from './TopNav';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AppShell({ children, activeCase, onResetCaseData }) {
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);

  return (
    <div className="relative min-h-screen bg-cyber-bg text-cyber-text flex flex-col font-sans selection:bg-cyber-cyan selection:text-cyber-bg">
      {/* Background Cyber Grid */}
      <div className="cyber-grid fixed inset-0 pointer-events-none opacity-40 z-0" />

      {/* Optional CRT Scanlines Shader */}
      {scanlinesEnabled && (
        <div className="cyber-scanlines fixed inset-0 pointer-events-none z-30 opacity-70" />
      )}

      {/* Top Header */}
      <TopNav
        activeCase={activeCase}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(prev => !prev)}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(prev => !prev)}
        onResetCaseData={onResetCaseData}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {children}
      </main>

      {/* Cyberpunk Terminal Footer */}
      <footer className="relative z-10 border-t border-cyber-border bg-cyber-subsurface/80 backdrop-blur-sm py-4 px-4 sm:px-6 lg:px-8 text-xs font-mono text-cyber-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyber-green shrink-0" />
            <span>SEC-POLICY: 100% SERVER-VERIFIED &amp; ZERO LEAKAGE</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">SYSTEM: NOMINAL // GEMINI-POWERED</span>
            
            {/* Scanline shader toggle */}
            <button
              type="button"
              onClick={() => setScanlinesEnabled(prev => !prev)}
              className="flex items-center space-x-1.5 text-cyber-muted hover:text-cyber-cyan transition-colors px-2 py-0.5 border border-cyber-border rounded"
              title="Toggle retro CRT scanlines"
            >
              {scanlinesEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="text-[10px]">SCANLINES: {scanlinesEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
