import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Sparkles, Compass, AlertCircle, ArrowRight, Play, Lock, CheckCircle2, Award } from 'lucide-react';
import CyberButton from '../components/common/CyberButton';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';

export default function Home({ activeCase }) {
  const isCaseActive = Boolean(activeCase && activeCase.id);
  const isCaseCompleted = isCaseActive && activeCase.status === 'completed';

  return (
    <div className="space-y-10 sm:space-y-12 max-w-5xl mx-auto py-4 font-mono">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-4 pb-2">
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* Primary Button */}
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

          {/* Secondary Button: Resume or Disabled Explanation */}
          {isCaseActive ? (
            <Link
              to={isCaseCompleted ? `/results/${activeCase.id}` : `/investigation/${activeCase.id}`}
              className="w-full sm:w-auto"
            >
              <CyberButton
                variant={isCaseCompleted ? 'green' : 'magenta'}
                size="lg"
                icon={isCaseCompleted ? Award : Compass}
                className={`w-full ${isCaseCompleted ? 'shadow-neon-green' : 'shadow-neon-magenta'}`}
              >
                {isCaseCompleted ? 'VIEW CASE VERDICT' : 'RESUME ACTIVE CASE'} ({activeCase.difficulty?.toUpperCase()})
              </CyberButton>
            </Link>
          ) : (
            <div className="relative group w-full sm:w-auto">
              <CyberButton
                variant="ghost"
                size="lg"
                icon={Lock}
                disabled
                className="w-full opacity-50 cursor-not-allowed border-cyber-border/60 text-cyber-muted"
              >
                RESUME ACTIVE CASE
              </CyberButton>
              <div className="text-[11px] text-cyber-muted mt-1.5 flex items-center justify-center space-x-1">
                <AlertCircle className="w-3 h-3 text-cyber-amber shrink-0" />
                <span>No active investigation — initialize a case first</span>
              </div>
            </div>
          )}
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
                  <span>ENTER DOSSIER (ID: {activeCase.id.slice(0, 8)})</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </TerminalPanel>
          </Link>
        ) : (
          <div className="opacity-75">
            <TerminalPanel
              title="PROTOCOL 02"
              subtitle="FORENSIC DECRYPTION"
              badge={<StatusBadge size="xs" variant="gray">STANDBY</StatusBadge>}
              className="h-full border-cyber-border/60"
            >
              <div className="space-y-3 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="text-cyber-muted font-bold text-sm">
                    Uncover the Trail
                  </h3>
                  <p className="text-cyber-muted/80 leading-relaxed font-sans">
                    Examine suspect dossiers, stated alibis, and hidden motives. Decrypt forensic clues (+5 pts) and request progressive hints (-10 pts).
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border/40 text-cyber-muted/60 text-[11px] flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-cyber-amber shrink-0" />
                  <span>Awaiting active investigation scenario</span>
                </div>
              </div>
            </TerminalPanel>
          </div>
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
          <div className="opacity-75">
            <TerminalPanel
              title="PROTOCOL 03"
              subtitle="FINAL VERDICT"
              badge={<StatusBadge size="xs" variant="gray">STANDBY</StatusBadge>}
              className="h-full border-cyber-border/60"
            >
              <div className="space-y-3 text-xs flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <h3 className="text-cyber-muted font-bold text-sm">
                    Accuse &amp; Debrief
                  </h3>
                  <p className="text-cyber-muted/80 leading-relaxed font-sans">
                    Lock in your primary suspect. The backend validates your deduction against server-held secrets and reveals the full crime debrief.
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border/40 text-cyber-muted/60 text-[11px] flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-cyber-amber shrink-0" />
                  <span>Available after identifying suspect in active case</span>
                </div>
              </div>
            </TerminalPanel>
          </div>
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
