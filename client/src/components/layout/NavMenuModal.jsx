import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Home, PlusCircle, Compass, Crosshair, Award, BookOpen, Shield, ChevronRight, Terminal } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CyberButton from '../common/CyberButton';

export default function NavMenuModal({ isOpen, onClose, activeCase }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isCaseActive = activeCase && activeCase.id;
  const isCaseCompleted = activeCase && activeCase.status === 'completed';

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nav-menu-title"
      className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4 bg-cyber-bg/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-cyber-surface border border-cyber-cyan/40 rounded-lg shadow-2xl shadow-cyber-cyan/20 overflow-hidden font-mono text-xs mt-14"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-subsurface border-b border-cyber-border">
          <div className="flex items-center space-x-2 text-cyber-cyan">
            <Terminal className="w-4 h-4" />
            <h2 id="nav-menu-title" className="font-display font-bold tracking-wider text-sm uppercase text-cyber-text">
              TERMINAL NAVIGATION
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-1 rounded text-cyber-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {/* Home */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="w-full flex items-center justify-between p-3 rounded bg-cyber-subsurface/60 hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/50 text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <Home className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-cyber-text text-xs block">TERMINAL DASHBOARD</span>
                <span className="text-[10px] text-cyber-muted">System hub &amp; operation overview</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-cyan" />
          </button>

          {/* New Case */}
          <button
            type="button"
            onClick={() => handleNav('/create')}
            className="w-full flex items-center justify-between p-3 rounded bg-cyber-subsurface/60 hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/50 text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <PlusCircle className="w-4 h-4 text-cyber-green group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-cyber-text text-xs block">INITIALIZE NEW CASE</span>
                <span className="text-[10px] text-cyber-muted">Synthesize premise via Gemini GenAI</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-cyan" />
          </button>

          {/* Investigation Room */}
          <button
            type="button"
            disabled={!isCaseActive}
            onClick={() => isCaseActive && handleNav(`/investigation/${activeCase.id}`)}
            className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all ${
              isCaseActive
                ? 'bg-cyber-subsurface/60 hover:bg-cyber-magenta/10 border-cyber-border hover:border-cyber-magenta/50 group cursor-pointer'
                : 'bg-cyber-subsurface/30 border-cyber-border/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Compass className={`w-4 h-4 ${isCaseActive ? 'text-cyber-magenta' : 'text-cyber-muted'}`} />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-cyber-text text-xs block">INVESTIGATION DOSSIER</span>
                  {isCaseActive && <StatusBadge size="xs" variant="amber">ACTIVE</StatusBadge>}
                </div>
                <span className="text-[10px] text-cyber-muted">
                  {isCaseActive ? `Case #${activeCase.id?.slice(0, 8)}` : 'Requires active case'}
                </span>
              </div>
            </div>
            {isCaseActive && <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-magenta" />}
          </button>

          {/* Accusation */}
          <button
            type="button"
            disabled={!isCaseActive}
            onClick={() => isCaseActive && handleNav(`/accuse/${activeCase.id}`)}
            className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all ${
              isCaseActive
                ? 'bg-cyber-subsurface/60 hover:bg-cyber-red/10 border-cyber-border hover:border-cyber-red/50 group cursor-pointer'
                : 'bg-cyber-subsurface/30 border-cyber-border/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Crosshair className={`w-4 h-4 ${isCaseActive ? 'text-cyber-red' : 'text-cyber-muted'}`} />
              <div>
                <span className="font-bold text-cyber-text text-xs block">ACCUSATION CHAMBER</span>
                <span className="text-[10px] text-cyber-muted">
                  {isCaseActive ? 'Submit final perpetrator verdict' : 'Requires active case'}
                </span>
              </div>
            </div>
            {isCaseActive && <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-red" />}
          </button>

          {/* Results */}
          <button
            type="button"
            disabled={!isCaseCompleted}
            onClick={() => isCaseCompleted && handleNav(`/results/${activeCase.id}`)}
            className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all ${
              isCaseCompleted
                ? 'bg-cyber-subsurface/60 hover:bg-cyber-green/10 border-cyber-border hover:border-cyber-green/50 group cursor-pointer'
                : 'bg-cyber-subsurface/30 border-cyber-border/40 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Award className={`w-4 h-4 ${isCaseCompleted ? 'text-cyber-green' : 'text-cyber-muted'}`} />
              <div>
                <span className="font-bold text-cyber-text text-xs block">VERDICT DEBRIEF</span>
                <span className="text-[10px] text-cyber-muted">
                  {isCaseCompleted ? 'View verified score & solution' : 'Available upon case completion'}
                </span>
              </div>
            </div>
            {isCaseCompleted && <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-green" />}
          </button>
        </div>

        {/* Security & System Info Footer */}
        <div className="px-4 py-3 bg-cyber-subsurface border-t border-cyber-border flex items-center justify-between text-[10px] text-cyber-muted">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>ZERO-LEAKAGE ACTIVE</span>
          </div>
          <span>v1.0.4 CYBER-NOIR</span>
        </div>
      </div>
    </div>
  );
}
