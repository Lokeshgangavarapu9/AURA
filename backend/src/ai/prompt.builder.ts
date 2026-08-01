import { SYSTEM_PROMPT } from './prompts/system.prompt.js';
import { PERSONALITY_PROMPT } from './prompts/personality.prompt.js';
import { WorkingMemory } from '../memory/types/index.js';
import { EmotionalContext } from '../emotion/types/index.js';
import { RelationshipContext } from '../relationship/types/index.js';

export interface ChatHistoryItem {
  sender: 'user' | 'ai';
  text: string;
}

export interface PromptBuildInput {
  message: string;
  history?: ChatHistoryItem[];
  workingMemory?: WorkingMemory;
  memoryContext?: string; // Fallback string slot
  emotionalContext?: EmotionalContext;
  relationshipContext?: RelationshipContext;
}

/**
 * Prompt Builder Utility
 * Formats system instructions, personality rules, WorkingMemory, EmotionalContext, RelationshipContext, and history.
 * Pure formatting module — contains zero DB, Prisma, scoring, or Gemini calls.
 */
export class PromptBuilder {
  /**
   * Constructs the full system instruction string
   */
  public static buildSystemInstruction(
    workingMemory?: WorkingMemory,
    rawMemoryContext?: string,
    emotionalContext?: EmotionalContext,
    relationshipContext?: RelationshipContext
  ): string {
    let instruction = `${SYSTEM_PROMPT}\n\n${PERSONALITY_PROMPT}`;

    // 1. Inject Emotional Response Guidance (appears first)
    if (emotionalContext) {
      instruction += `\n\n=== EMOTIONAL RESPONSE GUIDANCE ===\n• User Emotion: ${emotionalContext.primaryEmotion}\n• AI Emotional Stance: ${emotionalContext.aiTone.aiEmotion}\n• Response Delivery Style: ${emotionalContext.aiTone.responseStyle}\n• Guidance: Respond with an ${emotionalContext.aiTone.aiEmotion} tone using a ${emotionalContext.aiTone.responseStyle} delivery style.\n====================================`;
    }

    // 2. Inject Relationship & Personality Directives (appears after emotion)
    if (relationshipContext) {
      const dir = relationshipContext.directive;
      const prof = relationshipContext.communicationProfile;
      const rulesList = dir.rules.map((r) => `• ${r}`).join('\n');

      instruction += `\n\n=== RELATIONSHIP & PERSONALITY DIRECTIVES ===\nRelationship Level: ${relationshipContext.level}\nRelationship Health: ${relationshipContext.metrics.relationshipHealth}/100\nCommunication Profile: Formality: ${prof.preferredFormality}, Response Length: ${prof.preferredResponseLength}, Humor: ${prof.preferredHumor}\n\nDirective Summary: ${dir.summaryPrompt}\n\nPersonality Rules:\n${rulesList}\n\n${dir.safetyNotice}\n=============================================`;
    }

    const formattedMemory = this.formatWorkingMemory(workingMemory) || rawMemoryContext;

    if (formattedMemory) {
      instruction += `\n\n=== RECALLED LONG-TERM MEMORY CONTEXT ===\n${formattedMemory}\n=========================================`;
    }

    return instruction;
  }

  /**
   * Formats WorkingMemory object into token-dense Markdown sections
   */
  public static formatWorkingMemory(wm?: WorkingMemory): string | null {
    if (!wm) return null;

    const sections: string[] = [];

    // 1. User Profile Section
    if (wm.profile) {
      const p = wm.profile;
      const parts: string[] = [];
      if (p.name) parts.push(`Name: ${p.name}`);
      if (p.age) parts.push(`Age: ${p.age}`);
      if (p.occupation) parts.push(`Occupation: ${p.occupation}`);
      if (p.college) parts.push(`College: ${p.college}`);
      if (p.bio) parts.push(`Bio: ${p.bio}`);

      if (parts.length > 0) {
        sections.push(`[USER IDENTITY PROFILE]\n• ${parts.join('\n• ')}`);
      }
    }

    // 2. User Preferences Section
    if (wm.preferences && wm.preferences.length > 0) {
      const prefs = wm.preferences.map((p) => `• ${p.key}: ${p.value}`).join('\n');
      sections.push(`[KNOWN PREFERENCES]\n${prefs}`);
    }

    // 3. User Goals Section
    if (wm.goals && wm.goals.length > 0) {
      const goals = wm.goals.map((g) => `• ${g.key}: ${g.value}`).join('\n');
      sections.push(`[ACTIVE GOALS]\n${goals}`);
    }

    // 4. Relationships Section
    if (wm.relationships && wm.relationships.length > 0) {
      const rels = wm.relationships.map((r) => `• ${r.key}: ${r.value}`).join('\n');
      sections.push(`[RELATIONSHIPS & FAMILY]\n${rels}`);
    }

    // 5. General Facts Section
    if (wm.facts && wm.facts.length > 0) {
      const facts = wm.facts.map((f) => `• ${f.key}: ${f.value}`).join('\n');
      sections.push(`[RELEVANT FACTS]\n${facts}`);
    }

    // 6. Recent Reflections
    if (wm.recentReflections && wm.recentReflections.length > 0) {
      const refs = wm.recentReflections.map((r) => `• ${r.summary}`).join('\n');
      sections.push(`[RECENT REFLECTIONS]\n${refs}`);
    }

    return sections.length > 0 ? sections.join('\n\n') : null;
  }

  /**
   * Formats conversation history into clean exchange lines
   */
  public static buildContents(input: PromptBuildInput): string {
    const lines: string[] = [];

    if (input.history && input.history.length > 0) {
      // Limit history to last 10 messages for token efficiency
      const recentHistory = input.history.slice(-10);
      for (const item of recentHistory) {
        const roleName = item.sender === 'user' ? 'User' : 'Shizuka';
        lines.push(`${roleName}: ${item.text}`);
      }
    }

    lines.push(`User: ${input.message}`);
    lines.push('Shizuka:');

    return lines.join('\n');
  }
}
