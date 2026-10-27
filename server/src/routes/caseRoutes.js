import express from 'express';
import * as caseController from '../controllers/caseController.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createCaseSchema,
  accuseSchema,
  caseIdParamSchema,
  discoverClueParamSchema,
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

// 5. Submit final accusation
router.post(
  '/:id/accuse',
  validateParams(caseIdParamSchema),
  validateBody(accuseSchema),
  caseController.submitAccusation
);

// 6. Retrieve case verdict and solution (only allowed when completed)
router.get(
  '/:id/result',
  validateParams(caseIdParamSchema),
  caseController.getCaseResult
);

export default router;
