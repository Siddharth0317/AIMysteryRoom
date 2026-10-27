import React from 'react';

export default function CyberButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  title,
}) {
  const baseStyles = 'relative inline-flex items-center justify-center font-mono font-medium transition-all duration-200 uppercase tracking-wider rounded focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:ring-offset-2 focus:ring-offset-cyber-bg disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 space-x-1.5',
    md: 'text-sm px-4 py-2 space-x-2',
    lg: 'text-base px-6 py-3 space-x-2.5 font-semibold',
  };

  const variantStyles = {
    primary: 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan hover:bg-cyber-cyan/20 hover:shadow-neon-cyan active:bg-cyber-cyan/30',
    magenta: 'bg-cyber-magenta/10 text-cyber-magenta border border-cyber-magenta hover:bg-cyber-magenta/20 hover:shadow-neon-magenta active:bg-cyber-magenta/30',
    success: 'bg-cyber-green/10 text-cyber-green border border-cyber-green hover:bg-cyber-green/20 hover:shadow-neon-green active:bg-cyber-green/30',
    danger: 'bg-cyber-red/10 text-cyber-red border border-cyber-red hover:bg-cyber-red/20 active:bg-cyber-red/30',
    ghost: 'bg-transparent text-cyber-muted border border-cyber-border hover:text-cyber-cyan hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
