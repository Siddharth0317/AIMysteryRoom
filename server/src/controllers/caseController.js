import * as caseService from '../services/caseService.js';
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

