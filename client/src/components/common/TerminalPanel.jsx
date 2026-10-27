import React from 'react';

export default function TerminalPanel({
  title,
  subtitle,
  badge,
  children,
  className = '',
  headerAction,
  glow = false,
  scanlines = false,
}) {
  return (
    <div
      className={`relative bg-cyber-surface border rounded-lg transition-all duration-300 ${
        glow ? 'border-cyber-cyan shadow-neon-cyan/20 shadow-lg' : 'border-cyber-border'
      } ${className}`}
    >
      {/* Corner Tech Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyber-cyan/60 rounded-tl pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyber-cyan/60 rounded-tr pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyber-cyan/60 rounded-bl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyber-cyan/60 rounded-br pointer-events-none" />

      {/* Optional CRT Scanlines */}
      {scanlines && <div className="cyber-scanlines absolute inset-0 rounded-lg pointer-events-none" />}

      {/* Terminal Title Bar */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border bg-cyber-subsurface/70 rounded-t-lg">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            {/* Terminal Status Lights */}
            <div className="flex space-x-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-red/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-amber/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/80 inline-block" />
            </div>

            <div className="truncate">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-cyber-cyan truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] font-mono text-cyber-muted truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {badge && <div>{badge}</div>}
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}

      {/* Panel Content */}
      <div className="p-4 sm:p-5 relative z-10">
        {children}
      </div>
    </div>
  );
}
