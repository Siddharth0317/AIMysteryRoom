import { DIFFICULTY_RULES } from '../constants/gameRules.js';
import { cleanJsonText } from './geminiService.js';

/**
 * AI Mystery Consistency Validator
 * Validates structural completeness, reference integrity, timeline consistency,
 * evidence sufficiency, culprit support, and zero solution leakage.
 * Strictly compliant with SPEC.md Section 17.2.
 */

// Patterns indicating accidental solution leakage in player-facing text
const LEAKAGE_PATTERNS = [
  /\bthe culprit is\b/i,
  /\bthe killer is\b/i,
  /\bthe perpetrator is\b/i,
  /\bthe thief is\b/i,
  /\bguilty party is\b/i,
  /\bcommitted the crime because\b/i,
  /\bsecret solution:\b/i,
  /\bconfessed to the crime\b/i,
];

/**
 * Runs deterministic checks on a mystery case object
 */
export function runDeterministicChecks(caseData) {
  const issues = [];
  const checks = {
    structure: true,
    references: true,
    timeline: true,
    evidenceSufficiency: true,
    difficulty: true,
    solutionLeakage: true,
  };

  const difficulty = caseData?.difficulty;
  const rules = DIFFICULTY_RULES[difficulty];

  // 1. Difficulty & Structural Counts
  if (!rules) {
    checks.difficulty = false;
    issues.push(`Invalid or missing difficulty: "${difficulty}"`);
  } else {
    const suspectCount = caseData.suspects?.length || 0;
    const clueCount = caseData.clues?.length || 0;
    const hintCount = caseData.hints?.length || 0;

    if (suspectCount !== rules.suspectCount) {
      checks.structure = false;
      checks.difficulty = false;
      issues.push(`Expected exactly ${rules.suspectCount} suspects for ${difficulty}, got ${suspectCount}`);
    }

    if (clueCount !== rules.clueCount) {
      checks.structure = false;
      checks.difficulty = false;
      issues.push(`Expected exactly ${rules.clueCount} clues for ${difficulty}, got ${clueCount}`);
    }

    if (hintCount !== rules.maxHints) {
      checks.structure = false;
      checks.difficulty = false;
      issues.push(`Expected exactly ${rules.maxHints} hints for ${difficulty}, got ${hintCount}`);
    }
  }

  // 2. Identifier Uniqueness
  const suspects = Array.isArray(caseData.suspects) ? caseData.suspects : [];
  const clues = Array.isArray(caseData.clues) ? caseData.clues : [];
  const hints = Array.isArray(caseData.hints) ? caseData.hints : [];

  const suspectIds = new Set();
  for (const s of suspects) {
    if (!s.id) {
      checks.structure = false;
      issues.push('Suspect is missing an "id" field');
    } else if (suspectIds.has(s.id)) {
      checks.structure = false;
      issues.push(`Duplicate suspect ID detected: "${s.id}"`);
    } else {
      suspectIds.add(s.id);
    }
  }

  const clueIds = new Set();
  for (const c of clues) {
    if (!c.id) {
      checks.structure = false;
      issues.push('Clue is missing an "id" field');
    } else if (clueIds.has(c.id)) {
      checks.structure = false;
      issues.push(`Duplicate clue ID detected: "${c.id}"`);
    } else {
      clueIds.add(c.id);
    }
  }

  const hintIds = new Set();
  for (const h of hints) {
    if (!h.id) {
      checks.structure = false;
      issues.push('Hint is missing an "id" field');
    } else if (hintIds.has(h.id)) {
      checks.structure = false;
      issues.push(`Duplicate hint ID detected: "${h.id}"`);
    } else {
      hintIds.add(h.id);
    }
  }

  // 3. Reference Integrity: Culprit reference
  const culpritId = caseData.culpritId;
  const culprit = suspects.find((s) => s.id === culpritId);

  if (!culpritId) {
    checks.references = false;
    issues.push('Case is missing a "culpritId"');
  } else if (!culprit) {
    checks.references = false;
    issues.push(`culpritId "${culpritId}" does not reference an existing suspect`);
  }

  // 4. Reference Integrity: Evidence mapping references
  const evidenceMapping = Array.isArray(caseData.evidenceMapping) ? caseData.evidenceMapping : [];
  for (const mapping of evidenceMapping) {
    if (!clueIds.has(mapping.clueId)) {
      checks.references = false;
      issues.push(`evidenceMapping references non-existent clueId "${mapping.clueId}"`);
    }
  }

  // 5. Culprit Integrity & Evidence Sufficiency
  const solution = caseData.solution || '';
  if (!solution.trim()) {
    checks.evidenceSufficiency = false;
    issues.push('Case solution is empty or missing');
  } else if (culprit) {
    // Check that solution mentions the culprit's ID or name
    const culpritNameLower = culprit.name ? culprit.name.toLowerCase() : '';
    const culpritIdLower = culprit.id.toLowerCase();
    const solutionLower = solution.toLowerCase();

    const mentionsCulprit =
      solutionLower.includes(culpritIdLower) ||
      (culpritNameLower && solutionLower.includes(culpritNameLower));

    if (!mentionsCulprit) {
      checks.evidenceSufficiency = false;
      issues.push(
        `Solution does not clearly identify or explain the culpability of intended culprit "${culprit.name}" (${culprit.id})`
      );
    }
  }

  // Check evidence linkage: at least one clue or evidence mapping supports solving the mystery
  if (evidenceMapping.length > 0 && culprit) {
    const supportsCulprit = evidenceMapping.some((m) => {
      const text = (m.supports || '').toLowerCase();
      return (
        text.includes(culprit.id.toLowerCase()) ||
        (culprit.name && text.includes(culprit.name.toLowerCase())) ||
        text.includes('culprit') ||
        text.includes('alibi') ||
        text.includes('guilt')
      );
    });

    if (!supportsCulprit) {
      checks.evidenceSufficiency = false;
      issues.push('No evidenceMapping entries link discovered clues to the culpability of the designated culprit');
    }
  }

  // 6. Contradictory Clues & Impossible Alibi Integrity
  // Check if any clue description explicitly proves the culprit was completely impossible / innocent
  if (culprit) {
    const culpritNameLower = culprit.name?.toLowerCase() || '';
    for (const clue of clues) {
      const descLower = (clue.description || '').toLowerCase();
      // If a clue asserts 100% indisputable innocence for the culprit without qualification
      if (
        (descLower.includes(culpritNameLower) || descLower.includes(culprit.id.toLowerCase())) &&
        (descLower.includes('conclusively ruled out') ||
         descLower.includes('physically impossible for them to have committed') ||
         descLower.includes('ironclad alibi confirmed genuine'))
      ) {
        checks.evidenceSufficiency = false;
        checks.timeline = false;
        issues.push(
          `Clue "${clue.id}" contains an absolute exoneration contradiction for the intended culprit "${culprit.name}"`
        );
      }
    }
  }

  // 7. Solution Leakage Scan in Player-Facing Text
  const playerFacingTexts = [
    caseData.story || '',
    ...clues.map((c) => `${c.title} ${c.description}`),
    ...hints.map((h) => h.text),
  ];

  for (const text of playerFacingTexts) {
    for (const pattern of LEAKAGE_PATTERNS) {
      if (pattern.test(text)) {
        checks.solutionLeakage = false;
        issues.push(`Player-facing text contains explicit solution leakage: "${text.slice(0, 50)}..."`);
        break;
      }
    }
    // Also check if player-facing text explicitly names culprit as culprit
    if (culprit?.name && text.toLowerCase().includes(`${culprit.name.toLowerCase()} is the culprit`)) {
      checks.solutionLeakage = false;
      issues.push(`Player-facing text directly names "${culprit.name}" as the culprit`);
    }
  }

  const isValid = issues.length === 0 && Object.values(checks).every(Boolean);

  return {
    valid: isValid,
    checks,
    issues,
    repairAttempted: false,
  };
}

