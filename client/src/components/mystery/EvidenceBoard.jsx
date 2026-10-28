import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Unlink,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  FileText,
  User,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Filter,
  CheckCircle,
  Pin,
  Layers,
  Table,
  Cpu,
  Info
} from 'lucide-react';
import TerminalPanel from '../common/TerminalPanel';
import StatusBadge from '../common/StatusBadge';
import CyberButton from '../common/CyberButton';
import casesApi from '../../api/casesApi';

export const RELATIONSHIP_LABELS = [
  { id: 'contradicts statement', label: 'CONTRADICTS ALIBI', color: '#FF4D6D', badgeVariant: 'red' },
  { id: 'supports alibi', label: 'SUPPORTS ALIBI', color: '#A3FF12', badgeVariant: 'green' },
  { id: 'possible motive', label: 'POSSIBLE MOTIVE', color: '#FFC857', badgeVariant: 'amber' },
  { id: 'suspicious link', label: 'SUSPICIOUS LINK', color: '#FF3DF2', badgeVariant: 'magenta' },
  { id: 'unverified', label: 'UNVERIFIED LINK', color: '#35F2FF', badgeVariant: 'cyan' },
];

export default function EvidenceBoard({
  caseId,
  suspects = [],
  clues = [],
  initialBoard = null,
  onBoardSaved,
  onSelectSuspect,
}) {
  const discoveredClues = clues.filter((c) => c.discovered);

  // Board View Mode: 'canvas' (Visual Neural Matrix) or 'list' (Accessible List / Table)
  const [viewMode, setViewMode] = useState('canvas');

  // Board state: nodes and edges
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Connection Builder State
  const [selectedClueId, setSelectedClueId] = useState('');
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [selectedRelation, setSelectedRelation] = useState('contradicts statement');
  const [connectionNote, setConnectionNote] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Filtering
  const [suspectFilter, setSuspectFilter] = useState('all');
  const [relationFilter, setRelationFilter] = useState('all');
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

  // Sync initial board
  useEffect(() => {
    if (initialBoard) {
      if (initialBoard.nodes) setNodes(initialBoard.nodes);
      if (initialBoard.edges) setEdges(initialBoard.edges);
    }
  }, [initialBoard]);

  // Escape key handler for connection modal
  useEffect(() => {
    if (!showConnectModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowConnectModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConnectModal]);

  // Persist board to server
  const persistBoard = async (newNodes, newEdges) => {
    if (!caseId) return;
    setIsSaving(true);
    try {
      await casesApi.saveBoard(caseId, { nodes: newNodes, edges: newEdges });
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus(null), 2500);
      if (onBoardSaved) onBoardSaved({ nodes: newNodes, edges: newEdges });
    } catch (err) {
      setSaveStatus('SAVE FAILED');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new connection / theory
  const handleAddConnection = (e) => {
    if (e) e.preventDefault();
    if (!selectedClueId || !selectedSuspectId) return;

    // Check if duplicate connection exists
    const existing = edges.find(
      (edge) => edge.source === selectedClueId && edge.target === selectedSuspectId
    );
    if (existing) {
      // Update label / note
      const updatedEdges = edges.map((edge) =>
        edge.id === existing.id
          ? { ...edge, label: selectedRelation, note: connectionNote.trim() }
          : edge
      );
      setEdges(updatedEdges);
      persistBoard(nodes, updatedEdges);
    } else {
      const newEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        source: selectedClueId,
        target: selectedSuspectId,
        label: selectedRelation,
        note: connectionNote.trim(),
        createdAt: new Date().toISOString(),
      };

      // Ensure both source and target are in nodes
      const newNodes = [...nodes];
      if (!newNodes.some((n) => n.id === selectedClueId)) {
        newNodes.push({ id: selectedClueId, type: 'clue', note: '', isMarked: true });
      }
      if (!newNodes.some((n) => n.id === selectedSuspectId)) {
        newNodes.push({ id: selectedSuspectId, type: 'suspect', note: '', isMarked: true });
      }

      const updatedEdges = [...edges, newEdge];
      setNodes(newNodes);
      setEdges(updatedEdges);
      persistBoard(newNodes, updatedEdges);
    }

    setConnectionNote('');
    setShowConnectModal(false);
  };

  // Remove a connection
  const handleRemoveConnection = (edgeId) => {
    const updatedEdges = edges.filter((e) => e.id !== edgeId);
    setEdges(updatedEdges);
    persistBoard(nodes, updatedEdges);
  };

  // Filtered connections
  const filteredEdges = edges.filter((edge) => {
    if (suspectFilter !== 'all' && edge.target !== suspectFilter) return false;
    if (relationFilter !== 'all' && edge.label !== relationFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Board Header & Disclaimer Banner */}
      <div className="bg-cyber-surface/90 border border-cyber-border rounded-lg p-3 sm:p-4 shadow-terminal">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyber-border">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-cyber-cyan font-bold tracking-wider uppercase text-sm">
                NEURAL EVIDENCE BOARD
              </span>
              <StatusBadge size="xs" variant="magenta">
                REASONING MATRIX
              </StatusBadge>
              {saveStatus && (
                <span className="text-[10px] text-cyber-green animate-pulse">
                  [{saveStatus}]
                </span>
              )}
            </div>
            <p className="text-[11px] text-cyber-muted">
              Map and cross-reference discovered evidence against suspects.
            </p>
          </div>

          {/* View Toggles & Add Theory Button */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-cyber-bg border border-cyber-border rounded p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('canvas')}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                  viewMode === 'canvas'
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50'
                    : 'text-cyber-muted hover:text-cyber-text'
                }`}
                title="Visual Canvas Mode"
              >
                <Cpu className="w-3 h-3" />
                <span className="hidden sm:inline">MATRIX</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                  viewMode === 'list'
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50'
                    : 'text-cyber-muted hover:text-cyber-text'
                }`}
                title="Accessible List Mode"
              >
                <Table className="w-3 h-3" />
                <span className="hidden sm:inline">ACCESSIBLE LIST</span>
              </button>
            </div>

            <CyberButton
              variant="primary"
              size="xs"
              icon={Plus}
              onClick={() => {
                if (discoveredClues.length > 0 && !selectedClueId) {
                  setSelectedClueId(discoveredClues[0].id);
                }
                if (suspects.length > 0 && !selectedSuspectId) {
                  setSelectedSuspectId(suspects[0].id);
                }
                setShowConnectModal(true);
              }}
              disabled={discoveredClues.length === 0}
            >
              NEW THEORY
            </CyberButton>
          </div>
        </div>

        {/* FACT VS THEORY BOUNDARY NOTICE */}
        <div className="mt-2.5 p-2 rounded bg-cyber-cyan/5 border border-cyber-cyan/30 flex items-start space-x-2 text-[10px]">
          <Info className="w-3.5 h-3.5 text-cyber-cyan shrink-0 mt-0.5" />
          <div className="text-cyber-muted leading-relaxed">
            <span className="text-cyber-cyan font-bold">FACT vs THEORY PROTOCOL: </span>
            Forensic cards marked <span className="text-cyber-green font-bold">[ESTABLISHED FACT]</span> reflect verified telemetry.
            Connections marked <span className="text-cyber-amber font-bold">[PLAYER THEORY]</span> are your working hypotheses and do not alter canonical case verification or score.
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <div className="flex items-center space-x-1">
              <Filter className="w-3 h-3 text-cyber-muted" />
              <span className="text-cyber-muted text-[10px]">SUSPECT:</span>
              <select
                value={suspectFilter}
                onChange={(e) => setSuspectFilter(e.target.value)}
                className="bg-cyber-bg border border-cyber-border rounded px-2 py-0.5 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
              >
                <option value="all">All Suspects</option>
                {suspects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1">
              <span className="text-cyber-muted text-[10px]">RELATION:</span>
              <select
                value={relationFilter}
                onChange={(e) => setRelationFilter(e.target.value)}
                className="bg-cyber-bg border border-cyber-border rounded px-2 py-0.5 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
              >
                <option value="all">All Theories</option>
                {RELATIONSHIP_LABELS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[10px] text-cyber-muted">
            DISCOVERED EVIDENCE: <span className="text-cyber-green font-bold">{discoveredClues.length}</span> / {clues.length} | THEORIES MAPPED: <span className="text-cyber-magenta font-bold">{edges.length}</span>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-theory-title"
          className="p-3 bg-cyber-subsurface border border-cyber-cyan rounded-lg shadow-lg relative z-30"
        >
          <div className="flex items-center justify-between pb-2 border-b border-cyber-border mb-3">
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-cyber-cyan" />
              <span id="modal-theory-title" className="font-bold text-cyber-text text-xs uppercase">
                FORMULATE INVESTIGATIVE THEORY
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowConnectModal(false)}
              aria-label="Close theory modal"
              className="text-cyber-muted hover:text-cyber-red text-sm"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddConnection} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Clue */}
              <div>
                <label className="block text-[10px] text-cyber-muted uppercase mb-1">
                  Discovered Forensic Evidence:
                </label>
                <select
                  value={selectedClueId}
                  onChange={(e) => setSelectedClueId(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-2 py-1.5 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
                >
                  {discoveredClues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Suspect */}
              <div>
                <label className="block text-[10px] text-cyber-muted uppercase mb-1">
                  Target Suspect:
                </label>
                <select
                  value={selectedSuspectId}
                  onChange={(e) => setSelectedSuspectId(e.target.value)}
                  className="w-full bg-cyber-bg border border-cyber-border rounded px-2 py-1.5 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
                >
                  {suspects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Relationship Label */}
            <div>
              <label className="block text-[10px] text-cyber-muted uppercase mb-1">
                Theory / Connection Classification:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {RELATIONSHIP_LABELS.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => setSelectedRelation(rel.id)}
                    className={`p-1.5 rounded border text-left text-[10px] font-bold transition-all ${
                      selectedRelation === rel.id
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan shadow-sm'
                        : 'border-cyber-border bg-cyber-bg text-cyber-muted hover:border-cyber-border/80'
                    }`}
                  >
                    {rel.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Theory Notes */}
            <div>
              <label className="block text-[10px] text-cyber-muted uppercase mb-1">
                Detective's Theory Notes (Optional):
              </label>
              <input
                type="text"
                maxLength={300}
                value={connectionNote}
                onChange={(e) => setConnectionNote(e.target.value)}
                placeholder="e.g., Timeline contradicts suspect's claimed lounge presence..."
                className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-1.5 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-cyber-border/70">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="px-3 py-1 rounded text-cyber-muted hover:text-cyber-text text-xs"
              >
                CANCEL
              </button>
              <CyberButton variant="primary" size="xs" type="submit">
                LINK HYPOTHESIS
              </CyberButton>
            </div>
          </form>
        </div>
      )}

      {/* EMPTY STATE: When zero clues are discovered */}
      {discoveredClues.length === 0 ? (
        <div className="p-8 text-center bg-cyber-surface/60 border border-cyber-border border-dashed rounded-lg">
          <HelpCircle className="w-8 h-8 text-cyber-amber mx-auto mb-2 opacity-80" />
          <h3 className="text-cyber-text font-bold text-xs uppercase tracking-wider mb-1">
            EVIDENCE MATRIX OFFLINE // NO DISCOVERED CLUES
          </h3>
          <p className="text-[11px] text-cyber-muted max-w-md mx-auto mb-4">
            The neural evidence board requires decrypted physical or digital evidence before links can be constructed.
            Decrypt evidence files in the left terminal panel to initialize reasoning matrices.
          </p>
        </div>
      ) : viewMode === 'canvas' ? (
        /* VISUAL MATRIX VIEW */
        <div className="space-y-4">
          <div className="relative min-h-[420px] bg-cyber-bg/95 rounded-lg p-4 border border-cyber-border/80 overflow-hidden shadow-inner">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            {/* Visual Theory Connecting Lines between Clues and Suspects */}
            {filteredEdges.length > 0 && (
              <div className="mb-4 p-2 bg-cyber-surface/70 border border-cyber-border/60 rounded flex flex-wrap gap-2 items-center text-[10px]">
                <span className="text-cyber-muted uppercase font-bold text-[9px]">ACTIVE THEORIES:</span>
                {filteredEdges.map((edge) => {
                  const rel = RELATIONSHIP_LABELS.find((r) => r.id === edge.label) || RELATIONSHIP_LABELS[4];
                  const clue = clues.find((c) => c.id === edge.source);
                  const suspect = suspects.find((s) => s.id === edge.target);

                  return (
                    <div
                      key={edge.id}
                      className="flex items-center space-x-1.5 px-2 py-1 rounded border bg-cyber-bg/80"
                      style={{ borderColor: rel.color }}
                    >
                      <span className="text-cyber-text font-bold">{clue?.title || edge.source}</span>
                      <span className="text-cyber-muted">→</span>
                      <span className="font-bold uppercase" style={{ color: rel.color }}>
                        [{rel.label}]
                      </span>
                      <span className="text-cyber-muted">→</span>
                      <span className="text-cyber-cyan font-bold">{suspect?.name || edge.target}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveConnection(edge.id)}
                        className="text-cyber-muted hover:text-cyber-red ml-1 font-bold"
                        title="Remove theory link"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Split Board: Discovered Clues on Left, Suspect Nodes on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-20">
              {/* Left Column: Discovered Forensic Clues */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-cyber-border/70">
                  <span className="text-cyber-green font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>FORENSIC RECORDS ({discoveredClues.length})</span>
                  </span>
                  <span className="text-[9px] text-cyber-green font-bold bg-cyber-green/10 px-1.5 py-0.5 rounded border border-cyber-green/30">
                    ESTABLISHED FACTS
                  </span>
                </div>

                {discoveredClues.map((clue) => {
                  const linkedEdges = edges.filter((e) => e.source === clue.id);
                  const isSelected = selectedNodeDetails?.id === clue.id;

                  return (
                    <div
                      key={clue.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Evidence clue: ${clue.title}. Established fact.`}
                      onClick={() => setSelectedNodeDetails(clue)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedNodeDetails(clue);
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyber-green ${
                        isSelected
                          ? 'bg-cyber-surface border-cyber-green shadow-neon-cyan'
                          : 'bg-cyber-surface/80 border-cyber-border hover:border-cyber-green/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-cyber-text text-xs">
                          {clue.title}
                        </span>
                        <StatusBadge size="xs" variant="green">FACT</StatusBadge>
                      </div>
                      <p className="text-[11px] text-cyber-muted leading-relaxed line-clamp-2">
                        {clue.description}
                      </p>

                      {/* Display connected theories badges */}
                      {linkedEdges.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-cyber-border/40 flex flex-wrap gap-1">
                          {linkedEdges.map((e) => {
                            const rel = RELATIONSHIP_LABELS.find((r) => r.id === e.label) || RELATIONSHIP_LABELS[4];
                            const s = suspects.find((sub) => sub.id === e.target);
                            return (
                              <span
                                key={e.id}
                                className="text-[9px] px-1.5 py-0.5 rounded border bg-cyber-bg font-bold"
                                style={{ borderColor: rel.color, color: rel.color }}
                              >
                                {rel.label} → {s ? s.name : e.target}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Suspect Dossiers */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-cyber-border/70">
                  <span className="text-cyber-cyan font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>SUSPECT DOSSIERS ({suspects.length})</span>
                  </span>
                  <span className="text-[9px] text-cyber-cyan font-bold bg-cyber-cyan/10 px-1.5 py-0.5 rounded border border-cyber-cyan/30">
                    PERSONS OF INTEREST
                  </span>
                </div>

                {suspects.map((suspect) => {
                  const linkedEdges = edges.filter((e) => e.target === suspect.id);
                  const isSelected = selectedNodeDetails?.id === suspect.id;

                  return (
                    <div
                      key={suspect.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Suspect dossier: ${suspect.name}, role: ${suspect.role}`}
                      onClick={() => {
                        setSelectedNodeDetails(suspect);
                        if (onSelectSuspect) onSelectSuspect(suspect);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedNodeDetails(suspect);
                          if (onSelectSuspect) onSelectSuspect(suspect);
                        }
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyber-cyan ${
                        isSelected
                          ? 'bg-cyber-surface border-cyber-cyan shadow-neon-cyan'
                          : 'bg-cyber-surface/80 border-cyber-border hover:border-cyber-cyan/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div>
                          <h4 className="font-bold text-cyber-text text-xs">{suspect.name}</h4>
                          <span className="text-[10px] text-cyber-cyan">{suspect.role}</span>
                        </div>
                        <StatusBadge size="xs" variant="cyan">DOSSIER</StatusBadge>
                      </div>

                      <div className="text-[10px] text-cyber-muted line-clamp-2 mt-1">
                        <span className="text-cyber-amber font-semibold">ALIBI: </span>
                        {suspect.alibi}
                      </div>

                      {/* Display connected theories badges */}
                      {linkedEdges.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-cyber-border/40 flex flex-wrap gap-1">
                          {linkedEdges.map((e) => {
                            const rel = RELATIONSHIP_LABELS.find((r) => r.id === e.label) || RELATIONSHIP_LABELS[4];
                            const c = clues.find((cl) => cl.id === e.source);
                            return (
                              <span
                                key={e.id}
                                className="text-[9px] px-1.5 py-0.5 rounded border bg-cyber-bg font-bold"
                                style={{ borderColor: rel.color, color: rel.color }}
                              >
                                {c ? c.title : e.source} [{rel.label}]
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Empty theories notice if zero edges exist */}
            {edges.length === 0 && (
              <div className="mt-6 p-4 text-center bg-cyber-surface/40 border border-cyber-border border-dashed rounded text-cyber-muted text-xs">
                <span>Zero hypothesis connections mapped yet. Click </span>
                <span className="text-cyber-cyan font-bold">"NEW THEORY"</span>
                <span> above to link a forensic fact to a suspect.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ACCESSIBLE DOSSIER LIST / TABLE VIEW (SPEC.md Section 17.4 BoardListFallback) */
        <div className="space-y-4">
          {/* Established Evidence Table */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="p-3 bg-cyber-subsurface border-b border-cyber-border flex items-center justify-between">
              <span className="font-bold text-cyber-green text-xs uppercase flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>CANONICAL ESTABLISHED EVIDENCE</span>
              </span>
              <span className="text-[9px] text-cyber-green font-bold bg-cyber-green/10 border border-cyber-green px-2 py-0.5 rounded">
                VERIFIED FACTS
              </span>
            </div>

            <div className="divide-y divide-cyber-border/60">
              {discoveredClues.map((clue) => (
                <div key={clue.id} className="p-3 hover:bg-cyber-bg/40 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-cyber-text text-xs">{clue.title}</span>
                    <span className="text-[10px] text-cyber-green font-mono">FORENSIC CLUE #{clue.id}</span>
                  </div>
                  <p className="text-cyber-muted text-[11px] leading-relaxed">
                    {clue.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Player Formulated Theories Table */}
          <div className="bg-cyber-surface border border-cyber-border rounded-lg overflow-hidden">
            <div className="p-3 bg-cyber-subsurface border-b border-cyber-border flex items-center justify-between">
              <span className="font-bold text-cyber-amber text-xs uppercase flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>PLAYER FORMULATED THEORIES & CONNECTIONS</span>
              </span>
              <span className="text-[9px] text-cyber-amber font-bold bg-cyber-amber/10 border border-cyber-amber px-2 py-0.5 rounded">
                UNVERIFIED HYPOTHESES
              </span>
            </div>

            {filteredEdges.length === 0 ? (
              <div className="p-6 text-center text-cyber-muted text-xs">
                No active theories matching selected filters. Use "NEW THEORY" above to establish deductive links.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-cyber-border bg-cyber-bg text-[10px] text-cyber-muted uppercase">
                      <th className="p-2.5">Forensic Clue</th>
                      <th className="p-2.5">Connection Hypothesis</th>
                      <th className="p-2.5">Target Suspect</th>
                      <th className="p-2.5">Notes</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyber-border/60 font-mono">
                    {filteredEdges.map((edge) => {
                      const rel = RELATIONSHIP_LABELS.find((r) => r.id === edge.label) || RELATIONSHIP_LABELS[4];
                      const clue = clues.find((c) => c.id === edge.source);
                      const suspect = suspects.find((s) => s.id === edge.target);

                      return (
                        <tr key={edge.id} className="hover:bg-cyber-bg/30 transition-colors">
                          <td className="p-2.5 font-bold text-cyber-text">
                            {clue ? clue.title : edge.source}
                          </td>
                          <td className="p-2.5">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold border"
                              style={{ borderColor: rel.color, color: rel.color, backgroundColor: `${rel.color}15` }}
                            >
                              {rel.label}
                            </span>
                          </td>
                          <td className="p-2.5 font-bold text-cyber-cyan">
                            {suspect ? suspect.name : edge.target}
                          </td>
                          <td className="p-2.5 text-cyber-muted text-[11px]">
                            {edge.note || '—'}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveConnection(edge.id)}
                              className="px-2 py-1 rounded bg-cyber-red/10 border border-cyber-red text-cyber-red hover:bg-cyber-red/20 text-[10px] font-bold transition-colors"
                            >
                              REMOVE
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
