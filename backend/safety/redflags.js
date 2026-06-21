/**
 * Red-Flag Emergency Detection System
 * ONLY triggers for active, life-threatening emergencies — NOT questions about health topics.
 * The AI handles all health questions directly.
 * 
 * This module is SKIPPED entirely for the 'chat' module (AI Clinic).
 */

const RED_FLAG_KEYWORDS = [
  // Active emergencies ONLY (not questions about these topics)
  'i am having a heart attack',
  'having a heart attack',
  'i can\'t breathe right now',
  'someone is choking',
  'someone is drowning',
  'took an overdose',
  'swallowed poison',
  'i want to kill myself',
  'i am going to kill myself',
  'planning to end my life',
  'i took too many pills',
  'someone is unconscious and not breathing',
  'baby stopped breathing',
  'been stabbed',
  'been shot',
  'i\'ve been shot',
];

const EMERGENCY_RESPONSE = {
  isEmergency: true,
  concernCategory: '🚨 Emergency Detected',
  urgencyLevel: 'CRITICAL',
  whatToDoNow: [
    'Call your local emergency number IMMEDIATELY (e.g., 911, 112, 999, 108).',
    'Stay with the person and keep them calm.',
    'If trained, administer first aid (CPR, pressure on wounds, etc.).',
    'Do NOT give food, water, or medication unless instructed by emergency services.',
    'Unlock the front door so paramedics can enter.',
  ],
  whenToSeeDoctor: 'This situation requires immediate emergency services — call now.',
  detectedKeywords: [],
};

/**
 * Checks user input for active life-threatening emergency phrases.
 * Only matches full crisis phrases — NOT general health questions.
 * Returns null for most inputs so the AI can provide proper guidance.
 */
function checkRedFlags(text) {
  if (!text || typeof text !== 'string') return null;

  const lowerText = text.toLowerCase().trim();
  const detectedFlags = [];

  for (const keyword of RED_FLAG_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      detectedFlags.push(keyword);
    }
  }

  if (detectedFlags.length > 0) {
    return {
      ...EMERGENCY_RESPONSE,
      detectedKeywords: detectedFlags,
    };
  }

  return null;
}

module.exports = { checkRedFlags, RED_FLAG_KEYWORDS };