/**
 * Optional Semantic Review using Gemini
 * Receives the full private case and returns structured findings.
 * Strictly advisory; deterministic checks take precedence.
 */
export async function runSemanticReview(caseData, client, options = {}) {
  const modelName = options.modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = `You are a Lead Forensic Auditor and Mystery Game Consistency Validator.
Analyze the following detective mystery case for logical consistency, fairness, and solvability:

CASE TITLE: "${caseData.title}"
STORY: "${caseData.story}"
SUSPECTS:
${JSON.stringify(caseData.suspects, null, 2)}
CLUES:
${JSON.stringify(caseData.clues, null, 2)}
INTENDED CULPRIT: "${caseData.culpritId}"
SOLUTION: "${caseData.solution}"
EVIDENCE MAPPING:
${JSON.stringify(caseData.evidenceMapping || [], null, 2)}

EVALUATION CRITERIA:
1. Is the intended culprit logically supported by the clues?
2. Are there contradictory clues that make the case impossible to solve fairly?
3. Is the timeline coherent?
4. Do any player-facing clues or hints accidentally reveal the answer outright?

Return ONLY a valid JSON object in this exact format:
{
  "consistent": true,
  "timelineValid": true,
  "evidenceSufficient": true,
  "solutionLeakage": false,
  "issues": []
}`;

  try {
    let rawText = '';
    if (typeof client.models?.generateContent === 'function') {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temperature for factual audit
        },
      });
      rawText = response.text;
    } else if (typeof client.interactions?.create === 'function') {
      const interaction = await client.interactions.create({
        model: modelName,
        input: prompt,
      });
      rawText = interaction.output_text;
    }

    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      consistent: parsed.consistent !== false,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    };
  } catch (err) {
    // Graceful fallback: do not crash on semantic review failures
    return {
      success: false,
      consistent: true, // Non-fatal fallback
      error: err.message,
    };
  }
}

/**
 * Main Validator Entrypoint
 * Executes deterministic checks and optional semantic review
 */
export async function validateMysteryCase(caseData, options = {}) {
  // Step 1: Run deterministic checks
  const result = runDeterministicChecks(caseData);

  // If deterministic checks fail, fail immediately without wasting tokens
  if (!result.valid) {
    return result;
  }

  // Step 2: Run optional semantic review if client provided and enabled
  if (options.client && options.enableSemanticReview !== false) {
    const semantic = await runSemanticReview(caseData, options.client, options);
    if (semantic.success && !semantic.consistent) {
      result.valid = false;
      result.checks.evidenceSufficiency = false;
      result.issues.push(...semantic.issues);
    }
  }

  return result;
}
