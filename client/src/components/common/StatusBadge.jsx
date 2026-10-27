import React from 'react';

export default function StatusBadge({
  children,
  variant = 'cyan',
  size = 'sm',
  dot = true,
  className = '',
}) {
  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 space-x-1',
    sm: 'text-xs px-2.5 py-1 space-x-1.5',
    md: 'text-sm px-3 py-1.5 space-x-2',
  };

  const variantStyles = {
    cyan: {
      container: 'bg-cyber-cyan/10 border-cyber-cyan/40 text-cyber-cyan',
      dot: 'bg-cyber-cyan',
    },
    green: {
      container: 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green',
      dot: 'bg-cyber-green',
    },
    amber: {
      container: 'bg-cyber-amber/10 border-cyber-amber/40 text-cyber-amber',
      dot: 'bg-cyber-amber',
    },
    red: {
      container: 'bg-cyber-red/10 border-cyber-red/40 text-cyber-red',
      dot: 'bg-cyber-red',
    },
    magenta: {
      container: 'bg-cyber-magenta/10 border-cyber-magenta/40 text-cyber-magenta',
      dot: 'bg-cyber-magenta',
    },
    muted: {
      container: 'bg-cyber-subsurface border-cyber-border text-cyber-muted',
      dot: 'bg-cyber-muted',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.cyan;

  return (
    <span
      className={`inline-flex items-center font-mono font-medium uppercase tracking-wider border rounded shrink-0 select-none ${
        sizeStyles[size] || sizeStyles.sm
      } ${currentVariant.container} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dot} animate-pulse`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
