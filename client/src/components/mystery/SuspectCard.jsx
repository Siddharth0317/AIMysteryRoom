import React from 'react';
import { User, ShieldAlert, Clock, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function SuspectCard({
  suspect,
  selected = false,
  onSelect,
  onInterrogate,
  selectable = false,
  compact = false,
}) {
  return (
    <div
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-pressed={selectable ? selected : undefined}
      aria-label={selectable ? `Select ${suspect.name}, ${suspect.role} as target` : undefined}
      onKeyDown={selectable && onSelect ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(suspect);
        }
      } : undefined}
      onClick={selectable && onSelect ? () => onSelect(suspect) : undefined}
      className={`relative bg-cyber-surface border rounded-lg p-4 font-mono transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyber-cyan ${
        selectable ? 'cursor-pointer hover:border-cyber-cyan/70 hover:shadow-neon-cyan/20' : ''
      } ${
        selected
          ? 'border-cyber-cyan ring-1 ring-cyber-cyan bg-cyber-cyan/5 shadow-neon-cyan'
          : 'border-cyber-border'
      }`}
    >
      {/* Selection Indicator */}
      {selectable && (
        <div className="absolute top-3 right-3">
          {selected ? (
            <div className="flex items-center space-x-1 text-cyber-cyan font-bold text-xs bg-cyber-cyan/10 border border-cyber-cyan px-2 py-0.5 rounded">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>PRIMARY TARGET</span>
            </div>
          ) : (
            <span className="text-[10px] text-cyber-muted border border-cyber-border px-2 py-0.5 rounded hover:border-cyber-cyan/50">
              SELECT
            </span>
          )}
        </div>
      )}

      {/* Header: Avatar, Name, Role */}
      <div className="flex items-start space-x-3 mb-3">
        <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${
          selected ? 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan' : 'border-cyber-border bg-cyber-subsurface text-cyber-muted'
        }`}>
          <User className="w-5 h-5" />
        </div>

        <div className="flex-1 pr-16 truncate">
          <h3 className="text-cyber-text font-bold text-sm tracking-wide truncate">
            {suspect.name}
          </h3>
          <p className="text-xs text-cyber-cyan font-medium truncate">
            {suspect.role}
          </p>
        </div>
      </div>

      {/* Details: Background, Motive, Alibi */}
      {!compact && (
        <div className="space-y-2.5 text-xs text-cyber-muted border-t border-cyber-border/50 pt-2.5">
          {/* Background */}
          <div>
            <span className="text-cyber-text font-semibold uppercase tracking-wider text-[11px] block mb-0.5">
              Public Dossier:
            </span>
            <p className="leading-relaxed line-clamp-3">
              {suspect.background}
            </p>
          </div>

          {/* Motive */}
          <div className="bg-cyber-subsurface/60 p-2 rounded border border-cyber-border/40">
            <div className="flex items-center space-x-1.5 text-cyber-amber mb-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Potential Motive:
              </span>
            </div>
            <p className="text-cyber-text text-[11px] leading-relaxed">
              {suspect.motive}
            </p>
          </div>

          {/* Alibi */}
          <div className="bg-cyber-subsurface/60 p-2 rounded border border-cyber-border/40">
            <div className="flex items-center space-x-1.5 text-cyber-cyan mb-0.5">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Stated Alibi:
              </span>
            </div>
            <p className="text-cyber-text text-[11px] leading-relaxed">
              {suspect.alibi}
            </p>
          </div>

          {/* Interrogation Action Button per SPEC.md */}
          {onInterrogate && (
            <div className="pt-2 border-t border-cyber-border/40 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInterrogate(suspect);
                }}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-[10px] font-bold bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/20 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>INTERROGATE</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
