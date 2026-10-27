import test from 'node:test';
import assert from 'node:assert';
import { calculateScore } from '../src/services/scoringService.js';

test('Scoring Engine: Correct accusation awards base points + clues - hints', () => {
  // Easy: Base 100, 3 clues (+15), 1 hint (-10) = 105
  const easy = calculateScore({
    difficulty: 'easy',
    isCorrect: true,
    cluesCount: 3,
    hintsCount: 1,
  });
  assert.strictEqual(easy.finalScore, 105);
  assert.strictEqual(easy.basePoints, 100);
  assert.strictEqual(easy.cluesBonus, 15);
  assert.strictEqual(easy.hintsPenalty, 10);

  // Medium: Base 150, 5 clues (+25), 2 hints (-20) = 155
  const medium = calculateScore({
    difficulty: 'medium',
    isCorrect: true,
    cluesCount: 5,
    hintsCount: 2,
  });
  assert.strictEqual(medium.finalScore, 155);

  // Hard: Base 200, 9 clues (+45), 3 hints (-30) = 215
  const hard = calculateScore({
    difficulty: 'hard',
    isCorrect: true,
    cluesCount: 9,
    hintsCount: 3,
  });
  assert.strictEqual(hard.finalScore, 215);
});

test('Scoring Engine: Incorrect accusation awards 0 final points', () => {
  const incorrect = calculateScore({
    difficulty: 'hard',
    isCorrect: false,
    cluesCount: 9,
    hintsCount: 0,
  });
  assert.strictEqual(incorrect.finalScore, 0);
  assert.strictEqual(incorrect.basePoints, 0);
  assert.strictEqual(incorrect.isCorrect, false);
});

test('Scoring Engine: Score minimum boundary is zero (cannot be negative)', () => {
  const zeroFloor = calculateScore({
    difficulty: 'easy',
    isCorrect: true,
    cluesCount: 0,
    hintsCount: 20, // 100 - 200 = -100 -> clamped to 0
  });
  assert.strictEqual(zeroFloor.finalScore, 0);
});

test('Scoring Engine: Invalid difficulty throws error', () => {
  assert.throws(
    () => calculateScore({ difficulty: 'impossible', isCorrect: true }),
    /Invalid difficulty level/
  );
});
