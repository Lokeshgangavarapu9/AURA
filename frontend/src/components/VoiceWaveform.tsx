import React, { useEffect, useRef } from 'react';
import { AIStatusMode } from '../types';

interface VoiceWaveformProps {
  status: AIStatusMode;
  accentColor?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ status, accentColor = '#f472b6' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      step += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const isSpeaking = status === 'speaking';
      const isListening = status === 'listening';
      const isThinking = status === 'thinking';

      const baseAmp = isSpeaking ? 28 : isListening ? 18 : isThinking ? 10 : 4;

      // Draw multi-layered sine wave frequency visualizer
      const lines = [
        { color: accentColor, speed: 1.0, mult: 1.0, alpha: 0.85 },
        { color: '#c084fc', speed: 1.4, mult: 0.7, alpha: 0.75 },
        { color: '#fb923c', speed: 0.8, mult: 1.2, alpha: 0.75 }
      ];

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.lineWidth = isSpeaking ? 2.5 : 1.5;
        ctx.strokeStyle = line.color;
        ctx.globalAlpha = line.alpha;

        const centerY = height / 2;

        for (let x = 0; x < width; x += 2) {
          // Fade amplitude towards canvas edges for smooth aesthetic curve
          const normX = x / width;
          const envelope = Math.sin(normX * Math.PI);

          const freq = 0.03 * line.mult;
          const phase = step * line.speed;
          const y = centerY + Math.sin(x * freq + phase) * baseAmp * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw subtle particle audio pulses when active
      if (isSpeaking || isListening) {
        ctx.globalAlpha = 0.9;
        const count = 12;
        for (let i = 0; i < count; i++) {
          const px = (width / (count + 1)) * (i + 1);
          const py = height / 2 + Math.sin(step * 2 + i) * baseAmp * 0.6;
          const pr = 2 + Math.abs(Math.sin(step * 3 + i)) * 2.5;

          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? accentColor : '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.shadowColor = accentColor;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [status, accentColor]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      <canvas
        ref={canvasRef}
        width={400}
        height={70}
        className="w-full h-16 pointer-events-none drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]"
      />
    </div>
  );
};
