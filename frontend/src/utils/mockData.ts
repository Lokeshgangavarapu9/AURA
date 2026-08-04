import { PersonalityMode, ChatMessage, ConversationHistoryItem, AppSettings } from '../types';

export const PERSONALITY_MODES: PersonalityMode[] = [
  {
    id: 'aura-gentle',
    name: 'AURA • Gentle Companion',
    subtitle: 'Warm & Empathetic',
    description: 'A comforting, attentive companion designed for active listening, mindful guidance, and natural conversation.',
    accentColor: '#3b82f6', // blue
    avatarGlow: '#60a5fa',
    systemPrompt: 'You are AURA, a gentle, highly empathetic digital companion. Speak softly, thoughtfully, and warmly.'
  },
  {
    id: 'aura-cyber',
    name: 'AURA • Quantum OS',
    subtitle: 'Analytical & Sci-Fi',
    description: 'Futuristic AI assistant capable of real-time multi-modal analysis, rapid code synthesis, and deep logic.',
    accentColor: '#8b5cf6', // purple
    avatarGlow: '#a78bfa',
    systemPrompt: 'You are AURA OS v4.2, a high-intelligence quantum AI interface. Provide precise, structured, and advanced answers.'
  },
  {
    id: 'aura-creative',
    name: 'AURA • Creative Muse',
    subtitle: 'Imagative & Inspiring',
    description: 'Dynamic brainstorming partner focused on design ideas, storytelling, philosophy, and artistic creation.',
    accentColor: '#06b6d4', // cyan
    avatarGlow: '#22d3ee',
    systemPrompt: 'You are AURA, an imaginative muse. Inspire through rich metaphors, visual ideas, and creative insight.'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Hello, I am **AURA**, your personal AI companion. I am fully active and connected to your interface. How can I assist you or keep you company today?',
    timestamp: '03:14 AM',
    emotion: 'happy'
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Can you give me a quick status check on the system, vision sensors, and audio stream?',
    timestamp: '03:15 AM'
  },
  {
    id: 'msg-3',
    sender: 'ai',
    text: 'All quantum subsystems are operating at peak efficiency! Here is a summary of active hardware links:\n\n* **3D Visual Engine:** 60 FPS WebGL Render active with eye-tracking.\n* **Neural Stream:** Gemini Live API ready (simulated in Stage 1).\n* **Camera Vision:** Hardware frame buffer initialized.\n* **Spatial Audio:** Dual-channel microphone frequency visualizer operational.',
    timestamp: '03:15 AM',
    emotion: 'soothing',
    codeBlock: {
      language: 'json',
      code: '{\n  "system": "AURA OS v4.2",\n  "status": "NOMINAL",\n  "fps": 60,\n  "latency_ms": 12,\n  "avatar_state": "INTERACTIVE_3D"\n}'
    }
  }
];

export const SAMPLE_PROMPT_SUGGESTIONS = [
  'Tell me a soothing story',
  'What can you see in my camera?',
  'Explain quantum computing simply',
  'Write a TypeScript function for smooth damping',
  'How are you feeling right now?'
];

export const SAMPLE_CONVERSATION_HISTORY: ConversationHistoryItem[] = [
  {
    id: 'hist-1',
    title: 'Morning Mindfulness & Systems Check',
    timestamp: 'Today, 03:14 AM',
    messageCount: 3
  },
  {
    id: 'hist-2',
    title: 'Camera Vision & Object Recognition Test',
    timestamp: 'Yesterday, 10:45 PM',
    messageCount: 8
  },
  {
    id: 'hist-3',
    title: 'Philosophical Discussion on AI Consciousness',
    timestamp: 'July 29, 2026',
    messageCount: 14
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  soundFxEnabled: true,
  theme: 'obsidian',
  avatarEyeColor: '#4338ca',
  avatarGlowColor: '#3b82f6',
  cameraSensitivity: 80,
  autoSpeakResponse: true,
  hapticFeedback: true,
  
  fontSize: 'medium',
  animationsEnabled: true,
  memoryEnabled: true,
  autoSave: true,
  longTermMemory: true,
  sensitiveMemory: false,
  reviewBeforeSave: false,
  responseLength: 'medium',
  personality: 'aura-gentle',
  creativity: 70,
  empathy: 90,
  conversationStyle: 'empathic',
  selectedMicrophone: 'default',
  selectedSpeaker: 'default',
  noiseSuppression: true,
  echoCancellation: true,
  selectedCamera: 'default',
  eyeTracking: true,
  gestureTracking: false,
  visionEnabled: true,
  desktopNotifications: true,
  reminderSettings: 'daily',
  notificationSound: true,
  cameraPermission: true,
  microphonePermission: true,
  connectorsEnabled: '[]',
  developerMode: false,
};
