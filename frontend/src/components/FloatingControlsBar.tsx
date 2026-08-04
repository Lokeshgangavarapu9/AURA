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
  status?: string;
  isIdle?: boolean;
}

export const FloatingControlsBar: React.FC<FloatingControlsBarProps> = ({
  isMicActive,
  onToggleMic,
  isChatOpen,
  onToggleChat,
  isCameraOpen,
  onToggleCamera,
  status = 'idle',
  isIdle = false
}) => {
  const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
    listening: { label: '🎤 Listening...', bg: 'bg-rose-100/90 border-rose-200', text: 'text-rose-700' },
    understanding: { label: '🧠 Understanding...', bg: 'bg-purple-100/90 border-purple-200', text: 'text-purple-700' },
    thinking: { label: '🤔 Thinking...', bg: 'bg-amber-100/90 border-amber-200', text: 'text-amber-700' },
    speaking: { label: '🗣 Speaking...', bg: 'bg-pink-100/90 border-pink-200', text: 'text-pink-700' },
    vision: { label: '📷 Vision Scanning...', bg: 'bg-indigo-100/90 border-indigo-200', text: 'text-indigo-700' },
    idle: { label: '✨ Ready', bg: 'bg-white/80 border-slate-200/80', text: 'text-slate-600' },
  };

  const activeStatus = statusLabels[status] || statusLabels.idle;

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 transition-all duration-500 ease-in-out ${
        isIdle ? 'opacity-20 pointer-events-none translate-y-2' : 'opacity-100 pointer-events-auto translate-y-0'
      }`}
    >
      {/* Dynamic Runtime Status Badge */}
      <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold shadow-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 ${activeStatus.bg} ${activeStatus.text}`}>
        {activeStatus.label}
      </div>

      {/* Floating Action Buttons */}
      <div className="flex items-center justify-center gap-3.5">
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
    </div>
  );
};
