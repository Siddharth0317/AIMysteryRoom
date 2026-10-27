import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, Sparkles, RefreshCw, Home, ArrowRight, User } from 'lucide-react';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';
import CyberButton from '../components/common/CyberButton';
import ScoreBreakdown from '../components/mystery/ScoreBreakdown';
import EmptyState from '../components/common/EmptyState';

export default function Results({ activeCase, latestResult }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // If latestResult is not passed directly, look inside activeCase.result
  const result = latestResult || (activeCase && activeCase.result);

  if (!activeCase || !result) {
    return (
      <EmptyState
        title="NO CASE VERDICT AVAILABLE"
        description="The requested case has either not been solved yet or does not exist."
        actionLabel="RETURN TO HOME"
        onAction={() => navigate('/')}
      />
    );
  }

  const isCorrect = result.verdict === 'correct';

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono animate-fade-in">
      {/* High-Impact Verdict Banner */}
      <div
        className={`relative p-6 sm:p-8 rounded-lg border text-center overflow-hidden transition-all duration-300 ${
          isCorrect
            ? 'bg-cyber-green/10 border-cyber-green shadow-neon-green/30 shadow-xl'
            : 'bg-cyber-red/10 border-cyber-red shadow-neon-red/30 shadow-xl'
        }`}
      >
        <div className="cyber-scanlines absolute inset-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${
              isCorrect
                ? 'border-cyber-green text-cyber-green bg-cyber-green/20 shadow-neon-green'
                : 'border-cyber-red text-cyber-red bg-cyber-red/20'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-8 h-8 animate-pulse" />
            ) : (
              <XCircle className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <StatusBadge size="sm" variant={isCorrect ? 'green' : 'red'}>
            {isCorrect ? 'VERDICT: GUILTY AS ACCUSED' : 'VERDICT: INNOCENT — MISIDENTIFIED'}
          </StatusBadge>

          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-wider uppercase text-cyber-text">
            {isCorrect ? 'CASE SOLVED' : 'INVESTIGATION FAILED'}
          </h1>

          <p className="max-w-xl text-xs sm:text-sm text-cyber-muted">
            {isCorrect
              ? 'Your forensic analysis aligned perfectly with the server-encrypted evidence trail.'
              : 'The evidence did not support your accusation. The true perpetrator escaped undetected.'}
          </p>
        </div>
      </div>

      {/* Culprit Reveal & Comparison Panel */}
      <TerminalPanel
        title="PERPETRATOR IDENTITY &amp; FORENSIC DEBRIEF"
        subtitle="DECRYPTED RECONSTRUCTION"
        badge={
          <StatusBadge size="xs" variant={isCorrect ? 'green' : 'red'}>
            {isCorrect ? 'TARGET MATCH' : 'PERPETRATOR REVEALED'}
          </StatusBadge>
        }
      >
        <div className="space-y-5 text-xs">
          {/* Culprit Identity Card */}
          <div className="bg-cyber-subsurface border border-cyber-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded border border-cyber-cyan bg-cyber-cyan/10 flex items-center justify-center text-cyber-cyan shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-cyber-muted uppercase block">
                  TRUE CULPRIT DESIGNATION:
                </span>
                <span className="text-base font-bold text-cyber-cyan">
                  {result.culpritName}
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="text-[10px] text-cyber-muted uppercase block">
                YOUR ACCUSATION:
              </span>
              <span className={`font-bold ${isCorrect ? 'text-cyber-green' : 'text-cyber-red'}`}>
                {isCorrect ? 'CORRECT MATCH (+BASE PTS)' : 'INCORRECT SUSPECT (0 PTS)'}
              </span>
            </div>
          </div>

          {/* Solution Debrief Explanation */}
          <div>
            <h4 className="text-cyber-text font-bold uppercase tracking-wider text-xs mb-2">
              Official Crime Reconstruction:
            </h4>
            <div className="bg-cyber-subsurface/80 p-4 rounded border border-cyber-border/70 text-cyber-text/90 leading-relaxed text-xs sm:text-sm">
              {result.solution}
            </div>
          </div>
        </div>
      </TerminalPanel>

      {/* Authoritative Score Breakdown */}
      <ScoreBreakdown breakdown={result.scoreBreakdown} />

      {/* Next Actions Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-cyber-border">
        <Link to="/create" className="w-full sm:w-auto">
          <CyberButton
            variant="primary"
            size="lg"
            icon={RefreshCw}
            className="w-full sm:w-auto shadow-neon-cyan"
          >
            INITIALIZE NEW MYSTERY
          </CyberButton>
        </Link>

        <Link to="/" className="w-full sm:w-auto">
          <CyberButton
            variant="ghost"
            size="lg"
            icon={Home}
            className="w-full sm:w-auto"
          >
            RETURN TO TERMINAL
          </CyberButton>
        </Link>
      </div>
    </div>
  );
}
