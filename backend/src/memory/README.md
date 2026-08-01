# AURA Memory Engine — Architecture Specification (Phase 2+)

> **NOTE:** This directory is an architectural placeholder for Phase 2 implementation. No memory engine logic is active during Phase 1.

## Vision

The **AURA Memory Engine** provides the AI Companion with persistent, long-term contextual intelligence across conversations and interactions.

```text
[ User Interaction / Voice / Text ]
                │
                ▼
      [ Contextual Parsing ]
                │
         ┌──────┴──────┐
         ▼             ▼
[ Short-term Memory ]  [ Vector Memory Store ]
(Session State)        (ChromaDB / SQLite VSS / Pinecone)
         │             │
         └──────┬──────┘
                ▼
  [ Relationship Graph Engine ]
  (Entities, Preferences, History)
                │
                ▼
    [ AI Prompt Enrichment ]
```

## Core Planned Components

1. **Short-term Memory (Session Memory):**
   - Stores current conversation context, active emotion state, and temporary user intent.
   - Kept in memory/Redis during active user sessions.

2. **Long-term Episodic Memory:**
   - Vector embeddings (text-embedding-3 / Nomic) of past conversations and facts.
   - Enables semantic retrieval: *"What was the name of the book I mentioned last week?"*

3. **Relationship & Identity Graph:**
   - Tracks facts about the user (hobbies, goals, key relationships, preferences).
   - Dynamically updates as the companion learns more about the user.

4. **Reflection & Summarization Pipeline:**
   - Background job that runs periodically to summarize past chats and consolidate memories.
