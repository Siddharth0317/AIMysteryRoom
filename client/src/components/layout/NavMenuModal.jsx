import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Home, PlusCircle, Compass, Crosshair, Award, BookOpen, Shield, ChevronRight, Terminal, Archive, Clock } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CyberButton from '../common/CyberButton';
import { getCaseArchive } from '../../utils/mockCase';

export default function NavMenuModal({ isOpen, onClose, activeCase }) {
  const navigate = useNavigate();
  const [archivedCases, setArchivedCases] = useState([]);
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setArchivedCases(getCaseArchive());
    }
  }, [isOpen]);

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
        className="w-full max-w-sm sm:max-w-md bg-cyber-surface border border-cyber-cyan/40 rounded-lg shadow-2xl shadow-cyber-cyan/20 overflow-hidden font-mono text-xs mt-14 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-subsurface border-b border-cyber-border shrink-0">
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

        {/* Scrollable Content */}
        {/* Scrollable Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Section 1: System Portal */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-bold px-1">
              // SYSTEM PORTAL
            </span>
            {/* Home */}
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="w-full flex items-center justify-between p-2.5 rounded bg-cyber-subsurface/60 hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/50 text-left transition-all group"
            >
              <div className="flex items-center space-x-3">
                <Home className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-bold text-cyber-text text-xs block">TERMINAL DASHBOARD</span>
                  <span className="text-[10px] text-cyber-muted">Central operations &amp; case launcher</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-cyan" />
            </button>

            {/* New Case */}
            <button
              type="button"
              onClick={() => handleNav('/create')}
              className="w-full flex items-center justify-between p-2.5 rounded bg-cyber-subsurface/60 hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/50 text-left transition-all group"
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

            {/* Case Archive & Stats */}
            <button
              type="button"
              onClick={() => handleNav('/archive')}
              className="w-full flex items-center justify-between p-2.5 rounded bg-cyber-subsurface/60 hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/50 text-left transition-all group"
            >
              <div className="flex items-center space-x-3">
                <Archive className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-bold text-cyber-text text-xs block">ARCHIVE &amp; DETECTIVE STATS</span>
                  <span className="text-[10px] text-cyber-muted">Case dossiers, performance KPIs &amp; badges</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-cyan" />
            </button>
          </div>

          {/* Section 2: Active Investigation Context */}
          <div className="space-y-1.5 pt-2 border-t border-cyber-border/60">
            <span className="text-[10px] text-cyber-muted uppercase tracking-wider font-bold px-1 flex items-center justify-between">
              <span>// ACTIVE INVESTIGATION</span>
              {isCaseActive && <StatusBadge size="xs" variant="amber">IN PROGRESS</StatusBadge>}
            </span>

            {isCaseActive ? (
              <div className="space-y-1.5">
                {/* Investigation Room */}
                <button
                  type="button"
                  onClick={() => handleNav(`/investigation/${activeCase.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded bg-cyber-subsurface/60 hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/50 text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Compass className="w-4 h-4 text-cyber-cyan" />
                    <div>
                      <span className="font-bold text-cyber-text text-xs block">DOSSIER &amp; EVIDENCE BOARD</span>
                      <span className="text-[10px] text-cyber-muted">
                        Case #{activeCase.id?.slice(0, 8)} • {activeCase.title || 'Untitled'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-cyan" />
                </button>

                {/* Accusation */}
                <button
                  type="button"
                  onClick={() => handleNav(`/accuse/${activeCase.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded bg-cyber-subsurface/60 hover:bg-cyber-red/10 border border-cyber-border hover:border-cyber-red/50 text-left transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Crosshair className="w-4 h-4 text-cyber-red" />
                    <div>
                      <span className="font-bold text-cyber-text text-xs block">ACCUSATION CHAMBER</span>
                      <span className="text-[10px] text-cyber-muted">Submit perpetrator verdict</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-red" />
                </button>

                {/* Results (if completed) */}
                {isCaseCompleted && (
                  <button
                    type="button"
                    onClick={() => handleNav(`/results/${activeCase.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded bg-cyber-subsurface/60 hover:bg-cyber-green/10 border border-cyber-border hover:border-cyber-green/50 text-left transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-4 h-4 text-cyber-green" />
                      <div>
                        <span className="font-bold text-cyber-text text-xs block">VERDICT DEBRIEF</span>
                        <span className="text-[10px] text-cyber-muted">View verified score &amp; solution</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cyber-muted group-hover:text-cyber-green" />
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 rounded bg-cyber-subsurface/30 border border-cyber-border/40 text-center space-y-1.5">
                <p className="text-[11px] text-cyber-muted">No investigation currently loaded in session.</p>
                <button
                  type="button"
                  onClick={() => handleNav('/create')}
                  className="inline-flex items-center space-x-1 text-[10px] text-cyber-cyan hover:underline font-bold"
                >
                  <span>+ Synthesize New Mystery Case</span>
                </button>
              </div>
            )}
          </div>

          {/* Case Archive Accordion */}
          <div className="pt-2 border-t border-cyber-border/60">
            <button
              type="button"
              onClick={() => setShowArchive((prev) => !prev)}
              className="w-full flex items-center justify-between p-2.5 rounded bg-cyber-subsurface/40 hover:bg-cyber-surface border border-cyber-border text-left transition-all"
            >
              <div className="flex items-center space-x-2 text-cyber-cyan">
                <Archive className="w-3.5 h-3.5" />
                <span className="font-bold text-[11px] uppercase">
                  SAVED CASE ARCHIVE ({archivedCases.length})
                </span>
              </div>
              <span className="text-[10px] text-cyber-muted">
                {showArchive ? 'COLLAPSE ▲' : 'EXPAND ▼'}
              </span>
            </button>

            {showArchive && (
              <div className="mt-2 space-y-1.5 pl-1 pr-1 max-h-40 overflow-y-auto">
                {archivedCases.length === 0 ? (
                  <p className="text-[10px] text-cyber-muted italic p-2 text-center">
                    No cases archived yet. Initialize a mystery to populate.
                  </p>
                ) : (
                  archivedCases.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleNav(c.status === 'completed' ? `/results/${c.id}` : `/investigation/${c.id}`)}
                      className="w-full p-2 rounded bg-cyber-subsurface/80 hover:bg-cyber-cyan/10 border border-cyber-border/60 hover:border-cyber-cyan text-left transition-all flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold text-[11px] text-cyber-text block truncate">
                          {c.title || c.premise?.slice(0, 30)}
                        </span>
                        <span className="text-[9px] text-cyber-muted">
                          ID: #{c.id?.slice(0, 8)} • {c.difficulty?.toUpperCase()}
                        </span>
                      </div>
                      <StatusBadge size="xs" variant={c.status === 'completed' ? 'green' : 'amber'}>
                        {c.status === 'completed' ? 'SOLVED' : 'ACTIVE'}
                      </StatusBadge>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security & System Info Footer */}
        <div className="px-4 py-3 bg-cyber-subsurface border-t border-cyber-border flex items-center justify-between text-[10px] text-cyber-muted shrink-0">
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
