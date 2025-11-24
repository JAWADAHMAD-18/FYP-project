/*
  nlp.utills.js
  - Deterministic lightweight NLP for English + Urdu travel intent detection
  - Exports `detectIntentAdvanced(text)` which returns:
    { intent: 'package'|'general'|'non-travel'|'ambiguous', location?, tripType?, confidence }

  Notes:
  - This is rule-based and deterministic (no external NLP libs) so behavior is predictable.
  - For robust production usage, replace or augment with a proper NLP/NER model.
*/

const URDU_MAP = {
  honeymoon: ['ہنی مون', 'نئی شادی', 'honeymoon', 'romantic'],
  adventure: ['مہم جوئی', 'ایڈونچر', 'trek', 'adventure', 'rafting', 'bungee'],
  beach: ['سمندر', 'ساحل', 'beach', 'island'],
  top: ['best', 'بہترین', 'top', 'recommend', 'مشورہ']
};

const NON_TRAVEL_KEYWORDS = [
  'covid', 'corona', 'politics', 'stock', 'investment', 'recipe', 'health', 'sex', 'porn', 'tax', 'bank'
];

// Helper: check if any of the keywords exist in text (case-insensitive)
const containsAny = (text, arr) => arr.some(k => text.includes(k));

// Try to extract location using common English/Urdu patterns
const extractLocation = (text) => {
  // Patterns like: to X, in X, visit X, trip to X, package for X, package in X
  const patterns = [
    /(?:to|in|visit|trip to|tour of|for)\s+([A-Z][a-zA-Z\s'\-]+)/i,
    /(?:to|in|visit|trip to|tour of|for)\s+([\p{Script=Arabic}\s\-\u0600-\u06FF]+)/u,
    /package\s+(?:for|in)\s+([A-Z][a-zA-Z\s'\-]+)/i,
    /پیکج\s+([\p{Script=Arabic}\s\-\u0600-\u06FF]+)/u
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1]) {
      return m[1].trim();
    }
  }

  // Try a fallback: last capitalized phrase (English)
  const properNoun = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$/);
  if (properNoun) return properNoun[1].trim();

  return null;
};

// Detect trip type from text using english + urdu keywords
const detectTripType = (text) => {
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(URDU_MAP)) {
    if (containsAny(lower, keywords.map(k => k.toLowerCase()))) return type;
  }
  return null;
};

export const detectIntentAdvanced = (rawText) => {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();

  // Non-travel detection
  if (containsAny(lower, NON_TRAVEL_KEYWORDS)) return { intent: 'non-travel', confidence: 1 };

  // Empty or too short -> ambiguous
  if (!text || text.split('\n').join(' ').split(' ').filter(Boolean).length < 2) {
    return { intent: 'ambiguous', confidence: 0.5 };
  }

  // Extract location if present
  const location = extractLocation(text);

  // Detect explicit package requests: look for keywords
  const packageIndicators = ['package', 'pacakge', 'tour', 'booking', 'book', 'package for', 'package in', 'پیکج'];
  const travelIndicators = ['visit', 'best', 'recommend', 'where to', 'places to', 'top', 'trip', 'سفر', 'دیکھنا'];

  const hasPackage = containsAny(lower, packageIndicators);
  const hasTravel = containsAny(lower, travelIndicators);

  // Trip type (honeymoon/adventure/beach/top)
  const tripType = detectTripType(text);

  if (hasPackage || location) {
    // strong package intent if location found or explicit package words
    return { intent: 'package', location: location || null, tripType: tripType || null, confidence: 0.9 };
  }

  if (hasTravel || tripType) {
    return { intent: 'general', tripType: tripType || null, confidence: 0.8 };
  }

  // Ambiguous fallback
  return { intent: 'ambiguous', confidence: 0.4 };
};

export default { detectIntentAdvanced };
