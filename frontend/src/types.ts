export type AIStatusMode = 'idle' | 'listening' | 'thinking' | 'speaking' | 'vision';

export type AIEmotion = 'neutral' | 'happy' | 'thinking' | 'curious' | 'surprised' | 'soothing';

export interface PersonalityMode {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  avatarGlow: string;
  systemPrompt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  emotion?: AIEmotion;
  codeBlock?: {
    language: string;
    code: string;
  };
  visionMeta?: {
    imageUrl?: string;
    objectsDetected?: string[];
  };
}

export interface CameraState {
  isOpen: boolean;
  isPaused: boolean;
  facingMode: 'user' | 'environment';
  visionScanning: boolean;
  detectedObjects: string[];
}

export interface AudioState {
  isMicActive: boolean;
  isMuted: boolean;
  volumeLevel: number; // 0-100
  audioWaveData: number[];
  transcription: string;
}

export interface AppSettings {
  soundFxEnabled: boolean;
  theme: 'obsidian' | 'cyberpunk' | 'minimal';
  avatarEyeColor: string; // hex
  avatarGlowColor: string; // hex
  cameraSensitivity: number;
  autoSpeakResponse: boolean;
  hapticFeedback: boolean;
  
  // Extended Domain Preferences
  fontSize?: string;
  animationsEnabled?: boolean;
  memoryEnabled?: boolean;
  autoSave?: boolean;
  longTermMemory?: boolean;
  sensitiveMemory?: boolean;
  reviewBeforeSave?: boolean;
  responseLength?: string;
  personality?: string;
  creativity?: number;
  empathy?: number;
  conversationStyle?: string;
  selectedMicrophone?: string;
  selectedSpeaker?: string;
  noiseSuppression?: boolean;
  echoCancellation?: boolean;
  selectedCamera?: string;
  eyeTracking?: boolean;
  gestureTracking?: boolean;
  visionEnabled?: boolean;
  desktopNotifications?: boolean;
  reminderSettings?: string;
  notificationSound?: boolean;
  cameraPermission?: boolean;
  microphonePermission?: boolean;
  connectorsEnabled?: string;
  developerMode?: boolean;
}

export interface ConversationHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
}
