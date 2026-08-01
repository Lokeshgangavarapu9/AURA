/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AIStatusMode,
  AIEmotion,
  PersonalityMode,
  ChatMessage,
  CameraState,
  AudioState,
  AppSettings,
  ConversationHistoryItem
} from './types';
import {
  PERSONALITY_MODES,
  INITIAL_CHAT_MESSAGES,
  DEFAULT_SETTINGS,
  SAMPLE_CONVERSATION_HISTORY
} from './utils/mockData';
import { soundFx } from './utils/soundEffects';

import { chatService, sessionService } from './api/index.js';

// Core Components
import { AvatarViewer } from './components/AvatarViewer';
import { TopStatusBar, NavTab } from './components/TopStatusBar';
import { FloatingControlsBar } from './components/FloatingControlsBar';
import { CameraPreviewModal } from './components/CameraPreviewModal';
import { MicrophoneModal } from './components/MicrophoneModal';

// Dedicated Full Pages
import { ProfilePage } from './components/pages/ProfilePage';
import { ChatPage } from './components/pages/ChatPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { SettingsPage } from './components/pages/SettingsPage';

export interface ConversationSessionState {
  sessionId: string | null;
  title: string;
  currentTopic: string;
  messageCount: number;
  startedAt: string;
}

export default function App() {
  // Navigation Routing State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Active Session State (Resets on browser refresh)
  const [activeSession, setActiveSession] = useState<ConversationSessionState>({
    sessionId: null,
    title: 'AURA Conversation',
    currentTopic: 'General',
    messageCount: 0,
    startedAt: new Date().toISOString(),
  });

  // Application State
  const [status, setStatus] = useState<AIStatusMode>('idle');
  const [emotion, setEmotion] = useState<AIEmotion>('happy');
  const [personality, setPersonality] = useState<PersonalityMode>(PERSONALITY_MODES[0]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Audio / Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({
    isMicActive: false,
    isMuted: false,
    volumeLevel: 45,
    audioWaveData: [],
    transcription: ''
  });

  // Camera Vision State
  const [cameraState, setCameraState] = useState<CameraState>({
    isOpen: false,
    isPaused: false,
    facingMode: 'user',
    visionScanning: true,
    detectedObjects: ['User Face', 'Soft Lighting', 'Smile Expression']
  });

  // Microphone stream modal toggle
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);

  // User Inactivity / Idle Auto-Hide State for Home Controls (3 seconds)
  const [isIdle, setIsIdle] = useState(false);

  // Track Mouse Movement and Key Activity to Toggle Idle Mode on Home Page
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsIdle(true);
      }, 3000); // 3 seconds of inactivity
    };

    resetIdleTimer();

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
    };
  }, []);

  // Chat Messages & History
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [historyList, setHistoryList] = useState<ConversationHistoryItem[]>(SAMPLE_CONVERSATION_HISTORY);

  // Sync Web Audio Synth enabled state with settings
  useEffect(() => {
    soundFx.setEnabled(settings.soundFxEnabled);
  }, [settings.soundFxEnabled]);

  // Handle Resuming an Active Session from History Workspace
  const handleResumeSession = async (sessionId?: string) => {
    if (!sessionId) {
      setActiveSession({
        sessionId: null,
        title: 'AURA Conversation',
        currentTopic: 'General',
        messageCount: 0,
        startedAt: new Date().toISOString(),
      });
      setMessages([]);
      setActiveTab('chat');
      return;
    }

    const res = await sessionService.getSessionById(sessionId);
    if (res.success) {
      const { session, messages: thread } = res.data.data;
      setActiveSession({
        sessionId: session.id,
        title: session.title,
        currentTopic: session.currentTopic || 'General',
        messageCount: session.messageCount,
        startedAt: session.createdAt,
      });

      const formattedMsgs: ChatMessage[] = thread.map((m) => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotion: (m.emotion as AIEmotion) || 'neutral',
      }));

      setMessages(formattedMsgs);
    }
    setActiveTab('chat');
  };

  // Handle AI Response Generation via Live Backend ConversationManager
  const triggerAIResponse = async (userPrompt: string) => {
    setStatus('thinking');
    setEmotion('thinking');
    soundFx.playStatusChange('thinking');

    // Send message via chatService, passing active sessionId (if present)
    const result = await chatService.sendMessage(userPrompt, activeSession.sessionId);

    let replyText = `I'm right here with you!`;
    let responseEmotion: AIEmotion = 'neutral';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (result.success) {
      const payload = result.data.data;
      replyText = payload.text;
      responseEmotion = payload.emotion as AIEmotion;

      // Update active session metadata in React state
      setActiveSession((prev) => ({
        ...prev,
        sessionId: payload.sessionId,
        currentTopic: payload.topic,
        messageCount: payload.messageCount,
      }));
    } else {
      replyText = `I heard what you said, but encountered a network issue: ${'error' in result ? result.error : 'Connection error'}`;
      responseEmotion = 'soothing';
    }

    const newAIMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: timeStr,
      emotion: responseEmotion,
    };

    setMessages((prev) => [...prev, newAIMsg]);

    // Enter Speaking State with Lip Sync Animation
    setStatus('speaking');
    setEmotion(responseEmotion);
    setIsSpeaking(true);
    soundFx.playStatusChange('speaking');

    const speechInterval = setInterval(() => {
      soundFx.triggerSpeechBlip();
    }, 160);

    setTimeout(() => {
      clearInterval(speechInterval);
      setIsSpeaking(false);
      setStatus('idle');
      setEmotion('neutral');
      soundFx.playStatusChange('idle');
    }, 3800);
  };

  // Toggle Microphone Realtime Voice
  const handleToggleMic = () => {
    const nextMicActive = !audioState.isMicActive;
    setAudioState((prev) => ({ ...prev, isMicActive: nextMicActive }));

    if (nextMicActive) {
      setStatus('listening');
      setEmotion('curious');
      setIsMicModalOpen(true);
      soundFx.playStatusChange('listening');
    } else {
      setStatus('idle');
      setEmotion('neutral');
      soundFx.playStatusChange('idle');
    }
  };

  // Toggle Camera Vision Window
  const handleToggleCamera = () => {
    setCameraState((prev) => {
      const nextOpen = !prev.isOpen;
      if (nextOpen) {
        setStatus('vision');
        soundFx.playStatusChange('vision');
      } else {
        setStatus('idle');
        soundFx.playStatusChange('idle');
      }
      return { ...prev, isOpen: nextOpen };
    });
  };

  // User Sent Text Message
  const handleSendMessage = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    triggerAIResponse(text);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-paper-cloud paper-grain font-sans text-slate-800 select-none">
      
      {/* Soft Ambient Light Highlights */}
      <div className="pointer-events-none absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-pink-200/40 blur-[130px] rounded-full z-0" />
      <div className="pointer-events-none absolute bottom-[-5%] right-[15%] w-[45%] h-[45%] bg-purple-200/35 blur-[120px] rounded-full z-0" />
      <div className="pointer-events-none absolute top-[30%] left-[35%] w-[400px] h-[400px] bg-amber-100/50 blur-[140px] rounded-full z-0" />

      {/* 1. Background 3D AI Companion Avatar & Interactive Circular Ring (Always rendered softly in background) */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${activeTab !== 'home' ? 'opacity-30 blur-xs pointer-events-none' : 'opacity-100'}`}>
        <AvatarViewer
          status={status}
          emotion={emotion}
          isSpeaking={isSpeaking}
          isListening={status === 'listening'}
          glowColorHex={settings.avatarGlowColor}
        />
      </div>

      {/* 2. Unified Navigation Bar (Home, Chat, History, Profile, Settings) */}
      <TopStatusBar
        activeTab={activeTab}
        isIdle={isIdle}
        onNavigate={(tab) => {
          setActiveTab(tab);
        }}
      />

      {/* 3. Page Views Container */}
      <main className="relative z-10 w-full h-full overflow-y-auto no-scrollbar">
        {/* PAGE 1: HOME */}
        {activeTab === 'home' && (
          <div className="relative w-full h-full">
            {/* Home Floating Controls (Speak, Chat, Camera) */}
            <FloatingControlsBar
              isMicActive={audioState.isMicActive}
              onToggleMic={handleToggleMic}
              isChatOpen={false}
              onToggleChat={() => setActiveTab('chat')}
              isCameraOpen={cameraState.isOpen}
              onToggleCamera={handleToggleCamera}
              isIdle={isIdle}
            />
          </div>
        )}

        {/* PAGE 2: PROFILE */}
        {activeTab === 'profile' && (
          <ProfilePage
            onNavigate={(page) => setActiveTab(page as NavTab)}
          />
        )}

        {/* PAGE 3: CHAT */}
        {activeTab === 'chat' && (
          <ChatPage
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={() => setMessages([])}
            isThinking={status === 'thinking'}
          />
        )}

        {/* PAGE 4: HISTORY WORKSPACE */}
        {activeTab === 'history' && (
          <HistoryPage
            onNavigateToChat={(sessionId) => handleResumeSession(sessionId)}
          />
        )}

        {/* PAGE 5: SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
            onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
          />
        )}
      </main>

      {/* Camera Vision View (Global Overlay) */}
      {cameraState.isOpen && (
        <CameraPreviewModal
          cameraState={cameraState}
          onClose={() => setCameraState((c) => ({ ...c, isOpen: false }))}
          onTogglePause={() => setCameraState((c) => ({ ...c, isPaused: !c.isPaused }))}
          onCaptureFrame={(label) => handleSendMessage(label)}
        />
      )}

      {/* Microphone Stream Modal (Global Overlay) */}
      {isMicModalOpen && (
        <MicrophoneModal
          audioState={audioState}
          onClose={() => setIsMicModalOpen(false)}
          onToggleMute={() => setAudioState((a) => ({ ...a, isMuted: !a.isMuted }))}
          onSimulateVoiceTranscribe={(text) => {
            setAudioState((a) => ({ ...a, transcription: text }));
            handleSendMessage(text);
          }}
        />
      )}
    </div>
  );
}
