import React from 'react';
import { Mic, MessageSquare, Camera } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface FloatingControlsBarProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isCameraOpen: boolean;
  onToggleCamera: () => void;
  isIdle?: boolean;
}

export const FloatingControlsBar: React.FC<FloatingControlsBarProps> = ({
  isMicActive,
  onToggleMic,
  isChatOpen,
  onToggleChat,
  isCameraOpen,
  onToggleCamera,
  isIdle = false
}) => {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-3.5 transition-all duration-500 ease-in-out ${
        isIdle ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 pointer-events-auto translate-y-0'
      }`}
    >
      {/* 🎤 Speak Button */}
      <button
        onClick={() => {
          soundFx.playMicToggle(!isMicActive);
          onToggleMic();
        }}
        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-xs sm:text-sm glass-button cursor-pointer ${
          isMicActive
            ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-300/50 scale-105'
            : 'text-slate-700 hover:text-rose-600'
        }`}
      >
        <Mic className={`w-4 h-4 ${isMicActive ? 'animate-pulse text-white' : 'text-rose-500'}`} />
        <span>Speak</span>
      </button>

      {/* 💬 Chat Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onToggleChat();
        }}
        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-xs sm:text-sm glass-button cursor-pointer ${
          isChatOpen
            ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-300/50 scale-105'
            : 'text-slate-700 hover:text-pink-600'
        }`}
      >
        <MessageSquare className={`w-4 h-4 ${isChatOpen ? 'text-white' : 'text-pink-500'}`} />
        <span>Chat</span>
      </button>

      {/* 📷 Camera Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onToggleCamera();
        }}
        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full font-medium text-xs sm:text-sm glass-button cursor-pointer ${
          isCameraOpen
            ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-300/50 scale-105'
            : 'text-slate-700 hover:text-purple-600'
        }`}
      >
        <Camera className={`w-4 h-4 ${isCameraOpen ? 'text-white' : 'text-purple-500'}`} />
        <span>Camera</span>
      </button>
    </div>
  );
};
