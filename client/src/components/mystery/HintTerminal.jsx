import React from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck } from 'lucide-react';
import TerminalPanel from '../common/TerminalPanel';
import CyberButton from '../common/CyberButton';
import StatusBadge from '../common/StatusBadge';

export default function HintTerminal({
  hints = [],
  hintsUsed = 0,
  maxHints = 3,
  onRequestHint,
  isLoading = false,
  isCompleted = false,
}) {
  const remaining = Math.max(0, maxHints - hintsUsed);
  const isLimitReached = remaining === 0;

  // Render revealed hints based on hintsUsed count
  const revealedHints = hints.slice(0, hintsUsed);

  return (
    <TerminalPanel
      title="TACTICAL HINT CONSOLE"
      subtitle="AI COGNITIVE GUIDANCE"
      badge={
        <StatusBadge
          size="xs"
          variant={isLimitReached ? 'red' : 'amber'}
        >
          {remaining} / {maxHints} AVAILABLE
        </StatusBadge>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="space-y-4 flex-1">
        {/* Warning / Penalty Notice */}
        <div className="flex items-center justify-between bg-cyber-subsurface/70 border border-cyber-border/70 p-2.5 rounded text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-cyber-amber">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold">PENALTY: -10 PTS PER HINT</span>
          </div>
          <span className="text-cyber-muted text-[10px]">DIFFICULTY CAP: {maxHints}</span>
        </div>

        {/* Revealed Hints List */}
        <div className="space-y-2.5">
          {revealedHints.length === 0 ? (
            <div className="p-4 rounded border border-dashed border-cyber-border text-center font-mono text-xs text-cyber-muted">
              <Lightbulb className="w-5 h-5 mx-auto mb-1.5 opacity-40 text-cyber-cyan" />
              <p>No tactical hints deployed.</p>
              <p className="text-[10px] text-cyber-muted/70 mt-1">
                Request assistance if stuck. Progressive hints narrow suspect anomalies.
              </p>
            </div>
          ) : (
            revealedHints.map((hint, idx) => (
              <div
                key={hint.id || idx}
                className="bg-cyber-subsurface border border-cyber-cyan/30 rounded p-3 font-mono text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-cyber-cyan font-bold text-[10px] uppercase">
                  <span>HINT PROTOCOL #{idx + 1}</span>
                  <span className="text-cyber-amber">-10 PTS</span>
                </div>
                <p className="text-cyber-text leading-relaxed">
                  {hint.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-cyber-border">
        {isCompleted ? (
          <div className="text-center p-2 rounded bg-cyber-subsurface border border-cyber-border text-cyber-muted text-xs font-mono">
            INVESTIGATION CONCLUDED // HINTS LOCKED
          </div>
        ) : isLimitReached ? (
          <div className="text-center p-2 rounded bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-xs font-mono font-bold">
            HINT ALLOCATION EXHAUSTED FOR THIS CASE
          </div>
        ) : (
          <CyberButton
            variant="magenta"
            size="md"
            className="w-full"
            onClick={onRequestHint}
            disabled={isLoading || isLimitReached || isCompleted}
            icon={Lightbulb}
          >
            {isLoading ? 'Accessing Neural Guidance...' : `Request Tactical Hint (-10 Pts)`}
          </CyberButton>
        )}
      </div>
    </TerminalPanel>
  );
}
