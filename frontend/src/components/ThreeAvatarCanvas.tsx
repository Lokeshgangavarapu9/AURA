import React from 'react';
import { AvatarViewer, FaceTrackData } from './AvatarViewer';
import { AIEmotion, AIStatusMode } from '../types';

export type { FaceTrackData };

interface ThreeAvatarCanvasProps {
  status: AIStatusMode;
  emotion: AIEmotion;
  isSpeaking: boolean;
  isListening: boolean;
  eyeColorHex?: string;
  glowColorHex?: string;
  faceTrackPos?: FaceTrackData;
  modelUrl?: string;
}

export const ThreeAvatarCanvas: React.FC<ThreeAvatarCanvasProps> = (props) => {
  return <AvatarViewer {...props} />;
};

export { AvatarViewer };
export default AvatarViewer;
