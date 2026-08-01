import React, { useEffect, useState } from 'react';
import { Mic, MicOff, X, Radio, Activity, Volume2 } from 'lucide-react';
import { AudioState } from '../types';
import { soundFx } from '../utils/soundEffects';

interface MicrophoneModalProps {
  audioState: AudioState;
  onClose: () => void;
  onToggleMute: () => void;
  onSimulateVoiceTranscribe: (text: string) => void;
}

export const MicrophoneModal: React.FC<MicrophoneModalProps> = ({
  audioState,
  onClose,
  onToggleMute,
  onSimulateVoiceTranscribe
}) => {
  const [dbBars, setDbBars] = useState<number[]>([]);

  // Animate decibel meter bars
  useEffect(() => {
    const interval = setInterval(() => {
      const bars = Array.from({ length: 24 }, () =>
        audioState.isMuted ? 5 : Math.floor(15 + Math.random() * 80)
      );
      setDbBars(bars);
    }, 80);

    return () => clearInterval(interval);
  }, [audioState.isMuted]);

  return (
    <div className="fixed top-20 left-6 z-50 w-80 sm:w-96 bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-slate-200 tracking-wider flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-blue-400" />
            AUDIO INPUT STREAM
          </span>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Decibel Level Graphic Visualizer */}
      <div className="bg-slate-950 rounded-2xl p-4 border border-white/10 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            INPUT GAIN: {audioState.isMuted ? 'MUTED' : '42 dB'}
          </span>
          <span className="font-mono text-[10px] text-blue-400">96.8 kHz / 24-bit</span>
        </div>

        {/* Dynamic Graphic Equalizer Bars */}
        <div className="flex items-end justify-between h-20 gap-1 pt-2 px-1">
          {dbBars.map((val, idx) => (
            <div
              key={idx}
              className={`flex-1 rounded-t transition-all duration-75 ${
                audioState.isMuted
                  ? 'bg-slate-800'
                  : val > 75
                  ? 'bg-gradient-to-t from-blue-500 to-cyan-300'
                  : 'bg-blue-600/60'
              }`}
              style={{ height: `${val}%` }}
            />
          ))}
        </div>
      </div>

      {/* Transcription Preview Box */}
      <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 mb-4">
        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-slate-400">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          REALTIME TRANSCRIBER STREAM:
        </div>
        <p className="text-xs text-slate-200 font-sans italic min-h-[36px]">
          "{audioState.transcription || 'Listening for speech input...'}"
        </p>
      </div>

      {/* Test Voice Prompt Suggestions */}
      <div className="space-y-1.5 mb-4">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          Quick Voice Presets:
        </span>
        <button
          onClick={() => {
            soundFx.playClick();
            onSimulateVoiceTranscribe('Hello AURA, can you tell me what you are capable of?');
          }}
          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-white/5 text-xs text-blue-300 transition-all cursor-pointer"
        >
          "Hello AURA, can you tell me what you are capable of?"
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            onSimulateVoiceTranscribe('Give me a peaceful meditation thought for today.');
          }}
          className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-white/5 text-xs text-blue-300 transition-all cursor-pointer"
        >
          "Give me a peaceful meditation thought for today."
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
        <button
          onClick={() => {
            soundFx.playMicToggle(audioState.isMuted);
            onToggleMute();
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
            audioState.isMuted
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
          }`}
        >
          {audioState.isMuted ? (
            <>
              <MicOff className="w-3.5 h-3.5" /> Unmute
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-blue-400" /> Mute Mic
            </>
          )}
        </button>
      </div>
    </div>
  );
};
