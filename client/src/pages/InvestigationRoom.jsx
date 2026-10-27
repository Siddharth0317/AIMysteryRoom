import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Shield, Compass, FileText, AlertTriangle, Sparkles, Key, CheckCircle, Crosshair } from 'lucide-react';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';
import CyberButton from '../components/common/CyberButton';
import SuspectCard from '../components/mystery/SuspectCard';
import ClueCard from '../components/mystery/ClueCard';
import HintTerminal from '../components/mystery/HintTerminal';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';
import { discoverMockClue, useMockHint } from '../utils/mockCase';

export default function InvestigationRoom({ activeCase, onCaseUpdated }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('all'); // mobile tab: 'story', 'suspects', 'clues', 'hints'
  const [decryptingId, setDecryptingId] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (!activeCase) {
    return (
      <EmptyState
        title="NO CASE ACTIVE IN TERMINAL"
        description="Select or generate an investigation scenario to populate the cyber-detective console."
        actionLabel="INITIALIZE NEW CASE"
        onAction={() => navigate('/create')}
      />
    );
  }

  const {
    id: caseId,
    title,
    difficulty = 'medium',
    story,
    premise,
    suspects = [],
    clues = [],
    hints = [],
    hintsUsed = 0,
    status = 'active',
  } = activeCase;

  const maxHints = difficulty === 'easy' ? 2 : 3;
  const discoveredCluesCount = clues.filter((c) => c.discovered).length;
  const totalClues = clues.length;

  // Clue discovery handler
  const handleDiscoverClue = (clueId) => {
    setActionError(null);
    setDecryptingId(clueId);

    setTimeout(() => {
      try {
        const updated = discoverMockClue(caseId, clueId);
        if (onCaseUpdated) onCaseUpdated(updated);
        setDecryptingId(null);
      } catch (err) {
        setActionError('Failed to decrypt clue segment.');
        setDecryptingId(null);
      }
    }, 700);
  };

  // Hint request handler
  const handleRequestHint = () => {
    setActionError(null);
    setHintLoading(true);

    setTimeout(() => {
      try {
        const res = useMockHint(caseId);
        if (res.error) {
          setActionError(res.message || 'Cannot retrieve additional tactical hints.');
        } else if (res.updatedCase && onCaseUpdated) {
          onCaseUpdated(res.updatedCase);
        }
        setHintLoading(false);
      } catch (err) {
        setActionError('Tactical guidance retrieval failed.');
        setHintLoading(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Case Header Banner */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg p-4 sm:p-6 shadow-terminal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-cyber-muted">CASE ARCHIVE:</span>
              <span className="text-cyber-cyan font-bold">#{caseId.slice(0, 10)}</span>
              <span className="text-cyber-border">|</span>
              <StatusBadge size="xs" variant={status === 'completed' ? 'green' : 'amber'}>
                {status.toUpperCase()}
              </StatusBadge>
              <StatusBadge size="xs" variant="cyan">
                {difficulty.toUpperCase()}
              </StatusBadge>
            </div>

            <h1 className="text-xl sm:text-2xl font-display font-bold text-cyber-text tracking-wide uppercase">
              {title}
            </h1>
          </div>

          {/* Quick Metrics & Proceed Action */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="hidden sm:flex items-center space-x-4 text-xs bg-cyber-subsurface px-3 py-2 rounded border border-cyber-border">
              <div>
                <span className="text-[10px] text-cyber-muted block">EVIDENCE</span>
                <span className="font-bold text-cyber-green">
                  {discoveredCluesCount}/{totalClues}
                </span>
              </div>
              <div className="border-l border-cyber-border pl-3">
                <span className="text-[10px] text-cyber-muted block">HINTS</span>
                <span className="font-bold text-cyber-amber">
                  {hintsUsed}/{maxHints}
                </span>
              </div>
            </div>

            <Link to={`/case/${caseId}/accuse`}>
              <CyberButton
                variant="danger"
                size="md"
                icon={Crosshair}
                className="shadow-md shadow-cyber-red/20"
              >
                ACCUSE SUSPECT
              </CyberButton>
            </Link>
          </div>
        </div>
      </div>

      {actionError && (
        <ErrorBanner
          title="INVESTIGATION NOTICE"
          message={actionError}
          onDismiss={() => setActionError(null)}
        />
      )}

      {/* Mobile Tab Selector (Visible on mobile only) */}
      <div className="flex sm:hidden overflow-x-auto space-x-2 pb-2 border-b border-cyber-border text-xs">
        {['all', 'story', 'suspects', 'clues', 'hints'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded uppercase font-bold shrink-0 transition-colors ${
              activeTab === tab
                ? 'bg-cyber-cyan text-cyber-bg'
                : 'bg-cyber-surface text-cyber-muted border border-cyber-border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3-Column Desktop Grid Layout (Collapses on small viewports) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column 1: Case Briefing & Story (4 Cols) */}
        <div className={`lg:col-span-4 space-y-6 ${
          activeTab !== 'all' && activeTab !== 'story' ? 'hidden sm:block' : ''
        }`}>
          <TerminalPanel
            title="MISSION BRIEFING &amp; TIMELINE"
            subtitle="CLASSIFIED INCIDENT DOSSIER"
            badge={<StatusBadge size="xs" variant="cyan">BRIEFING</StatusBadge>}
          >
            <div className="space-y-4 text-xs leading-relaxed text-cyber-muted">
              <div>
                <span className="text-[11px] font-bold text-cyber-text uppercase block mb-1">
                  Incident Premise:
                </span>
                <p className="bg-cyber-subsurface p-2.5 rounded border border-cyber-border/60 text-cyber-text">
                  {premise}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-cyber-text uppercase block mb-1">
                  Crime Reconstruction Narrative:
                </span>
                <p className="whitespace-pre-line leading-relaxed">
                  {story}
                </p>
              </div>

              <div className="pt-2 border-t border-cyber-border/60 flex items-center justify-between text-[11px]">
                <span className="text-cyber-muted">OBJECTIVE:</span>
                <span className="text-cyber-cyan font-bold">ISOLATE TRUE CULPRIT</span>
              </div>
            </div>
          </TerminalPanel>
        </div>

        {/* Column 2: Suspects Panel (4 Cols) */}
        <div className={`lg:col-span-4 space-y-4 ${
          activeTab !== 'all' && activeTab !== 'suspects' ? 'hidden sm:block' : ''
        }`}>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyber-cyan">
              IDENTIFIED PERSONS OF INTEREST ({suspects.length})
            </h2>
            <span className="text-[11px] text-cyber-muted">VERIFY ALIBIS</span>
          </div>

          <div className="space-y-3">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
              />
            ))}
          </div>
        </div>

        {/* Column 3: Evidence Matrix & Tactical Hint Console (4 Cols) */}
        <div className={`lg:col-span-4 space-y-6 ${
          activeTab !== 'all' && activeTab !== 'clues' && activeTab !== 'hints' ? 'hidden sm:block' : ''
        }`}>
          {/* Clues Evidence Subpanel */}
          <div className={activeTab === 'hints' ? 'hidden sm:block' : ''}>
            <TerminalPanel
              title={`FORENSIC EVIDENCE (${discoveredCluesCount}/${totalClues})`}
              subtitle="DECRYPT FOR INSIGHTS &amp; SCORE"
              badge={
                <StatusBadge size="xs" variant={discoveredCluesCount === totalClues ? 'green' : 'cyan'}>
                  {Math.round((discoveredCluesCount / totalClues) * 100)}%
                </StatusBadge>
              }
            >
              {/* Progress bar */}
              <div className="w-full bg-cyber-subsurface h-1.5 rounded-full overflow-hidden mb-4 border border-cyber-border">
                <div
                  className="bg-cyber-green h-full transition-all duration-300"
                  style={{ width: `${(discoveredCluesCount / totalClues) * 100}%` }}
                />
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {clues.map((clue, idx) => (
                  <ClueCard
                    key={clue.id}
                    clue={clue}
                    index={idx}
                    onDiscover={handleDiscoverClue}
                    isDecrypting={decryptingId === clue.id}
                  />
                ))}
              </div>
            </TerminalPanel>
          </div>

          {/* Hint Terminal Subpanel */}
          <div className={activeTab === 'clues' ? 'hidden sm:block' : ''}>
            <HintTerminal
              hints={hints}
              hintsUsed={hintsUsed}
              maxHints={maxHints}
              onRequestHint={handleRequestHint}
              isLoading={hintLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
