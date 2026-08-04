/**
 * AURA Cognitive Intelligence Engine — WorkingCognitiveContext Workspace
 * Ephemeral reasoning workspace active strictly during a single cognitive planning turn.
 */

import { WorkingCognitiveContext } from '../types/cognitive.types.js';

export class WorkingCognitiveContextManager {
  private activeContext: WorkingCognitiveContext;

  constructor() {
    this.activeContext = this.createEmptyContext();
  }

  public createEmptyContext(): WorkingCognitiveContext {
    return {
      activeAssumptions: [],
      openQuestions: [],
      intermediateReasoning: [],
      temporaryFacts: [],
      selectedEvidence: [],
      planningNotes: [],
    };
  }

  public addAssumption(assumption: string): void {
    this.activeContext.activeAssumptions.push(assumption);
  }

  public addOpenQuestion(question: string): void {
    this.activeContext.openQuestions.push(question);
  }

  public addIntermediateReasoning(note: string): void {
    this.activeContext.intermediateReasoning.push(note);
  }

  public addFact(fact: string): void {
    this.activeContext.temporaryFacts.push(fact);
  }

  public addEvidence(evidence: string): void {
    this.activeContext.selectedEvidence.push(evidence);
  }

  public addPlanningNote(note: string): void {
    this.activeContext.planningNotes.push(note);
  }

  public getContextSnapshot(): WorkingCognitiveContext {
    return JSON.parse(JSON.stringify(this.activeContext));
  }

  /**
   * Destroys context workspace after cognitive turn completion.
   */
  public clear(): void {
    this.activeContext = this.createEmptyContext();
  }
}
