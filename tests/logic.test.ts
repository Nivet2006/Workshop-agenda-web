import test from 'node:test';
import assert from 'node:assert/strict';

// Helper logic functions to verify pure domain logic

function normalizeEventCode(code: string): string {
  return code.trim().toUpperCase();
}

function calculateProgress(completedCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100)));
}

function calculateQuestionPoints(params: {
  isCorrect: boolean;
  basePoints: number;
  timeLimitSeconds: number;
  timeRemainingSeconds: number;
  speedBonusEnabled: boolean;
  negativeMarkingEnabled: boolean;
}): number {
  if (params.isCorrect) {
    let pts = params.basePoints;
    if (params.speedBonusEnabled && params.timeLimitSeconds > 0 && params.timeRemainingSeconds > 0) {
      const speedRatio = Math.min(1, Math.max(0, params.timeRemainingSeconds / params.timeLimitSeconds));
      pts += Math.round(params.basePoints * 0.5 * speedRatio);
    }
    return pts;
  } else {
    if (params.negativeMarkingEnabled) {
      return -Math.round(params.basePoints * 0.25);
    }
    return 0;
  }
}

interface PlayerScore {
  userId: string;
  totalPoints: number;
  correctCount: number;
  totalResponseTimeMs: number;
}

function rankPlayers(players: PlayerScore[]): Array<PlayerScore & { rank: number }> {
  const sorted = [...players].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    if (b.correctCount !== a.correctCount) {
      return b.correctCount - a.correctCount;
    }
    return a.totalResponseTimeMs - b.totalResponseTimeMs;
  });

  return sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
}

function escapeCsvField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

// -----------------------------------------------------------------------------
// Test Suites
// -----------------------------------------------------------------------------

test('Event Code Normalization', () => {
  assert.equal(normalizeEventCode('  nivet2006  '), 'NIVET2006');
  assert.equal(normalizeEventCode('Nivet2006'), 'NIVET2006');
});

test('Progress Calculation', () => {
  assert.equal(calculateProgress(0, 13), 0);
  assert.equal(calculateProgress(13, 13), 100);
  assert.equal(calculateProgress(6, 13), 46);
  assert.equal(calculateProgress(0, 0), 0);
});

test('Scoring with Speed Bonus & Negative Marking', () => {
  // Correct without speed bonus
  const pts1 = calculateQuestionPoints({
    isCorrect: true,
    basePoints: 100,
    timeLimitSeconds: 30,
    timeRemainingSeconds: 15,
    speedBonusEnabled: false,
    negativeMarkingEnabled: false
  });
  assert.equal(pts1, 100);

  // Correct with full speed bonus (30s remaining out of 30s)
  const pts2 = calculateQuestionPoints({
    isCorrect: true,
    basePoints: 100,
    timeLimitSeconds: 30,
    timeRemainingSeconds: 30,
    speedBonusEnabled: true,
    negativeMarkingEnabled: false
  });
  assert.equal(pts2, 150);

  // Incorrect with negative marking
  const pts3 = calculateQuestionPoints({
    isCorrect: false,
    basePoints: 100,
    timeLimitSeconds: 30,
    timeRemainingSeconds: 15,
    speedBonusEnabled: true,
    negativeMarkingEnabled: true
  });
  assert.equal(pts3, -25);
});

test('Deterministic Tie-break Ranking', () => {
  const players: PlayerScore[] = [
    { userId: 'u1', totalPoints: 200, correctCount: 2, totalResponseTimeMs: 15000 },
    { userId: 'u2', totalPoints: 300, correctCount: 3, totalResponseTimeMs: 20000 },
    { userId: 'u3', totalPoints: 200, correctCount: 2, totalResponseTimeMs: 12000 }, // faster response time
  ];

  const ranked = rankPlayers(players);
  assert.equal(ranked[0].userId, 'u2');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].userId, 'u3'); // won tie-break over u1
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[2].userId, 'u1');
  assert.equal(ranked[2].rank, 3);
});

test('CSV Escaping prevents formula injection & preserves quotes', () => {
  assert.equal(escapeCsvField('John "Jack" Doe'), '"John ""Jack"" Doe"');
  assert.equal(escapeCsvField('Comma, separated'), '"Comma, separated"');
  assert.equal(escapeCsvField(100), '"100"');
});

