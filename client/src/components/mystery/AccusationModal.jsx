import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, AlertTriangle, Check, X } from 'lucide-react';
import CyberButton from '../common/CyberButton';

export default function AccusationModal({
  isOpen,
  suspect,
  onConfirm,
  onCancel,
  isSubmitting = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen || !suspect) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accusation-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-cyber-bg/85 backdrop-blur-md animate-fade-in font-mono overflow-y-auto"
      onClick={() => {
        if (!isSubmitting && onCancel) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-cyber-surface border border-cyber-red/70 rounded-lg p-5 sm:p-6 font-mono shadow-2xl shadow-cyber-red/20 max-h-[85vh] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center space-x-3 text-cyber-red border-b border-cyber-red/40 pb-3 mb-3 shrink-0">
          <ShieldAlert className="w-6 h-6 animate-pulse shrink-0" />
          <div className="min-w-0">
            <h2 id="accusation-modal-title" className="font-bold text-sm uppercase tracking-wider text-cyber-red truncate">
              CONFIRM FINAL ACCUSATION
            </h2>
            <p className="text-[11px] text-cyber-muted">
              IRREVERSIBLE CASE COMPLETION PROTOCOL
            </p>
          </div>
        </div>

        {/* Warning Body (Scrollable) */}
        <div className="space-y-4 my-2 text-xs overflow-y-auto flex-1 pr-1">
          <div className="bg-cyber-subsurface border border-cyber-border p-3.5 rounded">
            <span className="text-[10px] text-cyber-muted uppercase block mb-1">
              ACCUSED PERPETRATOR:
            </span>
            <div className="text-sm font-bold text-cyber-cyan">
              {suspect.name}
            </div>
            <div className="text-xs text-cyber-muted">
              {suspect.role}
            </div>
          </div>

          <div className="bg-cyber-red/10 border border-cyber-red/40 p-3 rounded flex items-start space-x-2 text-cyber-text">
            <AlertTriangle className="w-4 h-4 text-cyber-red shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <span className="font-bold text-cyber-red">WARNING: </span>
              Submitting an accusation permanently locks the investigation. No further clues or hints may be requested. If your accusation is incorrect, your score will be <span className="font-bold text-cyber-red">0</span>.
            </div>
          </div>
        </div>

        {/* Action Buttons (Fixed at bottom) */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-cyber-border shrink-0 mt-2">
          <CyberButton
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
            icon={X}
          >
            Cancel &amp; Review
          </CyberButton>

          <CyberButton
            variant="danger"
            size="md"
            onClick={() => onConfirm(suspect.id)}
            disabled={isSubmitting}
            icon={Check}
          >
            {isSubmitting ? 'Evaluating...' : 'Confirm Accusation'}
          </CyberButton>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
