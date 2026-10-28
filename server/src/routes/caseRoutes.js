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

// 1. Create a new case
router.post(
  '/',
  validateBody(createCaseSchema),
  caseController.createCase
);

// 2. Retrieve active player-safe case
router.get(
  '/:id',
  validateParams(caseIdParamSchema),
  caseController.getCase
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
