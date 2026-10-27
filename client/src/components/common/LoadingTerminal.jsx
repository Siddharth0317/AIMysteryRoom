import React, { useEffect, useState } from 'react';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function LoadingTerminal({
  title = 'NEURAL SYNTHESIS IN PROGRESS',
  messages = [
    'Establishing secure sub-quantum datalink...',
    'Interfacing with Gemini Neural Cores...',
    'Synthesizing crime scene telemetry & timeline...',
    'Generating suspect dossiers and psychological profiles...',
    'Encrypting forensic evidence & clue matrix...',
    'Finalizing investigation parameters...',
  ],
  durationMs = 3000,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const stepInterval = durationMs / messages.length;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev;
      });

      setProgress((prev) => {
        const next = prev + Math.floor(90 / messages.length);
        return next >= 100 ? 100 : next;
      });
    }, stepInterval);

    const timeout = setTimeout(() => {
      setProgress(100);
      if (onComplete) onComplete();
    }, durationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [messages, durationMs, onComplete]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="relative bg-cyber-surface border border-cyber-cyan/50 rounded-lg p-6 font-mono shadow-terminal max-w-xl mx-auto overflow-hidden"
    >
      {/* Scanline overlay */}
      <div className="cyber-scanlines absolute inset-0 pointer-events-none" />

      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
        <div className="flex items-center space-x-2 text-cyber-cyan">
          <Terminal className="w-5 h-5 animate-pulse" />
          <h3 className="font-bold text-xs uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="text-cyber-green text-xs font-bold">
          {progress}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-cyber-subsurface h-1.5 rounded-full overflow-hidden mb-5 border border-cyber-border">
        <div
          className="bg-cyber-cyan h-full transition-all duration-300 shadow-neon-cyan"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Terminal Output Log Stream */}
      <div className="space-y-2 text-xs min-h-[140px] flex flex-col justify-end">
        {messages.slice(0, currentStep + 1).map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              idx === currentStep ? 'text-cyber-cyan' : 'text-cyber-muted'
            }`}
          >
            <span className="text-cyber-green shrink-0 font-bold">&gt;</span>
            <span className="leading-relaxed">{msg}</span>
            {idx === currentStep && (
              <span className="w-2 h-4 bg-cyber-cyan animate-pulse inline-block shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Footer System Indicator */}
      <div className="mt-5 pt-3 border-t border-cyber-border/60 flex items-center justify-between text-[11px] text-cyber-muted">
        <span className="flex items-center space-x-1">
          <ShieldAlert className="w-3.5 h-3.5 text-cyber-amber" />
          <span>ZERO-LEAKAGE PROTOCOL ACTIVE</span>
        </span>
        <span className="text-cyber-cyan animate-pulse">DECRYPTING...</span>
      </div>
    </div>
  );
}
