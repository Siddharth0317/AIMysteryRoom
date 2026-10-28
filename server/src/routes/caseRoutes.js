import express from 'express';
import * as caseController from '../controllers/caseController.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createCaseSchema,
  accuseSchema,
  caseIdParamSchema,
  discoverClueParamSchema,
  interrogateParamSchema,
  interrogateBodySchema,
  saveBoardSchema,
} from '../validators/caseSchemas.js';

const router = express.Router();

// 1. List cases (History / Archive)
router.get(
  '/',
  caseController.listCases
);

// 2. Initialize or retrieve today's Daily Mystery
router.post(
  '/daily',
  caseController.getDailyCase
);

// 3. Player statistics overview
router.get(
  '/stats/overview',
  caseController.getPlayerStats
);

// 4. Player achievements overview
router.get(
  '/achievements/overview',
  caseController.getPlayerAchievements
);

// 5. Create a new case
router.post(
  '/',
  validateBody(createCaseSchema),
  caseController.createCase
);

// 6. Retrieve active player-safe case
router.get(
  '/:id',
  validateParams(caseIdParamSchema),
  caseController.getCase
);

// 7. Adaptive difficulty assistance suggestion (SPEC.md Section 17.5)
router.get(
  '/:id/assistance',
  validateParams(caseIdParamSchema),
  caseController.getCaseAssistance
);

// 8. Replay completed case (creates fresh run without mutating original)
router.post(
  '/:id/replay',
  validateParams(caseIdParamSchema),
  caseController.replayCase
);

// 3. Discover forensic clue
router.post(
  '/:id/clues/:clueId/discover',
  validateParams(discoverClueParamSchema),
  caseController.discoverClue
);

// 4. Request tactical hint
router.post(
  '/:id/hints',
  validateParams(caseIdParamSchema),
  caseController.requestHint
);

// 5. Interrogate suspect
router.post(
  '/:id/suspects/:suspectId/interrogate',
  validateParams(interrogateParamSchema),
  validateBody(interrogateBodySchema),
  caseController.interrogateSuspect
);

// 6. Retrieve player evidence board
router.get(
  '/:id/board',
  validateParams(caseIdParamSchema),
  caseController.getBoard
);

// 7. Save player evidence board
router.put(
  '/:id/board',
  validateParams(caseIdParamSchema),
  validateBody(saveBoardSchema),
  caseController.saveBoard
);

// 8. Submit final accusation
router.post(
  '/:id/accuse',
  validateParams(caseIdParamSchema),
  validateBody(accuseSchema),
  caseController.submitAccusation
);

// 9. Retrieve case verdict and solution (only allowed when completed)
router.get(
  '/:id/result',
  validateParams(caseIdParamSchema),
  caseController.getCaseResult
);

// 10. Retrieve post-game AI analysis (SPEC.md Section 17.6)
router.get(
  '/:id/analysis',
  validateParams(caseIdParamSchema),
  caseController.getCaseAnalysis
);

export default router;
