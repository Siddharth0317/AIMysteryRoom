import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Home,
  ArrowRight,
  User,
  Cpu,
  AlertTriangle,
  Compass,
  CheckCircle,
  Archive,
} from 'lucide-react';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';
import CyberButton from '../components/common/CyberButton';
import ScoreBreakdown from '../components/mystery/ScoreBreakdown';
import EmptyState from '../components/common/EmptyState';
import casesApi from '../api/casesApi';

export default function Results({ activeCase, latestResult }) {
  const navigate = useNavigate();
  const { caseId, id } = useParams();
  const currentCaseId = caseId || id || activeCase?.id;

  const [fetchedResult, setFetchedResult] = useState(null);
  const [loading, setLoading] = useState(!latestResult && !activeCase?.result);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const result = latestResult || activeCase?.result || fetchedResult;

  useEffect(() => {
    if (!result && currentCaseId) {
      casesApi.getCaseResult(currentCaseId)
        .then((data) => {
          setFetchedResult(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [currentCaseId, result]);

  // Asynchronously load Post-Game AI Analysis without blocking core result
  useEffect(() => {
    if (currentCaseId && result) {
      setAnalysisLoading(true);
      casesApi.getCaseAnalysis(currentCaseId)
        .then((data) => {
          setAnalysis(data);
          setAnalysisLoading(false);
        })
        .catch((err) => {
          setAnalysisError(err.message || 'Analysis debrief unavailable');
          setAnalysisLoading(false);
        });
    }
  }, [currentCaseId, result]);

  if (loading) {
    return (
      <div className="py-12 text-center font-mono text-xs text-cyber-cyan animate-pulse">
        RECOVERING ENCRYPTED CASE VERDICT...
      </div>
    );
  }

  if (!result) {
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

      {/* Post-Game AI Analysis & Tactical Forensic Debrief (SPEC.md Section 17.6) */}
      <TerminalPanel
        title="AI CASE DEBRIEF &amp; TACTICAL FORENSIC REVIEW"
        subtitle="POST-INCIDENT INTELLIGENCE SYNTHESIS"
        badge={
          <StatusBadge size="xs" variant={analysis ? 'green' : 'cyan'}>
            {analysisLoading ? 'SYNTHESIZING' : analysis ? 'ANALYSIS READY' : 'FORENSIC REVIEW'}
          </StatusBadge>
        }
      >
        {analysisLoading ? (
          <div className="py-8 text-center text-cyber-cyan text-xs font-mono animate-pulse flex flex-col items-center justify-center space-y-2">
            <Cpu className="w-6 h-6 animate-spin text-cyber-cyan" />
            <span>SYNTHESIZING NEURAL POST-INCIDENT DEBRIEF WITH GEMINI...</span>
          </div>
        ) : analysis ? (
          <div className="space-y-4 text-xs">
            {/* Decisive Evidence Summary */}
            <div className="p-3 bg-cyber-subsurface border border-cyber-cyan/40 rounded-lg">
              <span className="text-[10px] text-cyber-cyan font-bold uppercase tracking-wider block mb-1">
                EXECUTIVE DEBRIEF SUMMARY:
              </span>
              <p className="text-cyber-text text-xs sm:text-sm leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Key Evidence Breakdown */}
            {analysis.keyEvidence && analysis.keyEvidence.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-cyber-green" />
                  <span className="font-bold text-cyber-green uppercase tracking-wider text-xs">
                    DECISIVE FORENSIC BREAKTHROUGHS
                  </span>
                </div>
                <div className="space-y-2">
                  {analysis.keyEvidence.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-cyber-surface/90 border border-cyber-green/40 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyber-text text-xs">
                          {item.title}
                        </span>
                        <StatusBadge size="xs" variant="green">KEY EVIDENCE</StatusBadge>
                      </div>
                      <p className="text-cyber-muted text-[11px] leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Herrings Deconstructed */}
            {analysis.redHerrings && analysis.redHerrings.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-cyber-amber" />
                  <span className="font-bold text-cyber-amber uppercase tracking-wider text-xs">
                    RED HERRINGS DECONSTRUCTED
                  </span>
                </div>
                <div className="space-y-2">
                  {analysis.redHerrings.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-cyber-surface/90 border border-cyber-amber/30 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-cyber-amber text-xs">
                          ANOMALY #{item.clueId}
                        </span>
                        <StatusBadge size="xs" variant="amber">DISTRACTION</StatusBadge>
                      </div>
                      <p className="text-cyber-muted text-[11px] leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suspect Comparison */}
            {analysis.suspectComparison && (
              <div className="p-3 bg-cyber-subsurface border border-cyber-border rounded-lg">
                <span className="text-[10px] text-cyber-muted uppercase font-bold block mb-1">
                  SUSPECT &amp; ACCUSATION FORENSIC EVALUATION:
                </span>
                <p className="text-cyber-muted text-[11px] leading-relaxed">
                  {analysis.suspectComparison}
                </p>
              </div>
            )}

            {/* Next Time Tactical Tip */}
            {analysis.nextTimeTip && (
              <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/50 rounded-lg flex items-start space-x-2">
                <Compass className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-cyber-cyan font-bold uppercase block">
                    TACTICAL DIRECTIVE FOR FUTURE INVESTIGATIONS:
                  </span>
                  <p className="text-cyber-text text-xs leading-relaxed mt-0.5">
                    {analysis.nextTimeTip}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-cyber-subsurface/60 border border-cyber-border rounded text-center text-cyber-muted text-xs">
            {analysisError || 'AI forensic debrief is currently unavailable for this case.'}
          </div>
        )}
      </TerminalPanel>

      {/* Authoritative Score Breakdown */}
      <ScoreBreakdown breakdown={result.scoreBreakdown} />

      {/* Next Actions Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-cyber-border">
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

        {currentCaseId && (
          <Link to={`/investigation/${currentCaseId}`} className="w-full sm:w-auto">
            <CyberButton
              variant="secondary"
              size="lg"
              icon={Compass}
              className="w-full sm:w-auto"
            >
              REVIEW CASE DOSSIER
            </CyberButton>
          </Link>
        )}

        <Link to="/archive" className="w-full sm:w-auto">
          <CyberButton
            variant="ghost"
            size="lg"
            icon={Archive}
            className="w-full sm:w-auto border-cyber-border hover:border-cyber-cyan"
          >
            ARCHIVES &amp; STATS
          </CyberButton>
        </Link>

        <Link to="/" className="w-full sm:w-auto">
          <CyberButton
            variant="ghost"
            size="lg"
            icon={Home}
            className="w-full sm:w-auto border-cyber-border"
          >
            RETURN TO TERMINAL
          </CyberButton>
        </Link>
      </div>
    </div>
  );
}
