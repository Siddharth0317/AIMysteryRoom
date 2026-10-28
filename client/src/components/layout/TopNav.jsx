import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, Shield, Plus, RotateCcw, Settings, User, Menu, Compass, Crosshair, Award, Archive } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CyberButton from '../common/CyberButton';
import SettingsModal from './SettingsModal';
import AgentProfileModal from './AgentProfileModal';
import NavMenuModal from './NavMenuModal';

export default function TopNav({
  activeCase,
  scanlinesEnabled,
  onToggleScanlines,
  audioEnabled,
  onToggleAudio,
  onResetCaseData
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isCaseActive = Boolean(activeCase && activeCase.id);
  const caseId = activeCase?.id;

  const handleResetView = () => {
    if (isCaseActive) {
      navigate(`/investigation/${caseId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-cyber-bg/95 backdrop-blur-md border-b border-cyber-border font-mono">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Active Case Header (matching Cyber Noir Detective UI) */}
          <div className="flex items-center space-x-3 min-w-0">
            <Link
              to="/"
              className="flex items-center space-x-2.5 group focus:outline-none focus:ring-1 focus:ring-cyber-cyan rounded p-1 shrink-0"
              title="Return to Cyber Terminal Dashboard"
            >
              <div className="w-8 h-8 rounded bg-cyber-surface border border-cyber-cyan/60 flex items-center justify-center text-cyber-cyan group-hover:border-cyber-cyan group-hover:shadow-neon-cyan transition-all">
                <Terminal className="w-4 h-4 animate-pulse" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <span className="font-display font-bold text-sm sm:text-base tracking-wider text-cyber-text group-hover:text-cyber-cyan transition-colors">
                    CYBER NOIR DETECTIVE
                  </span>
                  <span className="hidden md:inline-block text-[9px] text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-1 py-0.2 rounded">
                    AI-CORE
                  </span>
                </div>
                <p className="text-[10px] text-cyber-muted -mt-0.5 tracking-wider truncate hidden xs:block">
                  {isCaseActive ? (
                    <span>
                      <span className="text-cyber-cyan font-bold">ACTIVE INVESTIGATION</span>
                      <span className="text-cyber-border mx-1.5">//</span>
                      <span className="text-cyber-text">{activeCase.title || 'Untitled Case'}</span>
                    </span>
                  ) : (
                    <span className="text-cyber-muted">SYSTEM: STANDBY // NO ACTIVE CASE</span>
                  )}
                </p>
              </div>
            </Link>
          </div>

          {/* Center Case Stage Tabs (When Case Is Active) */}
          {isCaseActive && (
            <div className="hidden lg:flex items-center space-x-1 bg-cyber-surface/70 border border-cyber-border p-1 rounded-lg text-xs">
              <Link
                to={`/investigation/${caseId}`}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-all ${
                  location.pathname.includes('/investigation') || location.pathname === `/case/${caseId}`
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/60 font-bold shadow-neon-cyan'
                    : 'text-cyber-muted hover:text-cyber-text'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>DOSSIER</span>
              </Link>

              <Link
                to={`/accuse/${caseId}`}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-all ${
                  location.pathname.includes('/accuse')
                    ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/60 font-bold shadow-sm shadow-cyber-red/40'
                    : 'text-cyber-muted hover:text-cyber-text'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>ACCUSE</span>
              </Link>

              {activeCase.status === 'completed' && (
                <Link
                  to={`/results/${caseId}`}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded transition-all ${
                    location.pathname.includes('/results') || location.pathname.includes('/result')
                      ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/60 font-bold shadow-neon-green'
                      : 'text-cyber-muted hover:text-cyber-text'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>VERDICT</span>
                </Link>
              )}
            </div>
          )}

          {/* Right Action Controls (matching screenshot: NEW CASE, RESET VIEW, Settings, Profile, Menu) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* New Case Button */}
            <Link to="/create">
              <CyberButton
                variant="primary"
                size="sm"
                icon={Plus}
                className="text-xs shadow-neon-cyan"
              >
                <span className="hidden sm:inline">NEW</span> CASE
              </CyberButton>
            </Link>

            {/* Archive & Stats Button */}
            <Link
              to="/archive"
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded bg-cyber-surface hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/50 text-cyber-muted hover:text-cyber-cyan text-xs transition-all"
              title="View Case Archive, Statistics, and Detective Achievements"
            >
              <Archive className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">ARCHIVE</span>
            </Link>

            {/* Reset View Button */}
            <button
              type="button"
              onClick={handleResetView}
              aria-label="Reset workspace view"
              title="Reset terminal view or return to active dossier"
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded bg-cyber-surface hover:bg-cyber-subsurface border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-cyber-cyan text-xs transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">RESET VIEW</span>
            </button>

            {/* Settings Icon Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open terminal settings"
              title="Terminal settings & display configuration"
              className="p-2 rounded bg-cyber-surface hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/60 text-cyber-muted hover:text-cyber-cyan transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Detective Profile Icon Button (User identity & login status) */}
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              aria-label="Open detective dossier and session information"
              title="Detective dossier (Guest session // No login required)"
              className="p-2 rounded bg-cyber-surface hover:bg-cyber-magenta/10 border border-cyber-border hover:border-cyber-magenta/60 text-cyber-muted hover:text-cyber-magenta transition-all"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Menu (Hamburger) Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation menu drawer"
              title="Terminal menu & quick jump"
              className="p-2 rounded bg-cyber-surface hover:bg-cyber-cyan/10 border border-cyber-border hover:border-cyber-cyan/60 text-cyber-muted hover:text-cyber-cyan transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={onToggleScanlines}
        audioEnabled={audioEnabled}
        onToggleAudio={onToggleAudio}
        onResetCaseData={onResetCaseData}
        activeCase={activeCase}
      />

      {/* Agent Profile Modal */}
      <AgentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        activeCase={activeCase}
      />

      {/* Nav Menu Modal */}
      <NavMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeCase={activeCase}
      />
    </>
  );
}
