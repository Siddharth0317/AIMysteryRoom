import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sliders,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Trash2,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Zap,
  ZapOff,
  LogOut,
  Home,
  CornerDownLeft
} from 'lucide-react';
import CyberButton from '../common/CyberButton';
import StatusBadge from '../common/StatusBadge';

export default function SettingsModal({
  isOpen,
  onClose,
  scanlinesEnabled,
  onToggleScanlines,
  reducedMotion,
  onToggleReducedMotion,
  audioEnabled,
  onToggleAudio,
  onResetCaseData,
  activeCase
}) {
  const navigate = useNavigate();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [quitCaseConfirm, setQuitCaseConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setResetConfirm(false);
      setQuitCaseConfirm(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    if (onResetCaseData) {
      onResetCaseData();
    }
    setResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      onClose();
    }, 1200);
  };

  const handleQuitCase = () => {
    if (!quitCaseConfirm) {
      setQuitCaseConfirm(true);
      return;
    }
    setQuitCaseConfirm(false);
    onClose();
    navigate('/');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-cyber-bg/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-cyber-surface border border-cyber-cyan/50 rounded-lg shadow-2xl shadow-cyber-cyan/20 overflow-hidden font-mono text-xs max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header (Fixed/Sticky) */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-subsurface border-b border-cyber-border shrink-0">
          <div className="flex items-center space-x-2 text-cyber-cyan min-w-0">
            <Sliders className="w-4 h-4 shrink-0" />
            <h2 id="settings-modal-title" className="font-display font-bold tracking-wider text-sm uppercase text-cyber-text truncate">
              TERMINAL CONFIGURATION
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <span className="hidden sm:inline-block text-[10px] text-cyber-muted border border-cyber-border/70 px-1.5 py-0.5 rounded">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Quit configuration window"
              className="flex items-center space-x-1 px-2 py-1 rounded text-cyber-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors border border-transparent hover:border-cyber-cyan/40"
            >
              <X className="w-4 h-4" />
              <span className="text-[11px] font-bold">QUIT</span>
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable with neon scrollbar) */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          {/* Visual Display Section */}
          <div className="space-y-3">
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider block border-b border-cyber-border/60 pb-1 font-bold">
              DISPLAY &amp; SHADERS
            </span>

            {/* Scanlines Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-cyber-subsurface/60 border border-cyber-border gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-cyber-text flex items-center space-x-2">
                  <span>Retro CRT Scanlines</span>
                </span>
                <p className="text-[11px] text-cyber-muted">
                  Simulate high-tech CRT phosphor lines and screen curvature shader.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleScanlines}
                className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
                  scanlinesEnabled && !reducedMotion
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan'
                    : 'bg-cyber-surface text-cyber-muted border border-cyber-border'
                }`}
                disabled={reducedMotion}
              >
                {scanlinesEnabled && !reducedMotion ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{reducedMotion ? 'MUTED BY REDUCED MOTION' : scanlinesEnabled ? 'ENABLED' : 'DISABLED'}</span>
              </button>
            </div>

            {/* Reduced Motion Toggle (A11y) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-cyber-subsurface/60 border border-cyber-border gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-cyber-text flex items-center space-x-2">
                  <span>Reduced Motion (A11y)</span>
                  <StatusBadge size="xs" variant="cyan">WCAG AA</StatusBadge>
                </span>
                <p className="text-[11px] text-cyber-muted">
                  Suppress pulsing glows, glitch transitions, and animated CRT scanline movement.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleReducedMotion}
                className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
                  reducedMotion
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan'
                    : 'bg-cyber-surface text-cyber-muted border border-cyber-border'
                }`}
              >
                {reducedMotion ? <ZapOff className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{reducedMotion ? 'ENABLED' : 'DISABLED'}</span>
              </button>
            </div>

            {/* Audio Feedback Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-cyber-subsurface/60 border border-cyber-border gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-cyber-text flex items-center space-x-2">
                  <span>Haptic &amp; Sound Feedback</span>
                </span>
                <p className="text-[11px] text-cyber-muted">
                  Synthesize tactile terminal clicks and forensic decryption cues.
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleAudio}
                className={`flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
                  audioEnabled
                    ? 'bg-cyber-magenta/20 text-cyber-magenta border border-cyber-magenta'
                    : 'bg-cyber-surface text-cyber-muted border border-cyber-border'
                }`}
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{audioEnabled ? 'MUTED' : 'UNMUTED'}</span>
              </button>
            </div>
          </div>

          {/* Security & System Telemetry */}
          <div className="space-y-2">
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider block border-b border-cyber-border/60 pb-1 font-bold">
              SUBSYSTEM TELEMETRY
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-cyber-subsurface/40 border border-cyber-border">
                <span className="text-cyber-muted block text-[10px]">AI ENGINE</span>
                <span className="text-cyber-cyan font-bold flex items-center space-x-1 mt-0.5">
                  <Cpu className="w-3 h-3" />
                  <span>GEMINI GENAI 2.5</span>
                </span>
              </div>
              <div className="p-2.5 rounded bg-cyber-subsurface/40 border border-cyber-border">
                <span className="text-cyber-muted block text-[10px]">ZERO-LEAKAGE SHIELD</span>
                <span className="text-cyber-green font-bold flex items-center space-x-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% ENFORCED</span>
                </span>
              </div>
            </div>
          </div>

          {/* Active Case Navigation & Quit Section */}
          {activeCase && activeCase.id && (
            <div className="space-y-2 pt-2 border-t border-cyber-border">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyber-cyan uppercase tracking-wider font-bold">
                  ACTIVE CASE NAVIGATION
                </span>
                <StatusBadge size="xs" variant="amber">
                  CASE #{activeCase.id.slice(0, 8)}
                </StatusBadge>
              </div>
              <p className="text-[11px] text-cyber-muted">
                Suspend current investigation and return to Central Terminal Hub. Case progress remains safely stored in local memory.
              </p>
              
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <CyberButton
                  variant={quitCaseConfirm ? 'danger' : 'secondary'}
                  size="sm"
                  icon={quitCaseConfirm ? CornerDownLeft : LogOut}
                  onClick={handleQuitCase}
                  className="w-full sm:w-auto"
                >
                  {quitCaseConfirm ? 'CONFIRM: EXIT TO DASHBOARD' : 'QUIT CASE & RETURN TO DASHBOARD'}
                </CyberButton>
                {quitCaseConfirm && (
                  <button
                    type="button"
                    onClick={() => setQuitCaseConfirm(false)}
                    className="text-cyber-muted hover:text-cyber-text text-xs underline px-2 py-1"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Data Reset Section */}
          <div className="space-y-2 pt-2 border-t border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider block font-bold">
              LOCAL DOSSIER PURGE
            </span>
            <p className="text-[11px] text-cyber-muted">
              Clear your active investigation state and cached forensic logs from local memory.
            </p>

            {resetSuccess ? (
              <div className="p-2.5 rounded bg-cyber-green/10 border border-cyber-green/40 text-cyber-green flex items-center space-x-2 text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>TERMINAL REINITIALIZED: LOCAL DATA PURGED</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <CyberButton
                  variant={resetConfirm ? 'danger' : 'ghost'}
                  size="sm"
                  icon={Trash2}
                  onClick={handleReset}
                  className="w-full sm:w-auto text-cyber-red hover:bg-cyber-red/10 border-cyber-red/40"
                >
                  {resetConfirm ? 'CONFIRM PURGE LOCAL CASE' : 'PURGE ACTIVE CASE DATA'}
                </CyberButton>
                {resetConfirm && (
                  <button
                    type="button"
                    onClick={() => setResetConfirm(false)}
                    className="text-cyber-muted hover:text-cyber-text text-xs underline px-2 py-1"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer (Fixed/Sticky at Bottom) */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-subsurface border-t border-cyber-border shrink-0">
          <div className="flex items-center space-x-1.5 text-[10px] text-cyber-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
            <span className="hidden xs:inline">SYSTEM NOMINAL</span>
          </div>
          <div className="flex items-center space-x-2">
            <CyberButton
              variant="primary"
              size="sm"
              icon={X}
              onClick={onClose}
              className="text-xs shadow-neon-cyan"
            >
              QUIT CONFIG [ESC]
            </CyberButton>
          </div>
        </div>
      </div>
    </div>
  );
}
