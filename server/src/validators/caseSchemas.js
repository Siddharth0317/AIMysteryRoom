import { z } from 'zod';
import { DIFFICULTY_RULES } from '../constants/gameRules.js';

// HTTP Request Schemas
export const createCaseSchema = z.object({
  premise: z
    .string({ required_error: 'Premise is required' })
    .trim()
    .min(1, 'Premise cannot be empty')
    .max(500, 'Premise must not exceed 500 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Difficulty must be one of: easy, medium, hard' }),
  }),
});

export const accuseSchema = z.object({
  suspectId: z
    .string({ required_error: 'Suspect ID is required' })
    .trim()
    .min(1, 'Suspect ID cannot be empty'),
});

export const caseIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Case ID is required' })
    .trim()
    .min(1, 'Case ID cannot be empty'),
});

export const discoverClueParamSchema = z.object({
  id: z.string().trim().min(1, 'Case ID is required'),
  clueId: z.string().trim().min(1, 'Clue ID is required'),
});

export const interrogateParamSchema = z.object({
  id: z.string().trim().min(1, 'Case ID is required'),
  suspectId: z.string().trim().min(1, 'Suspect ID is required'),
});

export const interrogateBodySchema = z.object({
  question: z
    .string({ required_error: 'Interrogation question is required' })
    .trim()
    .min(1, 'Question cannot be empty')
    .max(300, 'Question must not exceed 300 characters'),
  category: z
    .string()
    .trim()
    .max(50)
    .optional()
    .default('general'),
});

// Interactive Evidence Board Schemas (SPEC.md Section 17.4)
export const boardNodeSchema = z.object({
  id: z.string().trim().min(1, 'Node ID is required'),
  type: z.enum(['clue', 'suspect'], {
    errorMap: () => ({ message: 'Node type must be either "clue" or "suspect"' }),
  }),
  x: z.number().optional().default(0),
  y: z.number().optional().default(0),
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional().default(''),
  isMarked: z.boolean().optional().default(false),
});

export const boardEdgeSchema = z.object({
  id: z.string().trim().min(1, 'Edge ID is required'),
  source: z.string().trim().min(1, 'Source ID is required'),
  target: z.string().trim().min(1, 'Target ID is required'),
  label: z.enum([
    'supports alibi',
    'contradicts statement',
    'possible motive',
    'suspicious link',
    'unverified',
  ], {
    errorMap: () => ({ message: 'Label must be one of: supports alibi, contradicts statement, possible motive, suspicious link, unverified' }),
  }).default('unverified'),
  note: z.string().max(300, 'Edge note cannot exceed 300 characters').optional().default(''),
});

export const saveBoardSchema = z.object({
  nodes: z.array(boardNodeSchema).max(30, 'Cannot exceed 30 nodes on board'),
  edges: z.array(boardEdgeSchema).max(50, 'Cannot exceed 50 connections on board'),
});

// Structural Schemas for Case Generation & Verification
export const suspectSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  background: z.string().trim().min(1),
  motive: z.string().trim().min(1),
  alibi: z.string().trim().min(1),
});

export const clueSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  hintText: z.string().optional(),
});

export const hintSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1),
});

export const evidenceMappingSchema = z.object({
  clueId: z.string().min(1),
  supports: z.string().min(1),
});

export const generatedCaseSchema = z.object({
  title: z.string().trim().min(1),
  story: z.string().trim().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  suspects: z.array(suspectSchema),
  clues: z.array(clueSchema),
  hints: z.array(hintSchema),
  culpritId: z.string().min(1),
  solution: z.string().trim().min(1),
  evidenceMapping: z.array(evidenceMappingSchema).optional(),
}).superRefine((data, ctx) => {
  const rules = DIFFICULTY_RULES[data.difficulty];
  if (!rules) return;

  // Exact counts verification
  if (data.suspects.length !== rules.suspectCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Expected exactly ${rules.suspectCount} suspects for ${data.difficulty} difficulty, got ${data.suspects.length}`,
      path: ['suspects'],
    });
  }

  if (data.clues.length !== rules.clueCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Expected exactly ${rules.clueCount} clues for ${data.difficulty} difficulty, got ${data.clues.length}`,
      path: ['clues'],
    });
  }

  if (data.hints.length !== rules.maxHints) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Expected exactly ${rules.maxHints} hints for ${data.difficulty} difficulty, got ${data.hints.length}`,
      path: ['hints'],
    });
  }

  // Unique ID checks
  const suspectIds = new Set(data.suspects.map(s => s.id));
  if (suspectIds.size !== data.suspects.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Suspect IDs must all be unique',
      path: ['suspects'],
    });
  }

  const clueIds = new Set(data.clues.map(c => c.id));
  if (clueIds.size !== data.clues.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Clue IDs must all be unique',
      path: ['clues'],
    });
  }

  const hintIds = new Set(data.hints.map(h => h.id));
  if (hintIds.size !== data.hints.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Hint IDs must all be unique',
      path: ['hints'],
    });
  }

  // Culprit references an existing suspect
  if (!suspectIds.has(data.culpritId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `culpritId "${data.culpritId}" does not reference an existing suspect`,
      path: ['culpritId'],
    });
  }
});
