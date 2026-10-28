import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, ShieldCheck, Key, Lock, Terminal, Award, CheckCircle2 } from 'lucide-react';
import CyberButton from '../common/CyberButton';
import StatusBadge from '../common/StatusBadge';

export default function AgentProfileModal({ isOpen, onClose, activeCase }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-profile-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-cyber-bg/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-cyber-surface border border-cyber-cyan/50 rounded-lg shadow-2xl shadow-cyber-cyan/20 overflow-hidden font-mono text-xs max-h-[85vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-subsurface border-b border-cyber-border shrink-0">
          <div className="flex items-center space-x-2 text-cyber-cyan min-w-0">
            <User className="w-4 h-4 shrink-0" />
            <h2 id="agent-profile-modal-title" className="font-display font-bold tracking-wider text-sm uppercase text-cyber-text truncate">
              DETECTIVE DOSSIER &amp; SESSION
            </h2>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="hidden sm:inline-block text-[10px] text-cyber-muted border border-cyber-border/70 px-1.5 py-0.5 rounded">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detective dossier window"
              className="flex items-center space-x-1 px-2 py-1 rounded text-cyber-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors border border-transparent hover:border-cyber-cyan/40"
            >
              <X className="w-4 h-4" />
              <span className="text-[11px] font-bold">QUIT</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Agent Identity Card */}
          <div className="flex items-center space-x-4 p-3 rounded-lg bg-cyber-subsurface border border-cyber-border">
            <div className="w-12 h-12 rounded bg-cyber-bg border border-cyber-cyan/60 flex items-center justify-center text-cyber-cyan shadow-neon-cyan shrink-0">
              <Terminal className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-sm text-cyber-text tracking-wide">
                  OPERATIVE: GUEST-704
                </span>
                <StatusBadge size="xs" variant="green">ONLINE</StatusBadge>
              </div>
              <p className="text-[11px] text-cyber-muted">
                Role: Autonomous Cyber-Investigator
              </p>
              <p className="text-[10px] text-cyber-cyan">
                Clearance: TIER-3 (UNRESTRICTED FORENSICS)
              </p>
            </div>
          </div>

          {/* Login Security Notice */}
          <div className="p-3.5 rounded bg-cyber-subsurface/80 border border-cyber-border/80 space-y-2">
            <div className="flex items-center space-x-2 text-cyber-amber">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                SESSION ARCHITECTURE // ZERO-LOGIN
              </span>
            </div>
            <p className="text-[11px] text-cyber-muted leading-relaxed">
              Per <strong className="text-cyber-text">SPEC.md Section 1.3</strong>, player accounts and login security are out of scope for Version 1.0. 
              Investigations operate in a private, client-isolated sandbox with all anti-cheat scoring strictly verified on the backend.
            </p>
            <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between text-[10px] text-cyber-muted">
              <span>SECURITY LEVEL:</span>
              <span className="text-cyber-green font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>SERVER-VERIFIED (ZERO-LEAKAGE)</span>
              </span>
            </div>
          </div>

          {/* Active Case Telemetry */}
          <div className="p-3 rounded bg-cyber-subsurface/40 border border-cyber-border space-y-1.5 text-[11px]">
            <span className="text-[10px] text-cyber-muted uppercase block font-bold">
              CURRENT ASSIGNMENT
            </span>
            {activeCase ? (
              <div className="space-y-1">
                <div className="text-cyber-text font-bold truncate">
                  {activeCase.title || activeCase.premise?.slice(0, 40)}
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-cyber-muted flex-wrap gap-1">
                  <span>ID: {activeCase.id?.slice(0, 10)}</span>
                  <span>•</span>
                  <span className="text-cyber-cyan uppercase">{activeCase.difficulty} TIER</span>
                  <span>•</span>
                  <span className="text-cyber-green uppercase">{activeCase.status || 'ACTIVE'}</span>
                </div>
              </div>
            ) : (
              <p className="text-cyber-muted italic">
                No active investigation loaded in terminal memory.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-subsurface border-t border-cyber-border shrink-0">
          <span className="text-[10px] text-cyber-muted">CYBER-DOSSIER v1.0</span>
          <CyberButton variant="ghost" size="sm" icon={X} onClick={onClose}>
            DISMISS [ESC]
          </CyberButton>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
