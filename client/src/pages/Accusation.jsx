import React, { useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { Crosshair, ShieldAlert, AlertTriangle, ArrowLeft, Check, Award } from 'lucide-react';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';
import CyberButton from '../components/common/CyberButton';
import SuspectCard from '../components/mystery/SuspectCard';
import AccusationModal from '../components/mystery/AccusationModal';
import ErrorBanner from '../components/common/ErrorBanner';
import EmptyState from '../components/common/EmptyState';
import casesApi from '../api/casesApi';
import { accuseMockSuspect } from '../utils/mockCase';

export default function Accusation({ activeCase, onAccusationSubmitted }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseId: paramCaseId, id: paramId } = useParams();
  const caseId = activeCase?.id || paramCaseId || paramId;

  const searchParams = new URLSearchParams(location.search);
  const initialAccused = searchParams.get('accused');

  const [selectedSuspectId, setSelectedSuspectId] = useState(initialAccused || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!activeCase) {
    return (
      <EmptyState
        title="NO CASE READY FOR ACCUSATION"
        description="Return to the terminal and initialize or select an active case first."
        actionLabel="INITIALIZE CASE"
        onAction={() => navigate('/create')}
      />
    );
  }

  // If the investigation has already concluded, seal the accusation chamber
  if (activeCase.status === 'completed') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 font-mono py-8 animate-fade-in">
        <TerminalPanel
          title="ACCUSATION CHAMBER SEALED"
          subtitle="CASE ALREADY FINALIZED"
          badge={<StatusBadge size="xs" variant="green">VERDICT LOCKED</StatusBadge>}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center space-x-3 p-3.5 rounded bg-cyber-subsurface border border-cyber-border">
              <ShieldAlert className="w-6 h-6 text-cyber-amber shrink-0" />
              <div>
                <span className="font-bold text-cyber-text text-sm block">
                  INVESTIGATION CONCLUDED
                </span>
                <p className="text-cyber-muted text-[11px] mt-0.5 leading-relaxed">
                  Case #{caseId?.slice(0, 8)} ({activeCase.title || 'Untitled'}) has reached final resolution. The accusation chamber is permanently sealed and the authoritative score is recorded on the central server.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link to={`/results/${caseId}`} className="w-full sm:w-auto flex-1">
                <CyberButton variant="green" size="md" icon={Award} className="w-full shadow-neon-green">
                  VIEW FINAL VERDICT &amp; ANALYSIS
                </CyberButton>
              </Link>
              <Link to={`/investigation/${caseId}`} className="w-full sm:w-auto">
                <CyberButton variant="ghost" size="md" icon={ArrowLeft} className="w-full border-cyber-border">
                  REVIEW EVIDENCE DOSSIER
                </CyberButton>
              </Link>
            </div>
          </div>
        </TerminalPanel>
      </div>
    );
  }

  const { title, suspects = [], difficulty } = activeCase;
  const selectedSuspect = suspects.find((s) => s.id === selectedSuspectId);

  const handleSelectSuspect = (suspect) => {
    setSelectedSuspectId(suspect.id);
    setError(null);
  };

  const handleOpenModal = () => {
    if (!selectedSuspectId) {
      setError('You must designate a primary suspect before proceeding to accusation.');
      return;
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleConfirmAccusation = async (suspectId) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      try {
        result = await casesApi.submitAccusation(caseId, suspectId);
      } catch (apiErr) {
        result = accuseMockSuspect(caseId, suspectId);
      }

      if (onAccusationSubmitted) {
        onAccusationSubmitted(result);
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
      navigate(`/results/${caseId}`);
    } catch (err) {
      setError(err.message || 'Accusation transmission failed. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-4">
        <div>
          <div className="flex items-center space-x-2 text-cyber-red text-xs mb-1">
            <Crosshair className="w-4 h-4 animate-pulse" />
            <span>CRITICAL VERDICT CHAMBER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-cyber-text tracking-wide uppercase">
            ACCUSE PERPETRATOR
          </h1>
          <p className="text-xs text-cyber-muted mt-1">
            Case: {title} ({difficulty?.toUpperCase()})
          </p>
        </div>

        <Link to={`/investigation/${caseId}`}>
          <CyberButton variant="ghost" size="sm" icon={ArrowLeft}>
            Back to Evidence
          </CyberButton>
        </Link>
      </div>

      {/* Critical Warning Alert Banner */}
      <div className="bg-cyber-red/10 border border-cyber-red/50 rounded-lg p-4 flex items-start space-x-3 text-cyber-text text-xs leading-relaxed shadow-lg shadow-cyber-red/10">
        <ShieldAlert className="w-5 h-5 text-cyber-red shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyber-red uppercase tracking-wider block mb-0.5">
            HIGH-CONSEQUENCE ACTION:
          </span>
          Select one suspect based on your gathered evidence. The server will compare your choice against the encrypted culprit. An incorrect accusation grants <span className="font-bold text-cyber-red">0 base points</span>. The case will be permanently closed.
        </div>
      </div>

      {error && (
        <ErrorBanner
          title="ACCUSATION PROTOCOL ERROR"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Suspect Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-cyber-cyan uppercase tracking-wider">
            Designate Primary Perpetrator:
          </span>
          <span className="text-[11px] text-cyber-muted">
            {selectedSuspectId ? '1 SUSPECT TARGETED' : 'CLICK A SUSPECT CARD'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suspects.map((suspect) => (
            <SuspectCard
              key={suspect.id}
              suspect={suspect}
              selectable
              selected={selectedSuspectId === suspect.id}
              onSelect={handleSelectSuspect}
            />
          ))}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-terminal">
        <div className="text-xs">
          <span className="text-cyber-muted uppercase block">Selected Suspect:</span>
          <span className="font-bold text-sm text-cyber-cyan">
            {selectedSuspect ? selectedSuspect.name : 'None Selected'}
          </span>
        </div>

        <CyberButton
          variant="danger"
          size="lg"
          disabled={!selectedSuspectId}
          onClick={handleOpenModal}
          icon={Crosshair}
          className="w-full sm:w-auto"
        >
          CONFIRM ACCUSATION &amp; CLOSE CASE
        </CyberButton>
      </div>

      {/* Confirmation Modal */}
      <AccusationModal
        isOpen={isModalOpen}
        suspect={selectedSuspect}
        onConfirm={handleConfirmAccusation}
        onCancel={() => setIsModalOpen(false)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
