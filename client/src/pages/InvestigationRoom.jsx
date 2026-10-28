import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Shield, Compass, FileText, AlertTriangle, Sparkles, Key, CheckCircle, Crosshair, Pin, MessageSquare, Send, Link as LinkIcon, Eye, EyeOff, Layers, UserCheck } from 'lucide-react';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';
import CyberButton from '../components/common/CyberButton';
import SuspectCard from '../components/mystery/SuspectCard';
import ClueCard from '../components/mystery/ClueCard';
import HintTerminal from '../components/mystery/HintTerminal';
import EmptyState from '../components/common/EmptyState';
import ErrorBanner from '../components/common/ErrorBanner';
import casesApi from '../api/casesApi';
import { discoverMockClue, useMockHint, getActiveMockCase } from '../utils/mockCase';

export default function InvestigationRoom({ activeCase, onCaseUpdated }) {
  const navigate = useNavigate();
  const { caseId: paramCaseId, id: paramId } = useParams();
  const currentCaseId = activeCase?.id || paramCaseId || paramId;

  const [activeTab, setActiveTab] = useState('board'); // 'board', 'files', 'suspects', 'hints'
  const [decryptingId, setDecryptingId] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Murder Board States inspired by Cyber Noir Detective UI
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [showNeuralStrings, setShowNeuralStrings] = useState(true);
  const [filterNoise, setFilterNoise] = useState(false);
  const [activeInterrogationSuspect, setActiveInterrogationSuspect] = useState(null);
  const [interrogationInput, setInterrogationInput] = useState('');
  const [interrogationLogs, setInterrogationLogs] = useState({});
  const [interrogating, setInterrogating] = useState(false);
  const [interrogationCategory, setInterrogationCategory] = useState('general');
  const [interrogationError, setInterrogationError] = useState(null);
  const [selectedAccusedId, setSelectedAccusedId] = useState('');
  const [initialLoading, setInitialLoading] = useState(!activeCase && Boolean(currentCaseId));

  // Initialize first suspect as default pinned or interrogated
  useEffect(() => {
    if (activeCase?.suspects?.length > 0 && pinnedIds.size === 0) {
      const initialPinned = new Set([
        activeCase.suspects[0].id,
        ...(activeCase.clues?.[0] ? [activeCase.clues[0].id] : [])
      ]);
      setPinnedIds(initialPinned);
      setActiveInterrogationSuspect(activeCase.suspects[0]);
    }
  }, [activeCase]);

  // Sync saved interrogation transcript from activeCase
  useEffect(() => {
    if (activeCase?.interrogations?.length > 0) {
      const mappedLogs = {};
      for (const item of activeCase.interrogations) {
        if (!mappedLogs[item.suspectId]) mappedLogs[item.suspectId] = [];
        mappedLogs[item.suspectId].push({ sender: 'detective', text: item.question });
        mappedLogs[item.suspectId].push({ sender: 'suspect', text: item.answer });
      }
      setInterrogationLogs((prev) => ({ ...mappedLogs, ...prev }));
    }
  }, [activeCase?.interrogations]);

  // Load case if navigated directly by URL and activeCase is missing
  useEffect(() => {
    if (!activeCase && currentCaseId) {
      setInitialLoading(true);
      casesApi.getCase(currentCaseId)
        .then((fetched) => {
          if (onCaseUpdated) onCaseUpdated(fetched);
          setInitialLoading(false);
        })
        .catch(() => {
          const local = getActiveMockCase();
          if (local && local.id === currentCaseId && onCaseUpdated) {
            onCaseUpdated(local);
          }
          setInitialLoading(false);
        });
    }
  }, [currentCaseId, activeCase, onCaseUpdated]);

  if (initialLoading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-cyber-cyan animate-pulse">
        CALIBRATING NEURAL DETECTIVE INTERFACE // DECRYPTING CASE DATA...
      </div>
    );
  }

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

  const togglePin = (id) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Clue discovery handler
  const handleDiscoverClue = async (clueId) => {
    setActionError(null);
    setDecryptingId(clueId);

    try {
      try {
        const res = await casesApi.discoverClue(caseId, clueId);
        const updatedClues = (activeCase.clues || []).map((c) =>
          c.id === clueId ? { ...c, discovered: true, description: res.clue.description } : c
        );
        const updatedCase = {
          ...activeCase,
          clues: updatedClues,
          discoveredClueIds: Array.from(new Set([...(activeCase.discoveredClueIds || []), clueId])),
          progress: res.progress,
        };
        if (onCaseUpdated) onCaseUpdated(updatedCase);
      } catch (apiErr) {
        const updated = discoverMockClue(caseId, clueId);
        if (onCaseUpdated) onCaseUpdated(updated);
      }
      // Auto-pin newly discovered clue to the board
      setPinnedIds((prev) => new Set([...prev, clueId]));
    } catch (err) {
      setActionError(err.message || 'Failed to decrypt clue segment.');
    } finally {
      setDecryptingId(null);
    }
  };

  // Hint request handler
  const handleRequestHint = async () => {
    setActionError(null);
    setHintLoading(true);

    try {
      try {
        const res = await casesApi.requestHint(caseId);
        const updatedHints = [...(activeCase.hints || [])];
        const hintIdx = activeCase.hintsUsed || 0;
        if (updatedHints[hintIdx]) {
          updatedHints[hintIdx] = res.hint;
        } else {
          updatedHints.push(res.hint);
        }
        const updatedCase = {
          ...activeCase,
          hints: updatedHints,
          hintsUsed: res.progress?.hintsUsed ?? ((activeCase.hintsUsed || 0) + 1),
          progress: res.progress,
        };
        if (onCaseUpdated) onCaseUpdated(updatedCase);
      } catch (apiErr) {
        if (apiErr.code === 'HINT_LIMIT_REACHED' || apiErr.status === 409) {
          setActionError(apiErr.message || 'Hint limit reached for this difficulty level.');
        } else {
          const res = useMockHint(caseId);
          if (res.error) {
            setActionError(res.message || 'Cannot retrieve additional tactical hints.');
          } else if (res.updatedCase && onCaseUpdated) {
            onCaseUpdated(res.updatedCase);
          }
        }
      }
    } catch (err) {
      setActionError(err.message || 'Tactical guidance retrieval failed.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleInterrogationSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!interrogationInput.trim() || !activeInterrogationSuspect || interrogating) return;

    const query = interrogationInput.trim();
    const suspectId = activeInterrogationSuspect.id;
    const prevLogs = interrogationLogs[suspectId] || [];

    setInterrogating(true);
    setInterrogationError(null);

    // Optimistically add detective message to transcript
    setInterrogationLogs((prev) => ({
      ...prev,
      [suspectId]: [
        ...(prev[suspectId] || []),
        { sender: 'detective', text: query },
      ],
    }));
    setInterrogationInput('');

    try {
      const res = await casesApi.interrogateSuspect(caseId, suspectId, query, interrogationCategory);
      setInterrogationLogs((prev) => ({
        ...prev,
        [suspectId]: [
          ...(prev[suspectId] || []),
          { sender: 'suspect', text: res.answer },
        ],
      }));

      // Update remaining interrogation count in activeCase progress
      if (activeCase && onCaseUpdated) {
        const updatedInterrogations = [
          ...(activeCase.interrogations || []),
          {
            interactionId: res.interactionId,
            suspectId: res.suspectId,
            category: interrogationCategory,
            question: query,
            answer: res.answer,
            createdAt: new Date().toISOString(),
          },
        ];
        onCaseUpdated({
          ...activeCase,
          interrogations: updatedInterrogations,
          progress: {
            ...activeCase.progress,
            interrogationsUsed: updatedInterrogations.length,
            remainingInterrogations: res.remainingQuestions,
          },
        });
      }
    } catch (err) {
      const errMsg = err.message || 'Interrogation uplink failed.';
      setInterrogationError(errMsg);
      setInterrogationLogs((prev) => ({
        ...prev,
        [suspectId]: [
          ...(prev[suspectId] || []),
          { sender: 'suspect', text: `[TRANSMISSION INTERRUPTED: ${errMsg}]` },
        ],
      }));
    } finally {
      setInterrogating(false);
    }
  };

  const handleIssueWarrant = () => {
    if (selectedAccusedId) {
      navigate(`/accuse/${caseId}?accused=${selectedAccusedId}`);
    } else {
      navigate(`/accuse/${caseId}`);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner Toolbar */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg p-3 sm:p-4 shadow-terminal">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-cyber-muted">CASE ID:</span>
              <span className="text-cyber-cyan font-bold">#{caseId.slice(0, 10)}</span>
              <span className="text-cyber-border">|</span>
              <StatusBadge size="xs" variant={status === 'completed' ? 'green' : 'amber'}>
                {status.toUpperCase()}
              </StatusBadge>
              <StatusBadge size="xs" variant="cyan">
                {difficulty.toUpperCase()} TIER
              </StatusBadge>
            </div>
            <h1 className="text-lg sm:text-xl font-display font-bold text-cyber-text tracking-wide uppercase truncate">
              {title}
            </h1>
          </div>

          {/* Quick Metrics & Proceed Action */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-3 text-xs bg-cyber-subsurface px-3 py-1.5 rounded border border-cyber-border">
              <div>
                <span className="text-[9px] text-cyber-muted block">EVIDENCE</span>
                <span className="font-bold text-cyber-green">
                  {discoveredCluesCount}/{totalClues}
                </span>
              </div>
              <div className="border-l border-cyber-border pl-3">
                <span className="text-[9px] text-cyber-muted block">HINTS</span>
                <span className="font-bold text-cyber-amber">
                  {hintsUsed}/{maxHints}
                </span>
              </div>
            </div>

            <Link to={`/accuse/${caseId}`}>
              <CyberButton
                variant="danger"
                size="sm"
                icon={Crosshair}
                className="shadow-md shadow-cyber-red/20 text-xs"
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

      {/* Main 3-Column Murder Board Grid (Collapses on small viewports) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (3 Cols): CASE FILES & BRIEFING */}
        <div className="lg:col-span-3 space-y-4">
          <TerminalPanel
            title="CASE FILES"
            subtitle="CLASSIFIED BRIEFING"
            badge={<StatusBadge size="xs" variant="cyan">DOSSIER</StatusBadge>}
          >
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <span className="text-[10px] font-bold text-cyber-text uppercase block mb-1">
                  Incident Premise:
                </span>
                <p className="bg-cyber-subsurface p-2 rounded border border-cyber-border/60 text-cyber-text text-[11px] leading-relaxed">
                  {premise}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-cyber-text uppercase block mb-1">
                  Crime Reconstruction:
                </span>
                <p className="whitespace-pre-line leading-relaxed text-cyber-muted text-[11px] max-h-48 overflow-y-auto pr-1">
                  {story}
                </p>
              </div>
            </div>
          </TerminalPanel>

          {/* Forensic Evidence Clues List */}
          <TerminalPanel
            title={`DISCOVERED CLUES (${discoveredCluesCount}/${totalClues})`}
            subtitle="FORENSIC DECRYPTION"
            badge={
              <StatusBadge size="xs" variant={discoveredCluesCount === totalClues ? 'green' : 'cyan'}>
                {Math.round((discoveredCluesCount / totalClues) * 100)}%
              </StatusBadge>
            }
          >
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {clues.map((clue, idx) => {
                const isPinned = pinnedIds.has(clue.id);
                return (
                  <div
                    key={clue.id}
                    className={`p-2.5 rounded border text-xs transition-all ${
                      clue.discovered
                        ? 'bg-cyber-subsurface/90 border-cyber-green/40'
                        : 'bg-cyber-surface/40 border-cyber-border'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-cyber-text text-[11px] truncate">
                        {clue.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePin(clue.id)}
                        className={`p-1 rounded text-[10px] ${
                          isPinned ? 'text-cyber-cyan bg-cyber-cyan/20' : 'text-cyber-muted hover:text-cyber-text'
                        }`}
                        title={isPinned ? 'Unpin from board' : 'Pin to murder board'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    </div>

                    {clue.discovered ? (
                      <p className="text-[11px] text-cyber-muted leading-relaxed">
                        {clue.description}
                      </p>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-cyber-amber">ENCRYPTED DATA</span>
                        <CyberButton
                          variant="ghost"
                          size="xs"
                          icon={Key}
                          onClick={() => handleDiscoverClue(clue.id)}
                          disabled={decryptingId === clue.id}
                        >
                          {decryptingId === clue.id ? 'DECRYPTING...' : 'DECRYPT (+5 PTS)'}
                        </CyberButton>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TerminalPanel>

          {/* Hint Terminal */}
          <HintTerminal
            hints={hints}
            hintsUsed={hintsUsed}
            maxHints={maxHints}
            onRequestHint={handleRequestHint}
            isLoading={hintLoading}
          />
        </div>

        {/* Center Column (6 Cols): INTERACTIVE MURDER BOARD */}
        <div className="lg:col-span-6 space-y-4">
          <TerminalPanel
            title="MURDER BOARD"
            subtitle="NEURAL EVIDENCE MATRIX"
            badge={<StatusBadge size="xs" variant="magenta">ACTIVE BOARD</StatusBadge>}
            scanlines
          >
            {/* Murder Board Controls Toolbar (matching screenshot: AUTO-LINK, HIDE NOISE, CLEAR STRINGS) */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-3 border-b border-cyber-border text-xs">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNeuralStrings((prev) => !prev)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                    showNeuralStrings
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan'
                      : 'bg-cyber-surface text-cyber-muted border-cyber-border'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{showNeuralStrings ? 'STRINGS ON' : 'AUTO-LINK'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterNoise((prev) => !prev)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                    filterNoise
                      ? 'bg-cyber-magenta/20 text-cyber-magenta border-cyber-magenta'
                      : 'bg-cyber-surface text-cyber-muted border-cyber-border'
                  }`}
                >
                  {filterNoise ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{filterNoise ? 'SHOWING PINNED' : 'HIDE NOISE'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPinnedIds(new Set())}
                className="text-[10px] text-cyber-muted hover:text-cyber-red px-2 py-1 transition-colors"
              >
                CLEAR STRINGS
              </button>
            </div>

            {/* Murder Board Corkboard Area */}
            <div className="relative min-h-[360px] bg-cyber-bg/90 rounded-lg p-4 border border-cyber-border/70 overflow-hidden">
              {/* Retro corkboard grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* Neural connecting strings (SVG paths connecting pinned suspects and clues) */}
              {showNeuralStrings && pinnedIds.size > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
                  <line
                    x1="25%"
                    y1="35%"
                    x2="70%"
                    y2="28%"
                    stroke="#35F2FF"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <line
                    x1="70%"
                    y1="28%"
                    x2="50%"
                    y2="75%"
                    stroke="#FF3DF2"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <line
                    x1="25%"
                    y1="35%"
                    x2="50%"
                    y2="75%"
                    stroke="#A3FF12"
                    strokeWidth="1.5"
                  />
                </svg>
              )}

              {/* Pinned Suspects & Evidence Cards in Corkboard style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-20">
                {suspects.slice(0, 4).map((suspect, idx) => {
                  const isPinned = pinnedIds.has(suspect.id);
                  if (filterNoise && !isPinned) return null;

                  return (
                    <div
                      key={suspect.id}
                      onClick={() => setActiveInterrogationSuspect(suspect)}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                        activeInterrogationSuspect?.id === suspect.id
                          ? 'bg-cyber-surface border-cyber-cyan shadow-neon-cyan scale-[1.02]'
                          : 'bg-cyber-surface/75 border-cyber-border hover:border-cyber-cyan/50'
                      }`}
                    >
                      {/* Red / Cyan Pin Indicator */}
                      <div className="absolute -top-1.5 left-4 w-3 h-3 rounded-full bg-cyber-red border border-white shadow-sm flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-white" />
                      </div>

                      <div className="flex items-start justify-between gap-2 pt-1">
                        <div>
                          <span className="text-[10px] text-cyber-cyan uppercase font-bold block">
                            SUSPECT #{idx + 1}
                          </span>
                          <h4 className="font-bold text-cyber-text text-xs">{suspect.name}</h4>
                          <span className="text-[10px] text-cyber-muted block">{suspect.role}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(suspect.id);
                          }}
                          className={`p-1 rounded text-[10px] ${
                            isPinned ? 'text-cyber-cyan bg-cyber-cyan/20' : 'text-cyber-muted'
                          }`}
                          title="Pin/unpin suspect"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="mt-2 text-[10px] text-cyber-muted line-clamp-2">
                        <span className="text-cyber-amber font-bold">ALIBI: </span>
                        {suspect.alibi}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-cyber-border/60 flex items-center justify-between text-[9px]">
                        <span className="text-cyber-cyan">INTERROGATE →</span>
                        {isPinned && <span className="text-cyber-green font-bold">PINNED</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interrogation Terminal Floating Dialog */}
              {activeInterrogationSuspect && (
                <div className="mt-4 p-3 rounded-lg bg-cyber-subsurface border border-cyber-cyan/70 shadow-lg relative z-20 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-cyber-border mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded bg-cyber-cyan/20 border border-cyber-cyan flex items-center justify-center text-cyber-cyan text-[10px]">
                        #
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-cyber-text text-xs">
                            {activeInterrogationSuspect.name}
                          </span>
                          <span className="text-[10px] text-cyber-cyan">({activeInterrogationSuspect.role})</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[9px]">
                          <span className="text-cyber-green">CHANNEL SECURED</span>
                          <span className="text-cyber-border">|</span>
                          <span className="text-cyber-amber font-bold">
                            REMAINING QUESTIONS: {activeCase?.progress?.remainingInterrogations ?? 8}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveInterrogationSuspect(null)}
                      className="text-cyber-muted hover:text-cyber-cyan text-xs"
                    >
                      ×
                    </button>
                  </div>

                  {interrogationError && (
                    <div className="mb-2 p-1.5 bg-cyber-red/10 border border-cyber-red/50 rounded text-cyber-red text-[10px]">
                      {interrogationError}
                    </div>
                  )}

                  {/* Suggested Category Chips */}
                  <div className="flex items-center space-x-1 mb-2 overflow-x-auto pb-1 text-[9px]">
                    {[
                      { id: 'alibi', label: 'ALIBI / TIMELINE', prompt: 'Where exactly were you at the time of the incident?' },
                      { id: 'motive', label: 'MOTIVE / CONFLICT', prompt: 'What motive or conflict did you have regarding this facility?' },
                      { id: 'clue', label: 'FORENSIC EVIDENCE', prompt: 'What do you know about the discovered physical evidence?' },
                      { id: 'general', label: 'DIRECT QUESTION', prompt: '' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setInterrogationCategory(cat.id);
                          if (cat.prompt && !interrogationInput) {
                            setInterrogationInput(cat.prompt);
                          }
                        }}
                        className={`px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                          interrogationCategory === cat.id
                            ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan'
                            : 'bg-cyber-bg text-cyber-muted border-cyber-border/70 hover:border-cyber-cyan/50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Transcript History */}
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-[11px] mb-3">
                    <div className="bg-cyber-surface p-2 rounded border border-cyber-border/70 text-cyber-text">
                      <span className="text-cyber-cyan font-bold block text-[10px]">
                        {activeInterrogationSuspect.name}:
                      </span>
                      Detective, you requested my testimony. What do you want to inquire about?
                    </div>

                    <div className="bg-cyber-surface p-2 rounded border border-cyber-border/70 text-cyber-muted">
                      <span className="text-cyber-amber font-bold block text-[10px]">
                        STATED MOTIVE / PROFILE:
                      </span>
                      {activeInterrogationSuspect.motive || 'No explicit motive confirmed.'}
                    </div>

                    {(interrogationLogs[activeInterrogationSuspect.id] || []).map((entry, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border ${
                          entry.sender === 'detective'
                            ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-cyber-cyan ml-4'
                            : 'bg-cyber-surface border-cyber-border text-cyber-text'
                        }`}
                      >
                        {entry.text}
                      </div>
                    ))}
                    {interrogating && (
                      <div className="p-2 rounded bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan text-[10px] animate-pulse">
                        TRANSMITTING NEURAL INTERROGATION QUERY...
                      </div>
                    )}
                  </div>

                  {/* Interrogation Query Input */}
                  {(activeCase?.progress?.remainingInterrogations ?? 8) <= 0 ? (
                    <div className="p-2 bg-cyber-bg border border-cyber-border text-cyber-muted text-center rounded text-[10px]">
                      INTERROGATION BUDGET EXHAUSTED FOR THIS CASE
                    </div>
                  ) : (
                    <form onSubmit={handleInterrogationSubmit} className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={300}
                        value={interrogationInput}
                        onChange={(e) => setInterrogationInput(e.target.value)}
                        placeholder="Type interrogation query (max 300 chars)..."
                        disabled={interrogating}
                        className="flex-1 bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan font-mono disabled:opacity-50"
                      />
                      <CyberButton
                        variant="primary"
                        size="xs"
                        icon={Send}
                        type="submit"
                        disabled={interrogating || !interrogationInput.trim()}
                      >
                        {interrogating ? 'QUERYING...' : 'SEND'}
                      </CyberButton>
                    </form>
                  )}
                </div>
              )}
            </div>
          </TerminalPanel>
        </div>

        {/* Right Column (3 Cols): SUSPECTS DOSSIER & FINAL VERDICT */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyber-cyan">
              SUSPECTS ({suspects.length})
            </h2>
            <span className="text-[10px] text-cyber-muted">VERIFY ALIBIS</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                selected={activeInterrogationSuspect?.id === suspect.id}
                onSelect={(s) => {
                  setSelectedAccusedId(s.id);
                  setActiveInterrogationSuspect(s);
                }}
                onInterrogate={(s) => {
                  setActiveInterrogationSuspect(s);
                }}
              />
            ))}
          </div>

          {/* FINAL VERDICT PANEL (matching bottom right of screenshot) */}
          <TerminalPanel
            title="FINAL VERDICT"
            subtitle="ISSUE ACCUSATION WARRANT"
            badge={<StatusBadge size="xs" variant="red">CRITICAL</StatusBadge>}
          >
            <div className="space-y-3 text-xs">
              <label className="text-[10px] text-cyber-muted uppercase block">
                Designate Primary Suspect:
              </label>

              <select
                value={selectedAccusedId}
                onChange={(e) => setSelectedAccusedId(e.target.value)}
                className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-xs text-cyber-text focus:outline-none focus:border-cyber-red font-mono"
              >
                <option value="">Select Accused...</option>
                {suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>

              <CyberButton
                variant="danger"
                size="md"
                icon={Crosshair}
                onClick={handleIssueWarrant}
                className="w-full shadow-lg shadow-cyber-red/30"
              >
                ISSUE WARRANT
              </CyberButton>

              <p className="text-[10px] text-cyber-muted leading-tight">
                Accusation triggers authoritative backend verification. Case locks permanently upon submission.
              </p>
            </div>
          </TerminalPanel>
        </div>
      </div>
    </div>
  );
}
