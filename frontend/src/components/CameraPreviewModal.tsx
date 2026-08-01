import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Pause, Play, RefreshCw, Eye, Sparkles, Scan, CheckCircle2 } from 'lucide-react';
import { CameraState } from '../types';
import { soundFx } from '../utils/soundEffects';

interface CameraPreviewModalProps {
  cameraState: CameraState;
  onClose: () => void;
  onTogglePause: () => void;
  onCaptureFrame: (frameLabel: string) => void;
}

export const CameraPreviewModal: React.FC<CameraPreviewModalProps> = ({
  cameraState,
  onClose,
  onTogglePause,
  onCaptureFrame
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasRealStream, setHasRealStream] = useState(false);
  const [scanLaserPos, setScanLaserPos] = useState(0);

  // Attempt real webcam access (or fallback to simulated sci-fi feed)
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasRealStream(true);
          }
        }
      } catch {
        // Fallback to simulated sci-fi camera preview
        setHasRealStream(false);
      }
    }

    if (!cameraState.isPaused) {
      setupCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraState.isPaused]);

  // Animated laser scan line loop
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLaserPos((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-20 right-6 z-50 w-80 sm:w-96 bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-slate-200 tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            VISION SENSOR FEED
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

      {/* Video Viewport Container */}
      <div className="relative w-full h-56 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden group">
        {hasRealStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
              cameraState.isPaused ? 'opacity-30 blur-sm' : 'opacity-100'
            }`}
          />
        ) : (
          /* Simulated Sci-Fi Camera Environment */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 p-4">
            <div className="w-20 h-20 rounded-full border-2 border-emerald-500/30 flex items-center justify-center relative">
              <Scan className="w-10 h-10 text-emerald-400/80 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping" />
            </div>
            <p className="font-mono text-xs text-slate-300 mt-3 text-center">
              AURA VISION HARDWARE LINK
            </p>
            <p className="font-mono text-[10px] text-emerald-400/80 mt-1">
              {cameraState.isPaused ? 'STREAM PAUSED' : 'LIVE TELEMETRY STREAMING'}
            </p>
          </div>
        )}

        {/* Laser Scanning Overlay */}
        {!cameraState.isPaused && (
          <div
            className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981]"
            style={{ top: `${scanLaserPos}%` }}
          />
        )}

        {/* AI Bounding Box HUD Overlay */}
        {!cameraState.isPaused && (
          <div className="pointer-events-none absolute inset-6 border border-emerald-500/40 rounded-xl flex flex-col justify-between p-2">
            <div className="flex justify-between items-start">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                USER_FACE • 99.4%
              </span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-500/30">
                AFFECTION: CALM
              </span>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-[9px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded">
                RES: 640x480
              </span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                OBJECTS DETECTED (3)
              </span>
            </div>
          </div>
        )}

        {/* Paused Banner Overlay */}
        {cameraState.isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
            <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
              PAUSED
            </span>
          </div>
        )}
      </div>

      {/* Recognized Objects Tag Cloud */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
          👤 User Portrait
        </span>
        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
          💡 Soft Ambient Light
        </span>
        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-white/5">
          ✨ Smile Expression
        </span>
      </div>

      {/* Camera Action Buttons */}
      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-white/10">
        <button
          onClick={() => {
            soundFx.playClick();
            onTogglePause();
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all cursor-pointer"
        >
          {cameraState.isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" /> Resume
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause
            </>
          )}
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onCaptureFrame('Captured camera frame: User looking towards AURA companion with a smile.');
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" /> Send to AI
        </button>
      </div>
    </div>
  );
};
