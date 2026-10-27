import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Shield, PlusCircle, Compass, FileText } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CyberButton from '../common/CyberButton';

export default function TopNav({ activeCase }) {
  const location = useLocation();

  const isCaseActive = activeCase && activeCase.id;

  return (
    <header className="sticky top-0 z-50 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-cyber-cyan rounded p-1"
        >
          <div className="w-9 h-9 rounded bg-cyber-surface border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan group-hover:border-cyber-cyan group-hover:shadow-neon-cyan transition-all">
            <Terminal className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg tracking-wider text-cyber-cyan group-hover:text-shadow-neon transition-all">
                AI MYSTERY ROOM
              </span>
              <span className="hidden sm:inline-block font-mono text-[10px] text-cyber-green bg-cyber-green/10 border border-cyber-green/30 px-1.5 py-0.2 rounded">
                v1.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyber-muted -mt-0.5 tracking-wider hidden sm:block">
              CYBER INVESTIGATION TERMINAL
            </p>
          </div>
        </Link>

        {/* Center Case Status Indicator */}
        {isCaseActive && (
          <div className="hidden md:flex items-center space-x-3 bg-cyber-surface/60 border border-cyber-border px-3 py-1.5 rounded font-mono text-xs">
            <Shield className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="text-cyber-muted uppercase">CASE:</span>
            <span className="text-cyber-cyan font-bold">
              {activeCase.id.slice(0, 12)}
            </span>
            <span className="text-cyber-border">|</span>
            <StatusBadge
              size="xs"
              variant={activeCase.status === 'completed' ? 'green' : 'amber'}
            >
              {activeCase.status || 'ACTIVE'}
            </StatusBadge>
            <StatusBadge size="xs" variant="cyan">
              {activeCase.difficulty || 'MEDIUM'}
            </StatusBadge>
          </div>
        )}

        {/* Right Navigation Actions */}
        <nav className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/create">
            <CyberButton
              variant="primary"
              size="sm"
              icon={PlusCircle}
            >
              <span className="hidden sm:inline">Initialize</span> Case
            </CyberButton>
          </Link>

          {isCaseActive && (
            <Link to={`/case/${activeCase.id}`}>
              <CyberButton
                variant={location.pathname.startsWith('/case') ? 'magenta' : 'ghost'}
                size="sm"
                icon={Compass}
              >
                Room
              </CyberButton>
            </Link>
          )}

          <Link to="/" className="text-cyber-muted hover:text-cyber-cyan p-1.5 transition-colors hidden sm:block">
            <span className="sr-only">Home</span>
            <FileText className="w-4 h-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
