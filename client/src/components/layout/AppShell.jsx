import React, { useState, useEffect } from 'react';
import TopNav from './TopNav';
import { ShieldCheck, Eye, EyeOff, Zap, ZapOff } from 'lucide-react';

export default function AppShell({ children, activeCase, onResetCaseData }) {
  const [scanlinesEnabled, setScanlinesEnabled] = useState(() => {
    const saved = localStorage.getItem('aimystery_scanlines');
    return saved !== null ? saved === 'true' : true;
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem('aimystery_reduced_motion');
    if (saved !== null) return saved === 'true';
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('aimystery_audio') === 'true';
  });

  const handleToggleScanlines = () => {
    setScanlinesEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('aimystery_scanlines', String(next));
      return next;
    });
  };

  const handleToggleReducedMotion = () => {
    setReducedMotion((prev) => {
      const next = !prev;
      localStorage.setItem('aimystery_reduced_motion', String(next));
      return next;
    });
  };

  const handleToggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('aimystery_audio', String(next));
      return next;
    });
  };

  return (
    <div className={`relative min-h-screen bg-cyber-bg text-cyber-text flex flex-col font-sans selection:bg-cyber-cyan selection:text-cyber-bg ${reducedMotion ? 'reduced-motion' : ''}`}>
      {/* Background Cyber Grid */}
      <div className="cyber-grid fixed inset-0 pointer-events-none opacity-40 z-0" />

      {/* Optional CRT Scanlines Shader */}
      {scanlinesEnabled && !reducedMotion && (
        <div className="cyber-scanlines fixed inset-0 pointer-events-none z-30 opacity-70" />
      )}

      {/* Top Header */}
      <TopNav
        activeCase={activeCase}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={handleToggleScanlines}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        onResetCaseData={onResetCaseData}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 relative max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        {children}
      </main>

      {/* Cyberpunk Terminal Footer */}
      <footer className="relative z-10 border-t border-cyber-border bg-cyber-subsurface/80 backdrop-blur-sm py-4 px-4 sm:px-6 lg:px-8 text-xs font-mono text-cyber-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyber-green shrink-0" />
            <span>SEC-POLICY: 100% SERVER-VERIFIED &amp; ZERO LEAKAGE</span>
          </div>

          <div className="flex items-center flex-wrap gap-2 sm:gap-4 justify-center sm:justify-end">
            <span className="hidden lg:inline text-[11px]">SYSTEM: NOMINAL // GEMINI-POWERED</span>
            
            {/* Reduced motion toggle */}
            <button
              type="button"
              onClick={handleToggleReducedMotion}
              className={`flex items-center space-x-1.5 transition-colors px-2 py-0.5 border rounded text-[10px] ${
                reducedMotion
                  ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 font-bold'
                  : 'border-cyber-border text-cyber-muted hover:text-cyber-cyan'
              }`}
              title="Toggle reduced motion (disables pulse/glitch effects)"
              aria-pressed={reducedMotion}
            >
              {reducedMotion ? <ZapOff className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              <span>MOTION: {reducedMotion ? 'REDUCED' : 'NORMAL'}</span>
            </button>

            {/* Scanline shader toggle */}
            <button
              type="button"
              onClick={handleToggleScanlines}
              className={`flex items-center space-x-1.5 transition-colors px-2 py-0.5 border rounded text-[10px] ${
                scanlinesEnabled && !reducedMotion
                  ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/10 font-bold'
                  : 'border-cyber-border text-cyber-muted hover:text-cyber-cyan'
              }`}
              title="Toggle retro CRT scanlines"
              aria-pressed={scanlinesEnabled && !reducedMotion}
            >
              {scanlinesEnabled && !reducedMotion ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>SCANLINES: {scanlinesEnabled && !reducedMotion ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
