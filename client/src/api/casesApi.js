import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor to unwrap safe error messages
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorPayload = error.response?.data?.error;
    if (errorPayload) {
      const customErr = new Error(errorPayload.message || 'Server request failed');
      customErr.code = errorPayload.code;
      customErr.status = error.response.status;
      return Promise.reject(customErr);
    }
    if (error.code === 'ECONNABORTED') {
      const timeoutErr = new Error('Neural network request timed out. The server or AI model took longer than expected. Please retry.');
      timeoutErr.code = 'TIMEOUT';
      return Promise.reject(timeoutErr);
    }
    if (!error.response) {
      const netErr = new Error('Unable to establish link with the investigation server. Please check your network connection.');
      netErr.code = 'NETWORK_ERROR';
      return Promise.reject(netErr);
    }
    return Promise.reject(error);
  }
);

/**
 * 1. Initialize a new mystery case
 */
export async function createCase(premise, difficulty) {
  const response = await client.post('/api/cases', { premise, difficulty });
  return response.data.case;
}

/**
 * 2. Retrieve an active player-safe case
 */
export async function getCase(id) {
  const response = await client.get(`/api/cases/${id}`);
  return response.data.case;
}

/**
 * 3. Discover a forensic clue
 */
export async function discoverClue(caseId, clueId) {
  const response = await client.post(`/api/cases/${caseId}/clues/${clueId}/discover`);
  return response.data; // { clue, progress }
}

/**
 * 4. Request a progressive tactical hint
 */
export async function requestHint(caseId) {
  const response = await client.post(`/api/cases/${caseId}/hints`);
  return response.data; // { hint, progress }
}

/**
 * 5. Interrogate a suspect
 */
export async function interrogateSuspect(caseId, suspectId, question, category = 'general') {
  const response = await client.post(`/api/cases/${caseId}/suspects/${suspectId}/interrogate`, {
    question,
    category,
  });
  return response.data; // { interactionId, suspectId, answer, remainingQuestions }
}

/**
 * 6. Retrieve player evidence board
 */
export async function getBoard(caseId) {
  const response = await client.get(`/api/cases/${caseId}/board`);
  return response.data; // { board: { nodes, edges } }
}

/**
 * 7. Save player evidence board
 */
export async function saveBoard(caseId, { nodes, edges }) {
  const response = await client.put(`/api/cases/${caseId}/board`, { nodes, edges });
  return response.data; // { board: { nodes, edges } }
}

/**
 * 8. Submit final accusation
 */
export async function submitAccusation(caseId, suspectId) {
  const response = await client.post(`/api/cases/${caseId}/accuse`, { suspectId });
  return response.data; // { verdict, culpritId, culpritName, solution, score, scoreBreakdown }
}

/**
 * 9. Retrieve case result and debrief
 */
export async function getCaseResult(caseId) {
  const response = await client.get(`/api/cases/${caseId}/result`);
  return response.data;
}

/**
 * 10. Retrieve post-game AI analysis (SPEC.md Section 17.6)
 */
export async function getCaseAnalysis(caseId) {
  const response = await client.get(`/api/cases/${caseId}/analysis`);
  return response.data.analysis;
}

/**
 * 11. List cases for history / archive (SPEC.md Section 17.7)
 */
export async function listCases(params = {}) {
  const response = await client.get('/api/cases', { params });
  return response.data; // { cases, totalCount }
}

/**
 * 12. Retrieve detective statistics overview
 */
export async function getPlayerStats() {
  const response = await client.get('/api/stats');
  return response.data.stats;
}

/**
 * 13. Retrieve detective achievements overview
 */
export async function getPlayerAchievements() {
  const response = await client.get('/api/achievements');
  return response.data; // { achievements, unlockedCount, totalCount, completionPercentage }
}

/**
 * 14. Initialize or retrieve today's Daily Mystery (SPEC.md Section 17.8)
 */
export async function getDailyCase() {
  const response = await client.post('/api/cases/daily');
  return response.data; // { dailyDate, isExisting, case }
}

/**
 * 15. Replay an existing completed case without mutating original
 */
export async function replayCase(caseId) {
  const response = await client.post(`/api/cases/${caseId}/replay`);
  return response.data; // { replayedCaseId, case }
}

/**
 * 16. Retrieve adaptive assistance suggestion (SPEC.md Section 17.5)
 */
export async function getCaseAssistance(caseId, challengeMode = false) {
  const response = await client.get(`/api/cases/${caseId}/assistance`, {
    params: { challengeMode: Boolean(challengeMode) },
  });
  return response.data; // { mode, recommendation }
}

export default {
  createCase,
  getCase,
  discoverClue,
  requestHint,
  interrogateSuspect,
  getBoard,
  saveBoard,
  submitAccusation,
  getCaseResult,
  getCaseAnalysis,
  listCases,
  getPlayerStats,
  getPlayerAchievements,
  getDailyCase,
  replayCase,
  getCaseAssistance,
};


