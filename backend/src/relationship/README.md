# AURA Relationship & Personalization Engine (Phase 4.2)

## Overview
The **Relationship & Personalization Engine** models the long-term interpersonal relationship and personalized communication adaptations between AURA and the user across weeks and months.

Operating alongside the **Memory Engine** (Phase 2) and **Emotion Engine** (Phase 4), it tracks:
- **Trust Score** (0 to 100) & **Affinity Score** (0 to 100)
- **Relationship Health** (0 to 100)
- **Relationship Signals** (Curiosity, Gratitude, Openness, Engagement, Humor, Respect, Dependence)
- **UserCommunicationProfile** (Formality, Verbosity, Humor, Technical Depth, Emojis)
- **Extensible Milestones** (Categorized by conversation, relationship, memory, emotion, goal, achievement)
- **Append-Only Relationship Events** (`deep_conversation`, `vulnerability`, `long_absence`, `milestone`)
- **Relationship Levels** (`stranger`, `acquaintance`, `companion`, `close_friend`, `confidant`)
- **Safety Boundaries** (Professional, Romantic, Medical, Financial, Mental Health)

---

## Folder Structure
```text
backend/src/relationship/
├── types/
│   └── index.ts                 # Domain interfaces & contracts (includes IRelationshipRepository)
├── config/
│   └── relationship.config.ts   # Deterministic thresholds & weight bounds
├── metrics/                     # Evaluator strategies (Trust, Affinity, Health, Signals)
├── profile/                     # UserCommunicationProfile model & preference tracker
├── lifecycle/                   # Level calculator, append-only event tracker & milestone tracker
├── weight/                      # W_rel relationship weight calculator (0.8 - 1.3)
├── adapter/                     # PersonalityAdapter mapping metrics -> PersonalityDirective
├── context/                     # Pure builder for immutable RelationshipContext v1
├── analyzer/                    # Master public facade facade (RelationshipAnalyzer)
└── index.ts                     # Module barrel export
```

---

## Architectural Boundaries & Principles
1. **100% Domain-Pure**: Contains 0 Prisma, 0 SQLite, 0 Gemini, 0 Express, and 0 React imports.
2. **Stateless PersonalityDirective**: Generated dynamically every turn; never stored in a database.
3. **Immutable Append-Only Events**: `RelationshipEvent` records are historical facts. Never edited, never deleted.
4. **Read-Only RelationshipContext**: `RelationshipContext` is an immutable, frozen snapshot value object.
5. **Abstract Repository Interface**: `IRelationshipRepository` defines storage contracts without coupling to database drivers.
6. **Pure Deterministic Function Flow**: `RelationshipAnalyzer` accepts input state, computes metrics, and returns the next state and context payload without performing database side effects.
