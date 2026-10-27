import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import CreateMystery from './pages/CreateMystery';
import InvestigationRoom from './pages/InvestigationRoom';
import Accusation from './pages/Accusation';
import Results from './pages/Results';
import NotFound from './pages/NotFound';
import { getActiveMockCase, clearActiveMockCase, saveMockCase } from './utils/mockCase';

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
        <Routes>
          {/* Canonical Routes per SPEC.md */}
          <Route
            path="/"
            element={<Home activeCase={activeCase} />}
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
      </AppShell>
    </Router>
  );
}
