import * as caseService from '../services/caseService.js';
import * as playerProgressService from '../services/playerProgressService.js';
import { evaluateAdaptiveAssistance } from '../services/adaptiveService.js';
import { toPlayerSafeCase } from '../services/caseSerializer.js';

export async function createCase(req, res, next) {
  try {
    const { premise, difficulty } = req.body;
    const caseDoc = await caseService.createCase({ premise, difficulty });
    res.status(201).json({
      case: toPlayerSafeCase(caseDoc),
    });
  } catch (err) {
    next(err);
  }
}

export async function getCase(req, res, next) {
  try {
    const { id } = req.params;
    const caseDoc = await caseService.getCaseById(id);
    res.status(200).json({
      case: toPlayerSafeCase(caseDoc),
    });
  } catch (err) {
    next(err);
  }
}

export async function discoverClue(req, res, next) {
  try {
    const { id, clueId } = req.params;
    const result = await caseService.discoverClue(id, clueId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function requestHint(req, res, next) {
  try {
    const { id } = req.params;
    const result = await caseService.requestHint(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function interrogateSuspect(req, res, next) {
  try {
    const { id, suspectId } = req.params;
    const { question, category } = req.body;
    const result = await caseService.interrogateSuspect(id, suspectId, { question, category });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function submitAccusation(req, res, next) {
  try {
    const { id } = req.params;
    const { suspectId } = req.body;
    const result = await caseService.submitAccusation(id, suspectId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCaseResult(req, res, next) {
  try {
    const { id } = req.params;
    const result = await caseService.getCaseResult(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getBoard(req, res, next) {
  try {
    const { id } = req.params;
    const result = await caseService.getCaseBoard(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function saveBoard(req, res, next) {
  try {
    const { id } = req.params;
    const { nodes, edges } = req.body;
    const result = await caseService.saveCaseBoard(id, { nodes, edges });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCaseAnalysis(req, res, next) {
  try {
    const { id } = req.params;
    const result = await caseService.getPostGameAnalysis(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listCases(req, res, next) {
  try {
    const { limit, status } = req.query;
    const result = await playerProgressService.listPlayerCases({ limit, status });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPlayerStats(req, res, next) {
  try {
    const stats = await playerProgressService.getPlayerStats();
    res.status(200).json({ stats });
  } catch (err) {
    next(err);
  }
}

export async function getPlayerAchievements(req, res, next) {
  try {
    const data = await playerProgressService.getPlayerAchievements();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getDailyCase(req, res, next) {
  try {
    const result = await playerProgressService.getOrCreateDailyCase();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function replayCase(req, res, next) {
  try {
    const { id } = req.params;
    const result = await playerProgressService.replayCase(id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCaseAssistance(req, res, next) {
  try {
    const { id } = req.params;
    const challengeMode = req.query.challengeMode === 'true';
    const caseDoc = await caseService.getCaseById(id);
    const assistance = evaluateAdaptiveAssistance(caseDoc, { challengeMode });
    res.status(200).json(assistance);
  } catch (err) {
    next(err);
  }
}


