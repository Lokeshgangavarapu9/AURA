# Human Memory Specification & Projection View

## Overview
**Human Memory** is a human-readable projection view generated from SQLite (`MemoryFact`, `UserProfile`, `Reflection`). It structures raw data into readable markdown notes, timelines, and profile cards for user inspection in the frontend UI.

---

## Key Characteristics
- **Human-Readable Format**: Markdown summaries, user-friendly cards, timelines.
- **UI Inspection Ready**: Rendered in the AURA companion frontend Memory tab.
- **Single Source of Truth**: Evaluated dynamically from SQLite without duplicating data.

---

## Projection Example

### User Profile Card
- **Name**: Alex
- **College**: Stanford University
- **Occupation**: Software Engineer

### Preferences & Goals
- 🍵 **Drinks**: Prefers Matcha Latte
- 🎯 **Active Goal**: Meditate 10 minutes daily

### Chronological Timeline
- *2026-08-01*: Mentioned starting a new React project.
- *2026-08-02*: Shared goal of daily meditation.
