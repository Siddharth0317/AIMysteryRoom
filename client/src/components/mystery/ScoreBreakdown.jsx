import React from 'react';
import { Award, CheckCircle, XCircle, Sparkles, AlertTriangle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const {
    difficulty = 'medium',
    basePoints = 0,
    cluesBonus = 0,
    cluesCount = 0,
    hintsPenalty = 0,
    hintsCount = 0,
    finalScore = 0,
    isCorrect = false,
  } = breakdown;

  // Rank calculation
  let rank = 'F';
  let rankColor = 'text-cyber-red border-cyber-red';
  if (isCorrect) {
    if (finalScore >= 180) {
      rank = 'S';
      rankColor = 'text-cyber-cyan border-cyber-cyan shadow-neon-cyan';
    } else if (finalScore >= 140) {
      rank = 'A';
      rankColor = 'text-cyber-green border-cyber-green shadow-neon-green';
    } else if (finalScore >= 100) {
      rank = 'B';
      rankColor = 'text-cyber-amber border-cyber-amber';
    } else {
      rank = 'C';
      rankColor = 'text-cyber-muted border-cyber-muted';
    }
  }

  return (
    <div className="bg-cyber-surface border border-cyber-border rounded-lg p-5 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-cyber-cyan" />
          <h3 className="font-bold uppercase tracking-wider text-sm text-cyber-text">
            INVESTIGATOR SCORE BREAKDOWN
          </h3>
        </div>
        <StatusBadge variant={isCorrect ? 'green' : 'red'}>
          {isCorrect ? 'ACCUSATION VERIFIED' : 'INVESTIGATION FAILED'}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Table breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-1.5 border-b border-cyber-border/40 text-cyber-muted">
            <span className="flex items-center space-x-1.5">
              <span>Base Difficulty Points ({difficulty.toUpperCase()})</span>
            </span>
            <span className={`font-bold ${isCorrect ? 'text-cyber-text' : 'text-cyber-muted'}`}>
              +{basePoints} PTS
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-cyber-border/40 text-cyber-muted">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyber-green" />
              <span>Decrypted Clues Bonus ({cluesCount} &times; 5)</span>
            </span>
            <span className="font-bold text-cyber-green">
              +{cluesBonus} PTS
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-cyber-border/40 text-cyber-muted">
            <span className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-cyber-amber" />
              <span>Tactical Hints Penalty ({hintsCount} &times; 10)</span>
            </span>
            <span className="font-bold text-cyber-amber">
              -{hintsPenalty} PTS
            </span>
          </div>

          {!isCorrect && (
            <div className="bg-cyber-red/10 border border-cyber-red/30 p-2.5 rounded text-[11px] text-cyber-red">
              * Incorrect accusation results in 0 total points for the case.
            </div>
          )}
        </div>

        {/* Final Score & Investigator Rank Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-cyber-subsurface border border-cyber-border rounded-lg text-center">
          <span className="text-[11px] text-cyber-muted tracking-widest uppercase mb-1">
            FINAL SCORE COMPUTED
          </span>
          <div className="text-4xl sm:text-5xl font-display font-bold text-cyber-cyan mb-3 tracking-wider text-shadow-neon">
            {finalScore}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-cyber-muted">DETECTIVE RANK:</span>
            <span className={`w-8 h-8 rounded border-2 font-display font-bold text-xl flex items-center justify-center ${rankColor}`}>
              {rank}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
