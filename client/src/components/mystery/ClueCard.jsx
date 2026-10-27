import React from 'react';
import { Lock, Unlock, FileSearch, Sparkles } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CyberButton from '../common/CyberButton';

export default function ClueCard({
  clue,
  index = 0,
  onDiscover,
  isDecrypting = false,
}) {
  const isDiscovered = clue.discovered;
  const clueCode = `EVID-${String(index + 1).padStart(2, '0')}`;

  return (
    <div
      className={`relative bg-cyber-surface border rounded-lg p-4 font-mono transition-all duration-300 ${
        isDiscovered
          ? 'border-cyber-green/40 shadow-sm shadow-cyber-green/5'
          : 'border-cyber-border bg-cyber-subsurface/40 hover:border-cyber-cyan/30'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-bold text-cyber-muted tracking-wider">
            [{clueCode}]
          </span>
          <h4 className="text-xs font-bold text-cyber-text tracking-wide truncate max-w-[200px]">
            {isDiscovered ? clue.title : 'ENCRYPTED DATA SEGMENT'}
          </h4>
        </div>

        <StatusBadge
          size="xs"
          variant={isDiscovered ? 'green' : 'muted'}
        >
          {isDiscovered ? 'DECRYPTED' : 'LOCKED'}
        </StatusBadge>
      </div>

      {/* Clue Content */}
      <div className="my-2.5 min-h-[48px]">
        {isDiscovered ? (
          <p className="text-xs text-cyber-text/90 leading-relaxed">
            {clue.description}
          </p>
        ) : (
          <div className="relative overflow-hidden bg-cyber-subsurface/80 rounded p-2.5 border border-cyber-border/40">
            <p className="text-xs text-cyber-muted/40 filter blur-[2px] select-none pointer-events-none line-clamp-2">
              01001100 01101111 01100011 01101011 01100101 01100100 00100000 01000011 01101100 01110101 01100101
            </p>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] text-cyber-muted font-bold tracking-widest flex items-center space-x-1">
                <Lock className="w-3 h-3 text-cyber-amber" />
                <span>FORENSIC TELEMETRY ENCRYPTED</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="pt-2 border-t border-cyber-border/50 flex items-center justify-between text-[11px]">
        {isDiscovered ? (
          <span className="text-cyber-green flex items-center space-x-1 text-[10px]">
            <Sparkles className="w-3 h-3" />
            <span>+5 PTS SECURED</span>
          </span>
        ) : (
          <span className="text-cyber-muted text-[10px]">
            VALUE: +5 PTS ON DECRYPTION
          </span>
        )}

        {!isDiscovered && onDiscover && (
          <CyberButton
            size="sm"
            variant="primary"
            onClick={() => onDiscover(clue.id)}
            disabled={isDecrypting}
            icon={Unlock}
          >
            {isDecrypting ? 'Decrypting...' : 'Decrypt Clue'}
          </CyberButton>
        )}
      </div>
    </div>
  );
}
