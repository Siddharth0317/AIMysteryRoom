import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  X,
  Send,
  ShieldCheck,
  AlertCircle,
  Clock,
  User,
  Cpu,
  Sparkles,
  CornerDownLeft
} from 'lucide-react';
import CyberButton from '../common/CyberButton';
import StatusBadge from '../common/StatusBadge';

export default function InterrogationModal({
  isOpen,
  onClose,
  suspect,
  transcript = [],
  onSendMessage,
  isSending = false,
  remainingQuestions = 8,
  error = null,
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const inputRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Focus input and reset query on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, suspect?.id]);

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSending, onClose]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (isOpen && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, transcript, isSending]);

  if (!isOpen || !suspect) return null;

  const CATEGORY_PROMPTS = [
    {
      id: 'alibi',
      label: 'ALIBI & TIMELINE',
      prompt: 'Where were you during the incident? Can anyone confirm your whereabouts?',
    },
    {
      id: 'motive',
      label: 'MOTIVE & CONFLICT',
      prompt: 'What was your relationship with the victim or facility? What did you stand to gain?',
    },
    {
      id: 'clue',
      label: 'FORENSIC EVIDENCE',
      prompt: 'What do you know about the discovered physical evidence and biometric anomalies?',
    },
    {
      id: 'general',
      label: 'DIRECT INQUIRY',
      prompt: '',
    },
  ];

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat.id);
    if (cat.prompt) {
      setInputQuery(cat.prompt);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isSending || remainingQuestions <= 0) return;

    if (onSendMessage) {
      onSendMessage(suspect.id, query, selectedCategory);
    }
    setInputQuery('');
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="interrogation-chamber-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-cyber-bg/90 backdrop-blur-md animate-fade-in font-mono overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-cyber-surface border border-cyber-cyan/70 rounded-lg shadow-2xl shadow-cyber-cyan/30 overflow-hidden text-xs max-h-[85vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-cyber-subsurface border-b border-cyber-border shrink-0">
          <div className="flex items-center space-x-2.5 text-cyber-cyan min-w-0">
            <div className="w-7 h-7 rounded bg-cyber-cyan/20 border border-cyber-cyan flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-cyber-cyan" />
            </div>
            <div className="truncate">
              <h2
                id="interrogation-chamber-title"
                className="font-display font-bold tracking-wider text-sm uppercase text-cyber-text truncate"
              >
                INTERROGATION ROOM // {suspect.name}
              </h2>
              <div className="flex items-center space-x-2 text-[10px] text-cyber-muted -mt-0.5">
                <span className="text-cyber-cyan font-bold">{suspect.role}</span>
                <span>•</span>
                <span className="text-cyber-green">CHANNEL ENCRYPTED</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <StatusBadge
              size="xs"
              variant={remainingQuestions <= 2 ? 'red' : remainingQuestions <= 4 ? 'amber' : 'green'}
            >
              {remainingQuestions} QUESTIONS LEFT
            </StatusBadge>
            <button
              type="button"
              onClick={onClose}
              aria-label="Quit interrogation chamber"
              className="flex items-center space-x-1 px-2 py-1 rounded text-cyber-muted hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-colors border border-transparent hover:border-cyber-cyan/40"
            >
              <X className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden xs:inline">QUIT</span>
            </button>
          </div>
        </div>

        {/* Suspect Dossier Snapshot Bar (Sticky under header) */}
        <div className="bg-cyber-subsurface/90 border-b border-cyber-border px-4 py-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] shrink-0">
          <div className="flex items-start space-x-2 bg-cyber-surface/60 p-2 rounded border border-cyber-border/50">
            <Clock className="w-3.5 h-3.5 text-cyber-cyan shrink-0 mt-0.5" />
            <div className="max-h-16 overflow-y-auto pr-1 flex-1">
              <span className="font-bold text-cyber-cyan uppercase text-[10px] block">
                STATED ALIBI:
              </span>
              <span className="text-cyber-muted leading-relaxed">{suspect.alibi || 'No verified alibi on record.'}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2 bg-cyber-surface/60 p-2 rounded border border-cyber-border/50">
            <AlertCircle className="w-3.5 h-3.5 text-cyber-amber shrink-0 mt-0.5" />
            <div className="max-h-16 overflow-y-auto pr-1 flex-1">
              <span className="font-bold text-cyber-amber uppercase text-[10px] block">
                POTENTIAL MOTIVE:
              </span>
              <span className="text-cyber-muted leading-relaxed">{suspect.motive || 'No overt motive detected.'}</span>
            </div>
          </div>
        </div>

        {/* Quick Tactical Category Chips */}
        <div className="px-4 py-2 bg-cyber-subsurface/40 border-b border-cyber-border/60 flex items-center space-x-1.5 overflow-x-auto shrink-0 text-[10px]">
          <span className="text-[9px] text-cyber-muted uppercase tracking-wider font-bold shrink-0">
            RAPID QUERY:
          </span>
          {CATEGORY_PROMPTS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat)}
              className={`px-2.5 py-1 rounded border whitespace-nowrap transition-all font-bold ${
                selectedCategory === cat.id
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan shadow-sm shadow-cyber-cyan/20'
                  : 'bg-cyber-bg text-cyber-muted border-cyber-border hover:border-cyber-cyan/50 hover:text-cyber-text'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-3 p-2 bg-cyber-red/10 border border-cyber-red/50 rounded text-cyber-red text-xs flex items-center justify-between shrink-0">
            <span>{error}</span>
          </div>
        )}

        {/* Live Conversation Transcript (Scrollable) */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          {/* Initial Greeting */}
          <div className="p-3 rounded-lg bg-cyber-subsurface border border-cyber-border/70 text-cyber-text space-y-1">
            <div className="flex items-center space-x-2 text-[10px] text-cyber-cyan font-bold">
              <User className="w-3.5 h-3.5" />
              <span>{suspect.name} ({suspect.role}):</span>
            </div>
            <p className="text-xs leading-relaxed text-cyber-text/90">
              Detective, you brought me into custody for questioning. Ask what you need, but I have nothing to hide.
            </p>
          </div>

          {/* Transcript History */}
          {transcript.map((entry, idx) => {
            const isDetective = entry.sender === 'detective';
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs leading-relaxed transition-all ${
                  isDetective
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/50 text-cyber-cyan ml-6 sm:ml-12 shadow-sm'
                    : 'bg-cyber-subsurface border-cyber-border text-cyber-text mr-6 sm:mr-12'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase ${
                    isDetective ? 'text-cyber-cyan' : 'text-cyber-green'
                  }`}>
                    {isDetective ? 'DETECTIVE OPERATIVE' : suspect.name}
                  </span>
                  <span className="text-[9px] text-cyber-muted font-mono">
                    {entry.time || `ENTRY #${idx + 1}`}
                  </span>
                </div>
                <p className="whitespace-pre-line text-cyber-text">
                  {entry.text}
                </p>
              </div>
            );
          })}

          {/* Transmitting / Thinking State */}
          {isSending && (
            <div className="p-3 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan text-xs flex items-center space-x-2 animate-pulse mr-6 sm:mr-12">
              <Cpu className="w-4 h-4 animate-spin shrink-0" />
              <span>TRANSMITTING NEURAL QUERY // AWAITING SUSPECT TESTIMONY...</span>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* Input & Action Bar (Fixed at bottom) */}
        <div className="p-3 sm:p-4 bg-cyber-subsurface border-t border-cyber-border shrink-0">
          {remainingQuestions <= 0 ? (
            <div className="p-2.5 bg-cyber-bg border border-cyber-red/50 text-cyber-red text-center rounded text-xs font-bold">
              INTERROGATION BUDGET EXHAUSTED FOR THIS CASE (0 QUESTIONS REMAINING)
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={300}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={`Question ${suspect.name} (max 300 characters)...`}
                  disabled={isSending}
                  className="flex-1 bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan font-mono disabled:opacity-50 placeholder:text-cyber-muted/40"
                />
                <CyberButton
                  variant="primary"
                  size="sm"
                  icon={Send}
                  type="submit"
                  disabled={isSending || !inputQuery.trim()}
                  className="shrink-0"
                >
                  {isSending ? 'QUERYING...' : 'TRANSMIT'}
                </CyberButton>
              </div>

              <div className="flex items-center justify-between text-[10px] text-cyber-muted px-1">
                <span>
                  PRESS <strong className="text-cyber-cyan">ENTER</strong> TO TRANSMIT • <strong className="text-cyber-cyan">ESC</strong> TO QUIT
                </span>
                <span>{300 - inputQuery.length} CHARS REMAINING</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
