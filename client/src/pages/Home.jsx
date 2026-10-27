import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Sparkles, Compass, AlertCircle, ArrowRight, Play } from 'lucide-react';
import CyberButton from '../components/common/CyberButton';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';

export default function Home({ activeCase }) {
  return (
    <div className="space-y-10 sm:space-y-12 max-w-5xl mx-auto py-4">
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-4 pb-2">
        {/* Sub-badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-mono">
          <Terminal className="w-3.5 h-3.5 animate-pulse" />
          <span>ADVANCED NEURAL INVESTIGATION SYSTEM</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-wider text-cyber-text text-shadow-neon uppercase">
          AI MYSTERY ROOM
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-cyber-muted font-mono leading-relaxed">
          Step into a futuristic cyber-detective terminal. Synthesize unique, solvable cases powered by Google Gemini, decode forensic evidence, manage tactical hints, and identify the true culprit before the trail goes cold.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link to="/create">
            <CyberButton
              variant="primary"
              size="lg"
              icon={Play}
              className="w-full sm:w-auto shadow-neon-cyan"
            >
              INITIALIZE CASE
            </CyberButton>
          </Link>

          {activeCase && activeCase.id && (
            <Link to={`/case/${activeCase.id}`}>
              <CyberButton
                variant="magenta"
                size="lg"
                icon={Compass}
                className="w-full sm:w-auto shadow-neon-magenta"
              >
                RESUME ACTIVE CASE ({activeCase.difficulty.toUpperCase()})
              </CyberButton>
            </Link>
          )}
        </div>
      </div>

      {/* Terminal Grid: System Specs & How To Play */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <TerminalPanel
          title="PROTOCOL 01"
          subtitle="PREMISE GENERATION"
          badge={<StatusBadge size="xs" variant="cyan">INPUT</StatusBadge>}
        >
          <div className="space-y-2.5 font-mono text-xs">
            <h3 className="text-cyber-text font-bold text-sm">
              Craft the Mystery
            </h3>
            <p className="text-cyber-muted leading-relaxed">
              Feed any scenario into the neural engine—from corporate espionage to cybernetic murders—and select your difficulty tier.
            </p>
          </div>
        </TerminalPanel>

        {/* Step 2 */}
        <TerminalPanel
          title="PROTOCOL 02"
          subtitle="FORENSIC DECRYPTION"
          badge={<StatusBadge size="xs" variant="amber">INVESTIGATE</StatusBadge>}
        >
          <div className="space-y-2.5 font-mono text-xs">
            <h3 className="text-cyber-text font-bold text-sm">
              Uncover the Trail
            </h3>
            <p className="text-cyber-muted leading-relaxed">
              Examine suspect dossiers, stated alibis, and hidden motives. Decrypt forensic clues (+5 pts) and request progressive hints (-10 pts).
            </p>
          </div>
        </TerminalPanel>

        {/* Step 3 */}
        <TerminalPanel
          title="PROTOCOL 03"
          subtitle="FINAL VERDICT"
          badge={<StatusBadge size="xs" variant="green">RESOLVE</StatusBadge>}
        >
          <div className="space-y-2.5 font-mono text-xs">
            <h3 className="text-cyber-text font-bold text-sm">
              Accuse &amp; Debrief
            </h3>
            <p className="text-cyber-muted leading-relaxed">
              Lock in your primary suspect. The backend validates your deduction against server-held secrets and reveals the full crime debrief.
            </p>
          </div>
        </TerminalPanel>
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
