import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Shield, Sparkles, Compass, AlertCircle, ArrowRight, Play, Award, Archive, Calendar, Zap, RefreshCw } from 'lucide-react';
import CyberButton from '../components/common/CyberButton';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';
import casesApi from '../api/casesApi';

export default function Home({ activeCase, onCaseCreated }) {
  const navigate = useNavigate();
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState(null);

  const isCaseActive = Boolean(activeCase && activeCase.id);
  const isCaseCompleted = isCaseActive && activeCase.status === 'completed';

  const handleLaunchDaily = async () => {
    setDailyLoading(true);
    setDailyError(null);
    try {
      const res = await casesApi.getDailyCase();
      if (onCaseCreated && res?.case) {
        onCaseCreated(res.case);
      }
      navigate(`/investigation/${res.case.id}`);
    } catch (err) {
      setDailyError('Failed to synchronize daily mystery case. Directing to case generator.');
      setTimeout(() => navigate('/create'), 1200);
    } finally {
      setDailyLoading(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto py-4 font-mono">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-2 pb-2">
        {/* Sub-badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs">
          <Terminal className="w-3.5 h-3.5 animate-pulse" />
          <span>ADVANCED NEURAL INVESTIGATION SYSTEM</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-wider text-cyber-text text-shadow-neon uppercase">
          AI MYSTERY ROOM
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-cyber-muted leading-relaxed font-sans">
          Step into a futuristic cyber-detective terminal. Synthesize unique, solvable cases powered by Google Gemini, decode forensic evidence, manage tactical hints, and identify the true culprit before the trail goes cold.
        </p>

        {/* Action Buttons: Clean & Contextual */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          {isCaseActive ? (
            <>
              {/* Primary Action when case is active: Resume */}
              <Link
                to={isCaseCompleted ? `/results/${activeCase.id}` : `/investigation/${activeCase.id}`}
                className="w-full sm:w-auto"
              >
                <CyberButton
                  variant={isCaseCompleted ? 'green' : 'primary'}
                  size="lg"
                  icon={isCaseCompleted ? Award : Compass}
                  className={`w-full ${isCaseCompleted ? 'shadow-neon-green' : 'shadow-neon-cyan'}`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                    <span>{isCaseCompleted ? 'VIEW CASE VERDICT' : 'RESUME ACTIVE CASE'}</span>
                    <span className="text-xs opacity-75">({activeCase.difficulty?.toUpperCase()})</span>
                  </span>
                </CyberButton>
              </Link>

              {/* Secondary Action: Start New Case */}
              <Link to="/create" className="w-full sm:w-auto">
                <CyberButton
                  variant="ghost"
                  size="lg"
                  icon={Play}
                  className="w-full border-cyber-border hover:border-cyber-cyan text-cyber-text"
                >
                  INITIALIZE NEW CASE
                </CyberButton>
              </Link>

              {/* Tertiary: Archive */}
              <Link to="/archive" className="w-full sm:w-auto">
                <CyberButton
                  variant="ghost"
                  size="lg"
                  icon={Archive}
                  className="w-full border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-cyber-cyan"
                >
                  ARCHIVE &amp; STATS
                </CyberButton>
              </Link>
            </>
          ) : (
            <>
              {/* Primary Action: Initialize New Case */}
              <Link to="/create" className="w-full sm:w-auto">
                <CyberButton
                  variant="primary"
                  size="lg"
                  icon={Play}
                  className="w-full shadow-neon-cyan"
                >
                  INITIALIZE NEW CASE
                </CyberButton>
              </Link>

              {/* Secondary Action: Daily Mystery Seeded Challenge */}
              <button
                type="button"
                onClick={handleLaunchDaily}
                disabled={dailyLoading}
                className="w-full sm:w-auto focus:outline-none"
              >
                <CyberButton
                  variant="secondary"
                  size="lg"
                  icon={dailyLoading ? RefreshCw : Sparkles}
                  className={`w-full border-cyber-magenta/60 hover:border-cyber-magenta text-cyber-magenta shadow-neon-magenta ${
                    dailyLoading ? 'animate-pulse' : ''
                  }`}
                >
                  {dailyLoading ? 'SYNCHRONIZING DAILY...' : 'DAILY MYSTERY CHALLENGE'}
                </CyberButton>
              </button>

              {/* Tertiary: Case Archive */}
              <Link to="/archive" className="w-full sm:w-auto">
                <CyberButton
                  variant="ghost"
                  size="lg"
                  icon={Archive}
                  className="w-full border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-cyber-cyan"
                >
                  ARCHIVE &amp; STATS
                </CyberButton>
              </Link>
            </>
          )}
        </div>

        {dailyError && (
          <p className="text-xs text-cyber-amber bg-cyber-amber/10 border border-cyber-amber/30 rounded px-3 py-1.5 max-w-md mx-auto">
            {dailyError}
          </p>
        )}
      </div>

      {/* Phase 7 Quick Intel Banner: Daily Mystery & Detective Credentials */}
      <div className="bg-cyber-surface/90 border border-cyber-cyan/30 rounded-lg p-3 sm:p-4 shadow-terminal relative overflow-hidden">
        <div className="cyber-scanlines absolute inset-0 pointer-events-none opacity-20" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 text-xs">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-cyber-text uppercase tracking-wider text-xs sm:text-sm">
                  DAILY INVESTIGATION PROTOCOL
                </span>
                <StatusBadge size="xs" variant="cyan">SEEDED 24H</StatusBadge>
              </div>
              <p className="text-[11px] text-cyber-muted font-sans mt-0.5">
                Every detective worldwide tackles the exact same seeded mystery each calendar day.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={handleLaunchDaily}
              disabled={dailyLoading}
              className="px-3 py-1.5 rounded bg-cyber-cyan/15 hover:bg-cyber-cyan/25 border border-cyber-cyan text-cyber-cyan font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm shadow-cyber-cyan/30 w-full sm:w-auto justify-center"
            >
              <span>{dailyLoading ? 'LAUNCHING...' : 'PLAY DAILY MYSTERY'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <Link
              to="/archive"
              className="px-3 py-1.5 rounded bg-cyber-subsurface hover:bg-cyber-surface border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-cyber-cyan text-xs font-bold transition-all hidden md:flex items-center space-x-1"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>DOSSIER ARCHIVE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Terminal Grid: Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Protocol 01 */}
        <Link
          to="/create"
          className="group focus:outline-none focus:ring-1 focus:ring-cyber-cyan rounded-lg block transition-transform hover:-translate-y-1"
        >
          <TerminalPanel
            title="PROTOCOL 01"
            subtitle="PREMISE GENERATION"
            badge={<StatusBadge size="xs" variant="cyan">READY</StatusBadge>}
            className="h-full group-hover:border-cyber-cyan group-hover:shadow-neon-cyan transition-all"
          >
            <div className="space-y-3 text-xs flex flex-col justify-between h-full">
              <div className="space-y-2">
                <h3 className="text-cyber-text font-bold text-sm group-hover:text-cyber-cyan transition-colors">
                  Craft the Mystery
                </h3>
                <p className="text-cyber-muted leading-relaxed font-sans">
                  Feed any scenario into the neural engine—from corporate espionage to cybernetic murders—and select your difficulty tier.
                </p>
              </div>
              <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between text-cyber-cyan font-bold text-[11px]">
                <span>INITIALIZE PREMISE</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </TerminalPanel>
        </Link>

        {/* Protocol 02 */}
        {isCaseActive ? (
          <Link
            to={`/investigation/${activeCase.id}`}
            className="group focus:outline-none focus:ring-1 focus:ring-cyber-magenta rounded-lg block transition-transform hover:-translate-y-1"
          >
            <TerminalPanel
              title="PROTOCOL 02"
              subtitle="FORENSIC DECRYPTION"
              badge={<StatusBadge size="xs" variant="amber">ACTIVE</StatusBadge>}
              className="h-full group-hover:border-cyber-magenta group-hover:shadow-neon-magenta transition-all"
            >
              <div className="space-y-3 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="text-cyber-text font-bold text-sm group-hover:text-cyber-magenta transition-colors">
                    Uncover the Trail
                  </h3>
                  <p className="text-cyber-muted leading-relaxed font-sans">
                    Examine suspect dossiers, stated alibis, and hidden motives. Decrypt forensic clues (+5 pts) and request progressive hints (-10 pts).
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between text-cyber-magenta font-bold text-[11px]">
                  <span>ENTER DOSSIER (#{activeCase.id.slice(0, 8)})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TerminalPanel>
          </Link>
        ) : (
          <Link
            to="/archive"
            className="group focus:outline-none focus:ring-1 focus:ring-cyber-cyan rounded-lg block transition-transform hover:-translate-y-1"
          >
            <TerminalPanel
              title="PROTOCOL 02"
              subtitle="FORENSIC EVIDENCE & ARCHIVES"
              badge={<StatusBadge size="xs" variant="cyan">ARCHIVES</StatusBadge>}
              className="h-full group-hover:border-cyber-cyan group-hover:shadow-neon-cyan transition-all"
            >
              <div className="space-y-3 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="text-cyber-text font-bold text-sm group-hover:text-cyber-cyan transition-colors">
                    Uncover the Trail
                  </h3>
                  <p className="text-cyber-muted leading-relaxed font-sans">
                    Examine suspect dossiers, stated alibis, and hidden motives. Decrypt forensic clues (+5 pts) and request progressive hints (-10 pts).
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between text-cyber-cyan font-bold text-[11px]">
                  <span>EXPLORE SOLVED DOSSIERS</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TerminalPanel>
          </Link>
        )}

        {/* Protocol 03 */}
        {isCaseCompleted ? (
          <Link
            to={`/results/${activeCase.id}`}
            className="group focus:outline-none focus:ring-1 focus:ring-cyber-green rounded-lg block transition-transform hover:-translate-y-1"
          >
            <TerminalPanel
              title="PROTOCOL 03"
              subtitle="FINAL VERDICT"
              badge={<StatusBadge size="xs" variant="green">COMPLETED</StatusBadge>}
              className="h-full group-hover:border-cyber-green group-hover:shadow-neon-green transition-all"
            >
              <div className="space-y-3 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="text-cyber-text font-bold text-sm group-hover:text-cyber-green transition-colors">
                    Accuse &amp; Debrief
                  </h3>
                  <p className="text-cyber-muted leading-relaxed font-sans">
                    Lock in your primary suspect. The backend validates your deduction against server-held secrets and reveals the full crime debrief.
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between text-cyber-green font-bold text-[11px]">
                  <span>VIEW VERDICT RESULTS</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TerminalPanel>
          </Link>
        ) : isCaseActive ? (
          <Link
            to={`/accuse/${activeCase.id}`}
            className="group focus:outline-none focus:ring-1 focus:ring-cyber-red rounded-lg block transition-transform hover:-translate-y-1"
          >
            <TerminalPanel
              title="PROTOCOL 03"
              subtitle="FINAL VERDICT"
              badge={<StatusBadge size="xs" variant="red">ACCUSATION PENDING</StatusBadge>}
              className="h-full group-hover:border-cyber-red group-hover:shadow-sm group-hover:shadow-cyber-red/30 transition-all"
            >
              <div className="space-y-3 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="text-cyber-text font-bold text-sm group-hover:text-cyber-red transition-colors">
                    Accuse &amp; Debrief
                  </h3>
                  <p className="text-cyber-muted leading-relaxed font-sans">
                    Lock in your primary suspect. The backend validates your deduction against server-held secrets and reveals the full crime debrief.
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between text-cyber-red font-bold text-[11px]">
                  <span>PROCEED TO ACCUSATION</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TerminalPanel>
          </Link>
        ) : (
          <Link
            to="/archive"
            className="group focus:outline-none focus:ring-1 focus:ring-cyber-magenta rounded-lg block transition-transform hover:-translate-y-1"
          >
            <TerminalPanel
              title="PROTOCOL 03"
              subtitle="DEDUCTION & SCORING"
              badge={<StatusBadge size="xs" variant="purple">ANTI-CHEAT</StatusBadge>}
              className="h-full group-hover:border-cyber-magenta group-hover:shadow-neon-magenta transition-all"
            >
              <div className="space-y-3 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="text-cyber-text font-bold text-sm group-hover:text-cyber-magenta transition-colors">
                    Accuse &amp; Debrief
                  </h3>
                  <p className="text-cyber-muted leading-relaxed font-sans">
                    Lock in your primary suspect. The backend validates your deduction against server-held secrets and reveals the full crime debrief.
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border/60 flex items-center justify-between text-cyber-magenta font-bold text-[11px]">
                  <span>CHECK DETECTIVE STATS</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TerminalPanel>
          </Link>
        )}
      </div>

      {/* Security & System Architecture Panel */}
      <TerminalPanel
        title="CORE PROTOCOL STATUS &amp; ZERO-LEAKAGE TELEMETRY"
        glow
        scanlines
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-cyber-subsurface p-3 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">SECRECY SHIELD</span>
            <span className="text-cyber-green font-bold text-sm">100% SERVER-HELD</span>
            <p className="text-[10px] text-cyber-muted mt-1">Culprit is never exposed in client payloads</p>
          </div>

          <div className="bg-cyber-subsurface p-3 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">NEURAL CORE</span>
            <span className="text-cyber-cyan font-bold text-sm">GEMINI 2.5 API</span>
            <p className="text-[10px] text-cyber-muted mt-1">Dynamic case synthesis &amp; validation</p>
          </div>

          <div className="bg-cyber-subsurface p-3 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">SCORING ENGINE</span>
            <span className="text-cyber-magenta font-bold text-sm">AUTHORITATIVE</span>
            <p className="text-[10px] text-cyber-muted mt-1">Anti-cheat scoring on backend only</p>
          </div>

          <div className="bg-cyber-subsurface p-3 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">DIFFICULTY TIERS</span>
            <span className="text-cyber-amber font-bold text-sm">EASY / MED / HARD</span>
            <p className="text-[10px] text-cyber-muted mt-1">Strict suspect, clue &amp; hint counts</p>
          </div>
        </div>
      </TerminalPanel>
    </div>
  );
}
