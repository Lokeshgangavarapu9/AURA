/**
 * AURA Memory Engine — Lightweight Memory Importance Detector
 * Sub-millisecond rule-based filter that inspects user messages BEFORE calling LLMs.
 * Prevents redundant Gemini calls for casual greetings, generic questions, or filler chat.
 */

import { MemoryCategory } from '../types/index.js';

export interface MemoryCandidate {
  category: MemoryCategory;
  confidence: number;
  importance: number;
  rawText: string;
}

export interface DetectionResult {
  needsExtraction: boolean;
  candidates: MemoryCandidate[];
}

/** Intent detection patterns for candidate memory statements */
const INTENT_PATTERNS: Array<{
  category: MemoryCategory;
  pattern: RegExp;
  importance: number;
}> = [
  // Identity & Profile
  { category: 'fact', pattern: /\bmy name is\s+([a-z0-9_\s]+)/i, importance: 10 },
  { category: 'fact', pattern: /\bi study at\s+([a-z0-9_\s]+)/i, importance: 8 },
  { category: 'fact', pattern: /\bi work at\s+([a-z0-9_\s]+)/i, importance: 8 },
  { category: 'fact', pattern: /\bi am a\s+([a-z0-9_\s]+)/i, importance: 7 },
  { category: 'fact', pattern: /\bmy birthday is\s+([a-z0-9_\s]+)/i, importance: 9 },

  // Preferences & Likes/Dislikes
  { category: 'preference', pattern: /\bi (love|like|prefer|enjoy|hate|dislike)\s+([a-z0-9_\s]+)/i, importance: 7 },
  { category: 'preference', pattern: /\bmy favorite\s+([a-z0-9_\s]+)\s+is\s+([a-z0-9_\s]+)/i, importance: 8 },

  // Personal Goals
  { category: 'goal', pattern: /\bmy goal is\s+([a-z0-9_\s]+)/i, importance: 8 },
  { category: 'goal', pattern: /\bi want to (learn|achieve|build|finish)\s+([a-z0-9_\s]+)/i, importance: 7 },

  // Relationships & Family
  { category: 'relationship', pattern: /\bi have a (brother|sister|mother|father|wife|husband|son|daughter|dog|cat|pet)\b/i, importance: 9 },
  { category: 'relationship', pattern: /\bmy (brother|sister|mother|father|friend|partner|dog|cat)\s+([a-z0-9_\s]+)/i, importance: 8 },

  // Notable Personal Life Facts
  { category: 'fact', pattern: /\bi bought a\s+([a-z0-9_\s]+)/i, importance: 6 },
  { category: 'fact', pattern: /\bi moved to\s+([a-z0-9_\s]+)/i, importance: 8 },
  { category: 'fact', pattern: /\bi live in\s+([a-z0-9_\s]+)/i, importance: 8 },
];

/** Casual / Filler message patterns that must NEVER trigger extraction */
const CASUAL_PATTERNS = [
  /^(hello|hi|hey|greetings|good morning|good evening|goodnight)\b/i,
  /^(thanks|thank you|cool|awesome|ok|okay|got it|sure|nice)\b/i,
  /^(what|who|where|when|why|how|can you|could you)\s+.*[?]?$/i, // Generic questions
  /^\d+\s*[\+\-\*\/]\s*\d+/, // Math calculations like 2+2
];

export class MemoryDetector {
  /**
   * Fast deterministic check to decide if a message contains personal memory candidates
   */
  public static inspectMessage(userMessage: string): DetectionResult {
    if (!userMessage || userMessage.trim().length < 5) {
      return { needsExtraction: false, candidates: [] };
    }

    const trimmed = userMessage.trim();

    // 1. Immediately ignore casual chatter or simple math/questions
    for (const pattern of CASUAL_PATTERNS) {
      if (pattern.test(trimmed) && !this.containsExplicitSelfReference(trimmed)) {
        return { needsExtraction: false, candidates: [] };
      }
    }

    const candidates: MemoryCandidate[] = [];

    // 2. Evaluate against candidate intent patterns
    for (const item of INTENT_PATTERNS) {
      if (item.pattern.test(trimmed)) {
        candidates.push({
          category: item.category,
          importance: item.importance,
          confidence: 0.85,
          rawText: trimmed,
        });
      }
    }

    return {
      needsExtraction: candidates.length > 0,
      candidates,
    };
  }

  /**
   * Checks if message explicitly contains self-referential markers like "my name", "i study", "i prefer"
   */
  private static containsExplicitSelfReference(text: string): boolean {
    return /\b(my name|i study|i work|my goal|my birthday|my favorite|i prefer)\b/i.test(text);
  }
}
