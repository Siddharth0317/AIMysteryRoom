import { GoogleGenAI } from '@google/genai';
import { DIFFICULTY_RULES, ERROR_CODES } from '../constants/gameRules.js';
import { generatedCaseSchema } from '../validators/caseSchemas.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Builds system & user prompt enforcing exact counts and schema constraints
 */
export function buildMysteryPrompt(premise, difficulty) {
  const rules = DIFFICULTY_RULES[difficulty];
  if (!rules) {
    throw new Error(`Invalid difficulty level: ${difficulty}`);
  }

  return `You are a Master Detective and Cyberpunk Mystery Architect.
Generate a solvable, logically sound, and highly immersive murder mystery or cyber-crime investigation case based on the player's premise.

PREMISE: "${premise}"
DIFFICULTY LEVEL: "${difficulty.toUpperCase()}"

STRICT STRUCTURAL REQUIREMENTS:
1. You MUST generate EXACTLY ${rules.suspectCount} suspects. Not more, not less.
2. You MUST generate EXACTLY ${rules.clueCount} clues. Not more, not less.
3. You MUST generate EXACTLY ${rules.maxHints} progressive hints. Not more, not less.
4. Each suspect MUST have:
   - id: unique string like "suspect_1", "suspect_2", etc.
   - name: full name
   - role: occupation or title
   - background: public background
   - motive: plausible motive
   - alibi: stated alibi
5. Each clue MUST have:
   - id: unique string like "clue_1", "clue_2", etc.
   - title: short descriptive title
   - description: detailed player-visible forensic observation
6. Each hint MUST have:
   - id: unique string like "hint_1", "hint_2", etc.
   - text: progressive clue that helps eliminate suspects without naming the culprit directly
7. Exactly ONE suspect is the culprit:
   - culpritId: MUST match one of the suspect IDs (e.g. "suspect_1")
   - solution: detailed explanation of how the crime was committed and how the clues prove the culprit's guilt
8. evidenceMapping: array of objects with "clueId" and "supports" explaining how each clue supports the solution or serves as a fair red herring.

Return ONLY a valid, raw JSON object matching this schema. Do NOT include markdown code blocks, backticks, or explanatory text before or after the JSON.`;
}

/**
 * Cleans potential markdown formatting from raw AI output
 */
export function cleanJsonText(rawText) {
  if (!rawText) return '';
  let cleaned = rawText.trim();
  // Strip ```json and ``` if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Calls Gemini to generate a structured mystery case with validation & bounded retries
 */
export async function generateMysteryCase(premise, difficulty, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Injectable client for unit testing and mock injection
  const client = options.client || (apiKey && apiKey !== 'your_gemini_api_key_here' ? new GoogleGenAI({ apiKey }) : null);

  if (!client) {
    throw new AppError(
      'Gemini API key is not configured or invalid on the backend server.',
      502,
      ERROR_CODES.AI_GENERATION_FAILED
    );
  }

  const prompt = buildMysteryPrompt(premise, difficulty);
  let attempts = 0;
  const maxAttempts = 2; // 1 initial attempt + 1 bounded retry
  let lastError = null;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      let rawText = '';

      // Check if client has interactions.create or models.generateContent
      if (typeof client.models?.generateContent === 'function') {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        rawText = response.text;
      } else if (typeof client.interactions?.create === 'function') {
        const interaction = await client.interactions.create({
          model: modelName,
          input: prompt,
        });
        rawText = interaction.output_text;
      } else {
        throw new Error('Unsupported Gemini SDK client interface.');
      }

      const cleaned = cleanJsonText(rawText);
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        throw new AppError(
          `Gemini output was malformed JSON: ${parseErr.message}`,
          422,
          ERROR_CODES.AI_GENERATION_FAILED
        );
      }

      // Ensure difficulty matches requested
      parsed.difficulty = difficulty;

      // Strict validation with Zod
      const validatedCase = generatedCaseSchema.parse(parsed);

      return {
        ...validatedCase,
        premise,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[AI-MYSTERY-ROOM] Gemini generation attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxAttempts) break;
    }
  }

  // If retries failed, throw safe error
  throw new AppError(
    lastError?.message?.includes('malformed') || lastError?.name === 'ZodError'
      ? `AI case generation failed structural validation: ${lastError.message}`
      : 'Upstream AI generation failed. Please try a different premise or retry.',
    422,
    ERROR_CODES.AI_GENERATION_FAILED
  );
}
