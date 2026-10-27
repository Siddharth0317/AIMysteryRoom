import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, AlertTriangle, Home } from 'lucide-react';
import CyberButton from '../components/common/CyberButton';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 font-mono">
      <div className="w-16 h-16 rounded-full bg-cyber-red/10 border border-cyber-red/50 flex items-center justify-center text-cyber-red mb-6 shadow-neon-red">
        <AlertTriangle className="w-8 h-8 animate-pulse" />
      </div>

      <span className="text-xs text-cyber-red font-bold uppercase tracking-widest mb-1">
        ERROR 404 // MEMORY ADDR UNMAPPED
      </span>

      <h1 className="text-3xl sm:text-5xl font-display font-bold text-cyber-text tracking-wider uppercase mb-3 text-shadow-neon">
        SIGNAL TERMINATED
      </h1>

      <p className="max-w-md text-xs sm:text-sm text-cyber-muted mb-8 leading-relaxed">
        The requested neural route or investigation archive does not exist within Vault telemetry. Verify the route parameter and re-establish connection.
      </p>

      <Link to="/">
        <CyberButton variant="primary" size="lg" icon={Home}>
          RETURN TO HOME BASE
        </CyberButton>
      </Link>
    </div>
  );
}
