# AI Memory Specification & Projection View

## Overview
**AI Memory** is a dynamic projection view generated from SQLite (`MemoryFact`, `UserProfile`). It represents the compact, token-optimized context structured specifically for **Google AI Studio Gemini API** consumption during prompt building.

---

## Key Characteristics
- **Token Density**: Formatted as key-value pairs or concise bullet points to minimize token usage.
- **Scored Relevance**: Evaluated via composite relevance scoring ($S = w_1 I + w_2 R + w_3 F + w_4 E$).
- **Structured Types**: Includes category tags (`fact`, `preference`, `goal`, `relationship`, `knowledge`).
- **No File Duplication**: Generated on-demand from SQLite; not stored as loose JSON files.

---

## Schema Projection Example

```json
{
  "profile": {
    "name": "Alex",
    "occupation": "Software Engineer",
    "college": "Stanford University"
  },
  "facts": [
    { "category": "preference", "key": "Favorite Beverage", "value": "Matcha Latte", "score": 9.2 },
    { "category": "goal", "key": "Daily Habit", "value": "Meditate 10 mins", "score": 8.5 }
  ]
}
```
