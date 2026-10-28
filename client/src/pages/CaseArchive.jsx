import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Archive,
  BarChart3,
  Award,
  Calendar,
  Compass,
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  Key,
  MessageSquare,
  Share2,
  Terminal,
  RefreshCw,
  RotateCcw,
  ArrowRight,
  Filter,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import TerminalPanel from '../components/common/TerminalPanel';
import StatusBadge from '../components/common/StatusBadge';
import CyberButton from '../components/common/CyberButton';
import EmptyState from '../components/common/EmptyState';
import casesApi from '../api/casesApi';

export default function CaseArchive({ onSelectCase }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('history'); // 'history', 'stats', 'achievements'
  const [cases, setCases] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [achievementsData, setAchievementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyCaseInfo, setDailyCaseInfo] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesRes, statsRes, achRes] = await Promise.all([
        casesApi.listCases({ status: statusFilter }),
        casesApi.getPlayerStats().catch(() => null),
        casesApi.getPlayerAchievements().catch(() => null),
      ]);

      setCases(casesRes?.cases || []);
      if (statsRes) setStats(statsRes);
      if (achRes) setAchievementsData(achRes);
    } catch (err) {
      console.warn('Failed to load case archive data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchDaily = async () => {
    setDailyLoading(true);
    try {
      const res = await casesApi.getDailyCase();
      setDailyCaseInfo(res);
      if (onSelectCase && res.case) {
        onSelectCase(res.case);
      }
      navigate(`/investigation/${res.case.id}`);
    } catch (err) {
      setActionNotice('Failed to synchronize daily mystery case.');
      setTimeout(() => setActionNotice(null), 3500);
    } finally {
      setDailyLoading(false);
    }
  };

  const handleReplay = async (caseId) => {
    try {
      const res = await casesApi.replayCase(caseId);
      if (onSelectCase && res.case) {
        onSelectCase(res.case);
      }
      navigate(`/investigation/${res.case.id}`);
    } catch (err) {
      setActionNotice('Failed to initialize replay simulation.');
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const renderBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'award': return <Award className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      case 'shield': return <Shield className="w-5 h-5" />;
      case 'key': return <Key className="w-5 h-5" />;
      case 'message-square': return <MessageSquare className="w-5 h-5" />;
      case 'share-2': return <Share2 className="w-5 h-5" />;
      case 'terminal': return <Terminal className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-mono text-xs animate-fade-in">
      {/* Header Banner */}
      <div className="bg-cyber-surface border border-cyber-border rounded-lg p-4 sm:p-6 shadow-terminal relative overflow-hidden">
        <div className="cyber-scanlines absolute inset-0 pointer-events-none opacity-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-cyber-cyan font-bold tracking-wider uppercase text-sm">
                CENTRAL INTELLIGENCE ARCHIVE
              </span>
              <StatusBadge size="xs" variant="cyan">ARCHIVE CORE</StatusBadge>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold uppercase text-cyber-text tracking-wide">
              CASE DOSSIER HISTORY &amp; DETECTIVE METRICS
            </h1>
            <p className="text-cyber-muted text-xs mt-1">
              Review completed investigations, analyze detective performance metrics, and track tactical achievements.
            </p>
          </div>

          {/* Daily Protocol Button */}
          <CyberButton
            variant="secondary"
            size="md"
            icon={Calendar}
            onClick={handleLaunchDaily}
            disabled={dailyLoading}
            className="shadow-neon-cyan shrink-0"
          >
            {dailyLoading ? 'SYNCHRONIZING...' : "TODAY'S DAILY CASE"}
          </CyberButton>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-cyber-red/10 border border-cyber-red text-cyber-red rounded text-xs">
          {actionNotice}
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-cyber-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-cyber-cyan/20 text-cyber-cyan border-b-2 border-cyber-cyan shadow-sm'
              : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>CASE ARCHIVE ({cases.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-cyber-cyan/20 text-cyber-cyan border-b-2 border-cyber-cyan shadow-sm'
              : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>PERFORMANCE STATS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t font-bold transition-all ${
            activeTab === 'achievements'
              ? 'bg-cyber-cyan/20 text-cyber-cyan border-b-2 border-cyber-cyan shadow-sm'
              : 'text-cyber-muted hover:text-cyber-text'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>
            ACHIEVEMENTS ({achievementsData?.unlockedCount ?? 0}/{achievementsData?.totalCount ?? 7})
          </span>
        </button>
      </div>

      {/* Tab 1: CASE ARCHIVE */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-cyber-subsurface p-3 rounded border border-cyber-border">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-cyber-muted" />
              <span className="text-cyber-muted text-[11px]">FILTER STATUS:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-cyber-bg border border-cyber-border rounded px-2.5 py-1 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
              >
                <option value="all">All Investigations</option>
                <option value="active">Active Only</option>
                <option value="completed">Completed Only</option>
              </select>
            </div>

            <div className="text-[11px] text-cyber-muted">
              TOTAL RECORDED: <span className="text-cyber-cyan font-bold">{cases.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-cyber-cyan font-mono animate-pulse">
              RETRIEVING ENCRYPTED DOSSIER ARCHIVES...
            </div>
          ) : cases.length === 0 ? (
            <EmptyState
              title="NO CASE RECORDS FOUND"
              description="No investigation records match the selected filter. Initialize a new case to populate your detective archive."
              actionLabel="INITIALIZE MYSTERY"
              onAction={() => navigate('/create')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map((c) => {
                const isCompleted = c.status === 'completed';
                const isSolved = isCompleted && c.isCorrect;

                return (
                  <div
                    key={c.id}
                    className="p-4 bg-cyber-surface/90 border border-cyber-border hover:border-cyber-cyan/50 rounded-lg transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] text-cyber-muted font-mono">
                          ID: #{c.id?.slice(0, 8)}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <StatusBadge size="xs" variant={c.difficulty === 'hard' ? 'red' : c.difficulty === 'medium' ? 'amber' : 'green'}>
                            {c.difficulty?.toUpperCase()}
                          </StatusBadge>
                          <StatusBadge size="xs" variant={isCompleted ? (isSolved ? 'green' : 'red') : 'cyan'}>
                            {isCompleted ? (isSolved ? 'SOLVED' : 'FAILED') : 'ACTIVE'}
                          </StatusBadge>
                        </div>
                      </div>

                      <h3 className="font-bold text-cyber-text text-sm uppercase line-clamp-1 mb-1">
                        {c.title || c.premise}
                      </h3>

                      <p className="text-[11px] text-cyber-muted line-clamp-2 leading-relaxed">
                        {c.premise}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-cyber-border/60">
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-cyber-muted mb-3">
                        <div>
                          <span className="block text-cyber-muted">EVIDENCE</span>
                          <span className="font-bold text-cyber-green">{c.discoveredClueCount}/{c.totalClues}</span>
                        </div>
                        <div>
                          <span className="block text-cyber-muted">HINTS</span>
                          <span className="font-bold text-cyber-amber">{c.hintsUsed}</span>
                        </div>
                        <div>
                          <span className="block text-cyber-muted">SCORE</span>
                          <span className="font-bold text-cyber-cyan">{isCompleted ? `${c.score} PTS` : 'ACTIVE'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2">
                        {isCompleted ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReplay(c.id)}
                              className="px-2.5 py-1 rounded bg-cyber-subsurface hover:bg-cyber-cyan/10 border border-cyber-border text-[10px] text-cyber-muted hover:text-cyber-cyan transition-colors"
                              title="Start a fresh investigation run with this premise"
                            >
                              REPLAY
                            </button>
                            <Link to={`/results/${c.id}`}>
                              <CyberButton variant="ghost" size="xs" icon={ArrowRight}>
                                VIEW DEBRIEF
                              </CyberButton>
                            </Link>
                          </>
                        ) : (
                          <Link to={`/investigation/${c.id}`}>
                            <CyberButton variant="primary" size="xs" icon={Compass}>
                              RESUME DOSSIER
                            </CyberButton>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: PERFORMANCE STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {stats ? (
            <>
              {/* Primary Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 bg-cyber-surface border border-cyber-cyan/40 rounded-lg text-center">
                  <span className="text-[10px] text-cyber-muted uppercase block mb-1">WIN ACCURACY</span>
                  <span className="text-2xl sm:text-3xl font-display font-bold text-cyber-green">
                    {stats.winRatePercentage}%
                  </span>
                  <span className="text-[10px] text-cyber-muted block mt-1">
                    {stats.totalCasesSolved} / {stats.totalCasesCompleted} Solved
                  </span>
                </div>

                <div className="p-4 bg-cyber-surface border border-cyber-border rounded-lg text-center">
                  <span className="text-[10px] text-cyber-muted uppercase block mb-1">TOTAL ATTEMPTED</span>
                  <span className="text-2xl sm:text-3xl font-display font-bold text-cyber-cyan">
                    {stats.totalCasesAttempted}
                  </span>
                  <span className="text-[10px] text-cyber-muted block mt-1">Investigations</span>
                </div>

                <div className="p-4 bg-cyber-surface border border-cyber-border rounded-lg text-center">
                  <span className="text-[10px] text-cyber-muted uppercase block mb-1">AVERAGE SCORE</span>
                  <span className="text-2xl sm:text-3xl font-display font-bold text-cyber-amber">
                    {stats.averageScore}
                  </span>
                  <span className="text-[10px] text-cyber-muted block mt-1">Points / Case</span>
                </div>

                <div className="p-4 bg-cyber-surface border border-cyber-border rounded-lg text-center">
                  <span className="text-[10px] text-cyber-muted uppercase block mb-1">RECORD HIGH SCORE</span>
                  <span className="text-2xl sm:text-3xl font-display font-bold text-cyber-magenta">
                    {stats.highScore}
                  </span>
                  <span className="text-[10px] text-cyber-muted block mt-1">Peak Operation</span>
                </div>
              </div>

              {/* Secondary Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TerminalPanel
                  title="INVESTIGATION EFFICIENCY"
                  subtitle="TELEMETRY AGGREGATE"
                  badge={<StatusBadge size="xs" variant="cyan">EFFICIENCY</StatusBadge>}
                >
                  <div className="space-y-3 p-1 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
                      <span className="text-cyber-muted">Total Forensic Clues Decrypted:</span>
                      <span className="text-cyber-green font-bold">{stats.totalCluesDiscovered}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
                      <span className="text-cyber-muted">Tactical Hints Consumed:</span>
                      <span className="text-cyber-amber font-bold">{stats.totalHintsUsed}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
                      <span className="text-cyber-muted">Suspect Interrogations Transmitted:</span>
                      <span className="text-cyber-cyan font-bold">{stats.totalInterrogations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyber-muted">Active Cases in Progress:</span>
                      <span className="text-cyber-text font-bold">
                        {Math.max(0, stats.totalCasesAttempted - stats.totalCasesCompleted)}
                      </span>
                    </div>
                  </div>
                </TerminalPanel>

                <TerminalPanel
                  title="DIFFICULTY TIER BREAKDOWN"
                  subtitle="OPERATION TIER ACCURACY"
                  badge={<StatusBadge size="xs" variant="green">BREAKDOWN</StatusBadge>}
                >
                  <div className="space-y-3 p-1 text-xs">
                    {['easy', 'medium', 'hard'].map((tier) => {
                      const data = stats.difficultyBreakdown?.[tier] || { attempted: 0, solved: 0, completed: 0 };
                      const rate = data.completed > 0 ? Math.round((data.solved / data.completed) * 100) : 0;
                      return (
                        <div key={tier} className="pb-2 border-b border-cyber-border/70 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-cyber-text uppercase">{tier} TIER:</span>
                            <span className="text-cyber-cyan font-bold">
                              {data.solved}/{data.completed} Solved ({rate}%)
                            </span>
                          </div>
                          <div className="w-full bg-cyber-bg h-1.5 rounded overflow-hidden">
                            <div
                              className="bg-cyber-cyan h-full transition-all"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TerminalPanel>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-cyber-muted text-xs">
              Zero telemetry records stored. Complete at least one investigation to compute statistics.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="p-3 bg-cyber-subsurface border border-cyber-border rounded flex items-center justify-between">
            <span className="text-cyber-muted text-xs">
              DETECTIVE BADGES UNLOCKED: <span className="text-cyber-cyan font-bold">{achievementsData?.unlockedCount ?? 0}</span> / {achievementsData?.totalCount ?? 7}
            </span>
            <div className="w-32 bg-cyber-bg h-2 rounded overflow-hidden">
              <div
                className="bg-cyber-cyan h-full transition-all"
                style={{ width: `${achievementsData?.completionPercentage ?? 0}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(achievementsData?.achievements || []).map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-lg border transition-all flex items-start space-x-3 ${
                  ach.unlocked
                    ? 'bg-cyber-surface/90 border-cyber-cyan shadow-sm shadow-cyber-cyan/20'
                    : 'bg-cyber-surface/40 border-cyber-border/40 opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-neon-cyan'
                      : 'bg-cyber-bg border-cyber-border text-cyber-muted'
                  }`}
                >
                  {renderBadgeIcon(ach.icon)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-cyber-text text-xs truncate">
                      {ach.title}
                    </h4>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                        ach.unlocked ? 'text-cyber-green bg-cyber-green/10' : 'text-cyber-muted bg-cyber-bg'
                      }`}
                    >
                      {ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
                    </span>
                  </div>

                  <p className="text-[11px] text-cyber-muted leading-relaxed">
                    {ach.description}
                  </p>

                  {ach.unlockedAt && (
                    <span className="text-[9px] text-cyber-cyan/80 block mt-1.5">
                      Earned: {new Date(ach.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
