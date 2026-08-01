import React from 'react';
import { X, User, Heart, Sparkles, Calendar, Shield, Award } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl border border-white/80 text-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Your Companion Profile</h3>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="flex flex-col items-center text-center py-2 space-y-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-300 via-rose-200 to-purple-300 p-0.5 shadow-lg shadow-pink-200/50 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-700 font-bold text-xl">
                Companion
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-1 bg-emerald-400 border-2 border-white rounded-full" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-slate-800">Companion Haven</h4>
            <p className="text-xs text-slate-500 font-medium">Joined 2026 • Peaceful Space</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-white/60 border border-white/80 rounded-2xl p-3 flex flex-col items-center text-center">
            <Heart className="w-4 h-4 text-pink-500 mb-1" />
            <span className="text-[11px] text-slate-500 font-medium">Bond Level</span>
            <span className="text-sm font-bold text-slate-800">Harmony</span>
          </div>

          <div className="bg-white/60 border border-white/80 rounded-2xl p-3 flex flex-col items-center text-center">
            <Sparkles className="w-4 h-4 text-purple-500 mb-1" />
            <span className="text-[11px] text-slate-500 font-medium">Presence</span>
            <span className="text-sm font-bold text-slate-800">Serene</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-2xl glass-button text-xs font-semibold text-slate-700 hover:text-pink-600"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
};