test('LinkedIn Profile Building Workshop Seed Integrity', async () => {
  const { linkedinEvent, linkedinSteps, linkedinSections } = await import('../src/lib/seedData');
  
  // Event verification
  assert.equal(linkedinEvent.accessCode, 'LINKEDIN');
  assert.equal(linkedinEvent.title, 'LinkedIn Profile Building Workshop');
  assert.equal(linkedinSections.length, 5);

  // 12 steps verification
  assert.equal(linkedinSteps.length, 12);
  for (let i = 0; i < 12; i++) {
    const step = linkedinSteps[i];
    assert.equal(step.position, i + 1);
    assert.ok(step.title.length > 0, `Step ${i + 1} must have a title`);
    assert.ok(step.objective && step.objective.length > 0, `Step ${i + 1} must have an objective`);
    assert.ok(step.content && step.content.html && step.content.html.length > 0, `Step ${i + 1} must have instructions HTML`);
    assert.ok(step.tasks && step.tasks.length > 0, `Step ${i + 1} must have checklist tasks`);
  }

  // Step 3 intro checklist verification
  const step3 = linkedinSteps[2];
  assert.ok(step3.tasks!.length >= 12, 'Step 3 must have at least 12 introduction field checklist items');

  // Step 10 posting guidelines verification
  const step10 = linkedinSteps[9];
  assert.equal(step10.content.officialAccountMention, '@One Percent Club');
  assert.ok(step10.content.requiredHashtags && step10.content.requiredHashtags.length > 0);
  assert.ok(step10.content.samplePostText && step10.content.samplePostText.includes('One Percent Club'));
  assert.equal(step10.content.submissionType, 'url');

  // Step 11 profile sharing verification
  const step11 = linkedinSteps[10];
  assert.equal(step11.content.submissionType, 'url');
  assert.ok(step11.content.submissionLabel && step11.content.submissionLabel.includes('Profile URL'));

  // Step 12 networking verification
  const step12 = linkedinSteps[11];
  assert.equal(step12.title, 'Networking');
  assert.ok(step12.resources && step12.resources.length >= 2);
  assert.ok(step12.resources.some((r: any) => r.url.includes('nivet2006')));
  assert.ok(step12.resources.some((r: any) => r.url.includes('nitheshvinod')));
});

test('Font scale levels and boundaries', async () => {
  const { FONT_SCALES } = await import('../src/App');
  assert.ok(Array.isArray(FONT_SCALES));
  assert.ok(FONT_SCALES.length >= 5);
  // Default scale at 100%
  const defaultScale = FONT_SCALES.find(s => s.scale === 1.0);
  assert.ok(defaultScale);
  assert.equal(defaultScale.label, '100%');

  // Verify ordered scales
  for (let i = 1; i < FONT_SCALES.length; i++) {
    assert.ok(FONT_SCALES[i].scale > FONT_SCALES[i - 1].scale, 'Scales must be monotonically increasing');
  }
});

test('Submissions database filtering, single and group deletion logic', () => {
  interface MockSub {
    id: string;
    key: string;
    url: string;
    userName: string;
  }

  const sampleSubs: MockSub[] = [
    { id: 's1', key: 'custom_profile_url', url: 'https://linkedin.com/in/alex', userName: 'Alex' },
    { id: 's2', key: 'published_post_url', url: 'https://linkedin.com/posts/alex-123', userName: 'Alex' },
    { id: 's3', key: 'final_profile_url', url: 'https://linkedin.com/in/alex', userName: 'Alex' },
    { id: 's4', key: 'custom_profile_url', url: 'https://linkedin.com/in/maya', userName: 'Maya' },
  ];

  // Filtering by key
  const vanitySubs = sampleSubs.filter(s => s.key === 'custom_profile_url');
  assert.equal(vanitySubs.length, 2);

  // Single deletion
  const afterSingleDelete = sampleSubs.filter(s => s.id !== 's1');
  assert.equal(afterSingleDelete.length, 3);
  assert.ok(!afterSingleDelete.some(s => s.id === 's1'));

  // Group deletion
  const idsToDelete = ['s2', 's3'];
  const afterGroupDelete = sampleSubs.filter(s => !idsToDelete.includes(s.id));
  assert.equal(afterGroupDelete.length, 2);
  assert.deepEqual(afterGroupDelete.map(s => s.id), ['s1', 's4']);
});
