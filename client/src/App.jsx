import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import { getActiveMockCase, clearActiveMockCase, saveMockCase } from './utils/mockCase';

// Route-level code splitting for performance (SPEC.md Phase 8)
const CreateMystery = lazy(() => import('./pages/CreateMystery'));
const InvestigationRoom = lazy(() => import('./pages/InvestigationRoom'));
const Accusation = lazy(() => import('./pages/Accusation'));
const Results = lazy(() => import('./pages/Results'));
const CaseArchive = lazy(() => import('./pages/CaseArchive'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 font-mono text-xs text-cyber-cyan"
    >
      <div className="w-8 h-8 rounded-full border-2 border-cyber-cyan border-t-transparent animate-spin" />
      <span className="tracking-widest uppercase text-[11px] animate-pulse">
        DECRYPTING ROUTE PAYLOAD...
      </span>
    </div>
  );
}

export default function App() {
  const [activeCase, setActiveCase] = useState(() => getActiveMockCase());
  const [latestResult, setLatestResult] = useState(null);

  // Sync state if localStorage changes or on mount
  useEffect(() => {
    const current = getActiveMockCase();
    if (current) {
      setActiveCase(current);
      if (current.result) {
        setLatestResult(current.result);
      }
    }
  }, []);

  const handleCaseCreated = (newCase) => {
    setActiveCase(newCase);
    setLatestResult(null);
    saveMockCase(newCase);
  };

  const handleCaseUpdated = (updatedCase) => {
    setActiveCase({ ...updatedCase });
    saveMockCase(updatedCase);
  };

  const handleAccusationSubmitted = (result) => {
    setLatestResult(result);
    const updated = getActiveMockCase();
    if (updated) {
      setActiveCase(updated);
    }
  };

  const handleResetCaseData = () => {
    clearActiveMockCase();
    setActiveCase(null);
    setLatestResult(null);
  };

  return (
    <Router>
      <AppShell activeCase={activeCase} onResetCaseData={handleResetCaseData}>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Canonical Routes per SPEC.md */}
            <Route
              path="/"
              element={<Home activeCase={activeCase} onCaseCreated={handleCaseCreated} />}
            />
            <Route
              path="/create"
              element={<CreateMystery onCaseCreated={handleCaseCreated} />}
            />
            <Route
              path="/investigation/:caseId"
              element={
                <InvestigationRoom
                  activeCase={activeCase}
                  onCaseUpdated={handleCaseUpdated}
                />
              }
            />
            <Route
              path="/accuse/:caseId"
              element={
                <Accusation
                  activeCase={activeCase}
                  onAccusationSubmitted={handleAccusationSubmitted}
                />
              }
            />
            <Route
              path="/results/:caseId"
              element={
                <Results
                  activeCase={activeCase}
                  latestResult={latestResult}
                />
              }
            />
            <Route
              path="/archive"
              element={<CaseArchive onSelectCase={handleCaseCreated} />}
            />
            <Route
              path="/history"
              element={<CaseArchive onSelectCase={handleCaseCreated} />}
            />
            <Route
              path="/stats"
              element={<CaseArchive onSelectCase={handleCaseCreated} />}
            />

            {/* Compatibility Aliases for /case/:id */}
            <Route
              path="/case/:id"
              element={
                <InvestigationRoom
                  activeCase={activeCase}
                  onCaseUpdated={handleCaseUpdated}
                />
              }
            />
            <Route
              path="/case/:id/accuse"
              element={
                <Accusation
                  activeCase={activeCase}
                  onAccusationSubmitted={handleAccusationSubmitted}
                />
              }
            />
            <Route
              path="/case/:id/result"
              element={
                <Results
                  activeCase={activeCase}
                  latestResult={latestResult}
                />
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </Router>
  );
}
