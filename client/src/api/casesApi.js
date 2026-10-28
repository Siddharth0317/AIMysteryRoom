import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
};
