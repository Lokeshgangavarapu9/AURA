# AURA Emotional Intelligence Engine (Phase 4)

---

## 📌 Purpose
The Emotional Intelligence Engine is AURA's authoritative core module for understanding human emotions, tracking short-term emotional states (mood, stress, engagement, frustration), mapping AI empathetic responses, and outputting versioned `EmotionalContext` payloads.

It operates as a **pure domain module** with **zero direct dependencies** on Prisma, SQLite, Gemini API, Express, or specific UI frameworks.

---

## 📂 Folder Structure & Responsibilities

```text
backend/src/emotion/
├── types/                   # Pure domain contracts, interfaces, and versioned context schemas
├── config/                  # Threshold boundary constants & scoring rules
├── detectors/               # Strategy interface (IEmotionDetector) & detection algorithms
├── tracker/                 # EmotionalStateTracker (Short-term mood, stress, engagement)
├── policy/                  # ResponsePolicy (Maps user emotion -> AI emotion & response style)
├── weight/                  # WeightCalculator (Computes W_e factor for Memory Engine scoring)
├── context/                 # EmotionContextBuilder (Assembles versioned EmotionalContext)
├── analyzer/                # Master EmotionAnalyzer facade
└── README.md                # Module specifications & architectural documentation
```

### Folder Responsibilities:
- **`types/`**: Single source of truth for emotional taxonomy, detector metadata, and context contracts.
- **`config/`**: Centralized threshold rules ($C \ge 0.90$ High, $0.40 \le C < 0.90$ Medium, $C < 0.40$ Low).
- **`detectors/`**: Houses `IEmotionDetector` interface and concrete implementations (`RuleBasedEmotionDetector`).
- **`tracker/`**: Tracks short-term stress, engagement, frustration, and mood trend across conversation turns.
- **`policy/`**: Evaluates detected emotions and decides `AIEmotion` and `ResponseStyle` (e.g. `gentle`, `supportive`).
- **`weight/`**: Computes the **Emotional Weight Factor $W_e$** consumed by the Memory Engine.
- **`context/`**: Builds unified, versioned `EmotionalContext` payloads.
- **`analyzer/`**: Master orchestrator facade unifying detection, policy mapping, tracking, and context creation.

---

## 📊 Data Model Overview

### `EmotionResult`
- `primaryEmotion`: Main detected user emotion.
- `emotions`: Array of `EmotionScore` items representing multi-emotion distribution.
- `reasoning`: Heuristic match explanation.
- `detector`: `DetectorMetadata` (`source`, `confidence`, `processingTimeMs`).

### `AIResponseTone`
- `aiEmotion`: AI internal emotional stance (`empathetic`, `happy`, `thinking`, `calm`, `soothing`).
- `responseStyle`: Response delivery style (`gentle`, `supportive`, `playful`, `focused`, `reassuring`, `patient`).

### `EmotionalContext` (Version 1)
- `version`: `1`
- `primaryEmotion`: Primary user emotion.
- `detectedEmotions`: Full emotion distribution array.
- `aiTone`: Combined `AIEmotionCategory` and `ResponseStyle`.
- `shortTermState`: Short-term `stressLevel`, `engagementLevel`, `frustrationLevel`, `moodTrend`.
- `detectorMetadata`: Detection algorithm provenance and confidence.

---

## 🔌 Integration Points

1. **`ConversationManager`**:
   - Passes input text to `EmotionAnalyzer.analyzeTurn()`.
   - Receives `EmotionalContext` payload and routes to downstream services.

2. **`MemoryEngine`**:
   - Uses `WeightCalculator.calculateWeight()` to get Emotional Weight Factor $W_e$ ($0.5 \le W_e \le 2.0$) for fact scoring:
     $$S = (\text{Importance} \cdot W_e) \cdot \text{Recency} \cdot \text{Frequency}$$

3. **`GeminiService`**:
   - Reads `aiTone.responseStyle` (e.g. `gentle`, `supportive`) and injects dynamic tone instructions into `PromptBuilder`.

4. **`Avatar Engine`**:
   - Reads `aiTone.aiEmotion` to drive real-time 3D VRM facial expression blendshapes.

5. **`Voice Engine`**:
   - Modulates TTS pitch, speech rate, and timbre based on `aiTone.responseStyle`.

---

## 🚀 Future Expansion Plan

- **Phase 4.5**: Introduce Gemini LLM secondary emotion classifier (`GeminiEmotionDetector`) for complex ambiguous prompts ($0.40 \le C < 0.90$).
- **Phase 5**: Plug in `VoiceEmotionDetector` (acoustic pitch analysis) and `VisionEmotionDetector` (facial expression analysis) into a `MultimodalEmotionFusionEngine`.

---

## 📜 Version History
- **v1.0.0 (Phase 4 Step 1)**: Initial pure domain types, threshold configuration, and specification documentation.
