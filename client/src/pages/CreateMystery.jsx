import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Zap, Sparkles, Check, AlertCircle } from 'lucide-react';
import TerminalPanel from '../components/common/TerminalPanel';
import CyberButton from '../components/common/CyberButton';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingTerminal from '../components/common/LoadingTerminal';
import casesApi from '../api/casesApi';
import { MOCK_PRESETS, createMockCase } from '../utils/mockCase';

export default function CreateMystery({ onCaseCreated }) {
  const navigate = useNavigate();

  const [premise, setPremise] = useState(MOCK_PRESETS[0].premise);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const MAX_CHARS = 500;
  const remainingChars = MAX_CHARS - premise.length;

  const handleSelectPreset = (preset) => {
    setPremise(preset.premise);
    setDifficulty(preset.difficulty);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = premise.trim();

    if (!trimmed) {
      setError('Please provide a valid mystery premise. The prompt cannot be empty or solely whitespace.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setError(`Premise exceeds the maximum allowable limit of ${MAX_CHARS} characters.`);
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      let newCase;
      try {
        newCase = await casesApi.createCase(trimmed, difficulty);
      } catch (apiErr) {
        console.warn('Backend API request error, fallback to local simulation:', apiErr.message);
        newCase = createMockCase(trimmed, difficulty);
      }

      if (onCaseCreated) {
        onCaseCreated(newCase);
      }
      setIsGenerating(false);
      navigate(`/case/${newCase.id}`);
    } catch (err) {
      setError(err.message || 'Case initialization failed. Please check parameters and try again.');
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="py-12">
        <LoadingTerminal
          title="SYNTHESIZING NEURAL MYSTERY MATRIX"
          messages={[
            'Ingesting premise & initializing Gemini AI model...',
            `Calibrating difficulty parameters for tier [${difficulty.toUpperCase()}]...`,
            'Architecting consistent criminal timeline and secret culprit...',
            'Injecting forensic clues, red herrings, and biometric anomalies...',
            'Sanitizing player-facing DTO payload (Zero-Leakage policy)...',
            'Saving encrypted case record to investigation storage...',
          ]}
          durationMs={2800}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-mono">
      {/* Title Header */}
      <div className="border-b border-cyber-border pb-4">
        <div className="flex items-center space-x-2 text-cyber-cyan text-xs mb-1">
          <Terminal className="w-4 h-4" />
          <span>CASE INITIALIZATION PROTOCOL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-cyber-text tracking-wide uppercase">
          CREATE NEW MYSTERY
        </h1>
        <p className="text-xs text-cyber-muted mt-1">
          Configure initial scenario vectors and difficulty constraints for the neural case generator.
        </p>
      </div>

      {error && (
        <ErrorBanner
          title="VALIDATION REJECTION"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Preset Fast-Select Buttons */}
      <div className="space-y-2">
        <span className="text-xs text-cyber-muted uppercase tracking-wider block">
          Preset Mission Blueprints (Click to Load):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MOCK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-2.5 rounded bg-cyber-surface border border-cyber-border hover:border-cyber-cyan hover:bg-cyber-cyan/5 transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-cyber-cyan font-bold truncate">
                  {preset.title}
                </span>
                <span className="text-[10px] text-cyber-green uppercase">
                  {preset.difficulty}
                </span>
              </div>
              <p className="text-cyber-muted text-[11px] line-clamp-2">
                {preset.premise}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Premise Textarea */}
        <TerminalPanel
          title="CASE SCENARIO &amp; INVESTIGATION PREMISE"
          subtitle="MAX 500 CHARACTERS"
          badge={
            <span className={`text-xs font-mono font-bold ${
              remainingChars < 30 ? 'text-cyber-red' : 'text-cyber-muted'
            }`}>
              {remainingChars} CHARS LEFT
            </span>
          }
        >
          <div className="space-y-2">
            <label htmlFor="premise-input" className="sr-only">
              Mystery Premise
            </label>
            <textarea
              id="premise-input"
              rows={5}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="Describe the incident, victim, setting, or high-tech crime to investigate..."
              className="w-full bg-cyber-subsurface border border-cyber-border rounded p-3 text-xs sm:text-sm text-cyber-text font-mono focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan transition-all resize-y placeholder:text-cyber-muted/40"
            />
          </div>
        </TerminalPanel>

        {/* Difficulty Selection */}
        <div className="space-y-3">
          <label className="text-xs text-cyber-muted uppercase tracking-wider block">
            Select Investigation Difficulty:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Easy */}
            <div
              onClick={() => setDifficulty('easy')}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                difficulty === 'easy'
                  ? 'border-cyber-green bg-cyber-green/10 shadow-neon-green/20 shadow-md'
                  : 'border-cyber-border bg-cyber-surface hover:border-cyber-green/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyber-green uppercase">
                  EASY
                </span>
                {difficulty === 'easy' && (
                  <Check className="w-4 h-4 text-cyber-green" />
                )}
              </div>
              <ul className="text-xs text-cyber-muted space-y-1">
                <li>• 3 Suspects</li>
                <li>• 5 Forensic Clues</li>
                <li>• 2 Tactical Hints</li>
                <li className="text-cyber-text font-bold pt-1">
                  100 Base Points
                </li>
              </ul>
            </div>

            {/* Medium */}
            <div
              onClick={() => setDifficulty('medium')}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                difficulty === 'medium'
                  ? 'border-cyber-cyan bg-cyber-cyan/10 shadow-neon-cyan/20 shadow-md'
                  : 'border-cyber-border bg-cyber-surface hover:border-cyber-cyan/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyber-cyan uppercase">
                  MEDIUM
                </span>
                {difficulty === 'medium' && (
                  <Check className="w-4 h-4 text-cyber-cyan" />
                )}
              </div>
              <ul className="text-xs text-cyber-muted space-y-1">
                <li>• 4 Suspects</li>
                <li>• 7 Forensic Clues</li>
                <li>• 3 Tactical Hints</li>
                <li className="text-cyber-text font-bold pt-1">
                  150 Base Points
                </li>
              </ul>
            </div>

            {/* Hard */}
            <div
              onClick={() => setDifficulty('hard')}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                difficulty === 'hard'
                  ? 'border-cyber-magenta bg-cyber-magenta/10 shadow-neon-magenta/20 shadow-md'
                  : 'border-cyber-border bg-cyber-surface hover:border-cyber-magenta/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyber-magenta uppercase">
                  HARD
                </span>
                {difficulty === 'hard' && (
                  <Check className="w-4 h-4 text-cyber-magenta" />
                )}
              </div>
              <ul className="text-xs text-cyber-muted space-y-1">
                <li>• 5 Suspects</li>
                <li>• 9 Forensic Clues</li>
                <li>• 3 Tactical Hints</li>
                <li className="text-cyber-text font-bold pt-1">
                  200 Base Points
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <CyberButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            icon={Sparkles}
          >
            GENERATE MYSTERY // COMMENCE INVESTIGATION
          </CyberButton>
        </div>
      </form>
    </div>
  );
}
