import React from 'react';
import { Search, FolderX } from 'lucide-react';
import CyberButton from './CyberButton';

export default function EmptyState({
  title = 'NO DATA LOGGED',
  description = 'No active telemetry or records match the current inquiry.',
  actionLabel,
  onAction,
  icon: Icon = FolderX,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-cyber-surface/40 border border-dashed border-cyber-border rounded-lg font-mono ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-cyber-subsurface border border-cyber-border flex items-center justify-center mb-4 text-cyber-muted">
        <Icon className="w-6 h-6 text-cyber-muted" />
      </div>

      <h3 className="text-cyber-text font-bold text-sm tracking-wider uppercase mb-1">
        {title}
      </h3>
      <p className="text-cyber-muted text-xs max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <CyberButton
          size="sm"
          variant="primary"
          onClick={onAction}
          icon={Search}
        >
          {actionLabel}
        </CyberButton>
      )}
    </div>
  );
}
