import React from 'react';
import { X, Sliders, Eye, Sparkles, Volume2, Shield, RefreshCw } from 'lucide-react';
import { AppSettings } from '../types';
import { soundFx } from '../utils/soundEffects';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onResetSettings
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">AURA SYSTEM PREFERENCES</h2>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 my-5 max-h-[65vh] overflow-y-auto no-scrollbar pr-1">
          
          {/* Avatar Customization */}
          <div>
            <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> 3D Avatar Customization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              {/* Eye Iris Color */}
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                  Eye Iris Color Accent
                </label>
                <div className="flex items-center gap-2">
                  {['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#e11d48', '#f59e0b'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        soundFx.playClick();
                        onUpdateSettings({ avatarEyeColor: color });
                      }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer border ${
                        settings.avatarEyeColor === color
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Halo Glow Color */}
              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                  Aura Glow Field
                </label>
                <div className="flex items-center gap-2">
                  {['#60a5fa', '#a78bfa', '#22d3ee', '#34d399', '#f43f5e'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        soundFx.playClick();
                        onUpdateSettings({ avatarGlowColor: color });
                      }}
                      className={`w-6 h-6 rounded-full transition-all cursor-pointer border ${
                        settings.avatarGlowColor === color
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Audio Synth Preferences */}
          <div>
            <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Audio & Haptic Feedback
            </h3>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">UI Web Audio Synthesizer</span>
                  <span className="text-[10px] text-slate-400">Futuristic clicks and status audio chimes</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundFxEnabled}
                  onChange={(e) => {
                    soundFx.playClick();
                    onUpdateSettings({ soundFxEnabled: e.target.checked });
                  }}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Auto-Speak Responses</span>
                  <span className="text-[10px] text-slate-400">Simulate lip-sync animation on AI message</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSpeakResponse}
                  onChange={(e) => {
                    soundFx.playClick();
                    onUpdateSettings({ autoSpeakResponse: e.target.checked });
                  }}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Theme Preset */}
          <div>
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Futuristic UI Theme
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'obsidian', name: 'Obsidian Sci-Fi', border: 'border-blue-500/50' },
                { id: 'cyberpunk', name: 'Cyberpunk Neon', border: 'border-purple-500/50' },
                { id: 'minimal', name: 'Deep Space', border: 'border-slate-500/50' }
              ].map((themeItem) => (
                <button
                  key={themeItem.id}
                  onClick={() => {
                    soundFx.playClick();
                    onUpdateSettings({ theme: themeItem.id as AppSettings['theme'] });
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    settings.theme === themeItem.id
                      ? `bg-slate-800 text-white ${themeItem.border} ring-1 ring-blue-400`
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border-white/5'
                  }`}
                >
                  {themeItem.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={() => {
              soundFx.playClick();
              onResetSettings();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
