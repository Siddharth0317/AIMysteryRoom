import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import CyberButton from './CyberButton';

export default function ErrorBanner({
  title = 'SECURITY PROTOCOL ERROR',
  message,
  onRetry,
  onDismiss,
  className = '',
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`relative bg-cyber-red/10 border border-cyber-red/50 rounded-lg p-4 font-mono text-sm shadow-lg shadow-cyber-red/10 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-cyber-red shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h4 className="text-cyber-red font-bold uppercase tracking-wider text-xs">
            {title}
          </h4>
          <p className="text-cyber-text text-xs leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onRetry && (
            <CyberButton
              variant="danger"
              size="sm"
              onClick={onRetry}
              icon={RefreshCw}
            >
              Retry
            </CyberButton>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss error"
              className="text-cyber-muted hover:text-cyber-red p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
