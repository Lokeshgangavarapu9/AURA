import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Bot,
  Mic,
  Camera,
  Bell,
  Shield,
  Info,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  HelpCircle,
  MessageSquare,
  Link as LinkIcon,
  Brain
} from 'lucide-react';
import { AppSettings } from '../../types';
import { soundFx } from '../../utils/soundEffects';
import { ConnectorsSection } from '../ConnectorsSection';
import { MemorySection } from '../MemorySection';

export interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSet: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  // Local active section tab
  const [activeTab, setActiveTab] = useState<'appearance' | 'memory' | 'connectors' | 'companion' | 'voice' | 'camera' | 'notifications' | 'privacy' | 'about'>('memory');

  // Additional setting state options
  const [selectedVoice, setSelectedVoice] = useState('Warm Female (Shizuka)');
  const [personalityMode, setPersonalityMode] = useState('Empathetic Listener');
  const [emotionLevel, setEmotionLevel] = useState(85);
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  const [micDevice, setMicDevice] = useState('Default System Microphone');
  const [speakerDevice, setSpeakerDevice] = useState('Default Speakers');
  const [noiseReduction, setNoiseReduction] = useState(true);

  const [selectedCamera, setSelectedCamera] = useState('Built-in FaceTime HD Camera');
  const [eyeTracking, setEyeTracking] = useState(true);
  const [faceTracking, setFaceTracking] = useState(true);

  const [desktopNotifs, setDesktopNotifs] = useState(true);
  const [mobilePush, setMobilePush] = useState(false);
  const [soundChime, setSoundChime] = useState(true);

  const [cameraPerm, setCameraPerm] = useState(true);
  const [micPerm, setMicPerm] = useState(true);

  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    soundFx.playClick();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-24 sm:py-28 text-slate-800 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Application Settings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
          Preferences & Controls
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Tailor your companion environment, privacy options, audio hardware, and visual theme.
        </p>
      </div>

      {savedToast && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 text-center shadow-xs animate-in fade-in duration-200">
          ✨ Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1.5 glass-card rounded-3xl p-3 h-fit border border-white/80">
          {[
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'memory', label: 'Memory', icon: Brain },
            { id: 'connectors', label: 'Connectors & OAuth', icon: LinkIcon },
            { id: 'companion', label: 'AI Companion', icon: Bot },
            { id: 'voice', label: 'Voice Audio', icon: Mic },
            { id: 'camera', label: 'Camera Vision', icon: Camera },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & Data', icon: Shield },
            { id: 'about', label: 'About App', icon: Info }
          ].map((sec) => {
            const IconComp = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(sec.id as any);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Setting Content Panel */}
        <div className="md:col-span-3 glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/80 min-h-[480px]">
          
          {/* 1. Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-pink-100/60 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-500" />
                  Appearance Settings
                </h3>
                <p className="text-xs text-slate-500">Visual atmosphere, glow colors, and font scale</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Glow Accent Color</label>
                  <div className="flex items-center gap-3">
                    {[
                      { name: 'Blush Pink', hex: '#f472b6' },
                      { name: 'Soft Purple', hex: '#c084fc' },
                      { name: 'Warm Amber', hex: '#fbbf24' },
                      { name: 'Emerald Serenity', hex: '#34d399' }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => {
                          soundFx.playClick();
                          onUpdateSettings({ avatarGlowColor: col.hex });
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                          settings.avatarGlowColor === col.hex ? 'border-slate-800 scale-110 shadow-md' : 'border-white'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-700">Font Scaling</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Small', 'Medium (Default)', 'Large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => soundFx.playClick()}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                          size.includes('Medium')
                            ? 'bg-pink-100 text-pink-700 border-pink-200 font-semibold'
                            : 'bg-white/70 text-slate-600 border-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Memory Section */}
          {activeTab === 'memory' && <MemorySection />}

          {/* Connectors & OAuth */}
          {activeTab === 'connectors' && <ConnectorsSection />}

          {/* 2. AI Companion */}
          {activeTab === 'companion' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-pink-100/60 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  AI Companion Config
                </h3>
                <p className="text-xs text-slate-500">Voice synthesis, personality mode, and emotion depth</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Companion Voice Tone</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-pink-400"
                  >
                    <option value="Warm Female (Shizuka)">Warm Female (Shizuka)</option>
                    <option value="Calm Soft Whisper">Calm Soft Whisper</option>
                    <option value="Gentle Mindful Voice">Gentle Mindful Voice</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Personality Blueprint</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { title: 'Empathetic Listener', desc: 'Warm, compassionate & soothing' },
                      { title: 'Mindful Mentor', desc: 'Thoughtful, calm & grounding' },
                      { title: 'Creative Spark', desc: 'Inspiring, inquisitive & bright' }
                    ].map((p) => (
                      <div
                        key={p.title}
                        onClick={() => {
                          soundFx.playClick();
                          setPersonalityMode(p.title);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          personalityMode === p.title
                            ? 'bg-pink-100/80 border-pink-300 text-pink-900 shadow-2xs'
                            : 'bg-white/70 border-slate-200/80 hover:bg-white text-slate-700'
                        }`}
                      >
                        <h4 className="text-xs font-bold">{p.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-700">Emotion & Empathy Resonance</label>
                    <span className="font-bold text-pink-600">{emotionLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={emotionLevel}
                    onChange={(e) => setEmotionLevel(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Long-Term Memory</h4>
                    <p className="text-[11px] text-slate-500">Allows Shizuka to remember preferences and past conversations.</p>
                  </div>
                  <button
                    onClick={() => setMemoryEnabled(!memoryEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      memoryEnabled ? 'bg-pink-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      memoryEnabled ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Voice */}
          {activeTab === 'voice' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-pink-100/60 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-500" />
                  Voice & Speech Audio
                </h3>
                <p className="text-xs text-slate-500">Audio hardware input/output and background noise suppression</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Microphone Input Device</label>
                  <select
                    value={micDevice}
                    onChange={(e) => setMicDevice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Default System Microphone">Default System Microphone</option>
                    <option value="External USB Condenser Mic">External USB Condenser Mic</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Speaker Output Device</label>
                  <select
                    value={speakerDevice}
                    onChange={(e) => setSpeakerDevice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Default Speakers">Default Speakers / Headphones</option>
                    <option value="Bluetooth Audio Device">Bluetooth Audio Device</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Noise Reduction & Echo Cancellation</h4>
                    <p className="text-[11px] text-slate-500">Filters ambient noise for crisp clear voice chat.</p>
                  </div>
                  <button
                    onClick={() => setNoiseReduction(!noiseReduction)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      noiseReduction ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      noiseReduction ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Camera */}
          {activeTab === 'camera' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-pink-100/60 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-500" />
                  Camera & Vision Tracking
                </h3>
                <p className="text-xs text-slate-500">Webcam selection, eye contact alignment and gesture tracking</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Video Device</label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Built-in FaceTime HD Camera">Built-in FaceTime HD Camera</option>
                    <option value="USB Video Capture">USB Video Capture</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Natural Eye Contact Tracking</h4>
                    <p className="text-[11px] text-slate-500">Companion aligns gaze naturally with user face position.</p>
                  </div>
                  <button
                    onClick={() => setEyeTracking(!eyeTracking)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      eyeTracking ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      eyeTracking ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Face Gesture Perception</h4>
                    <p className="text-[11px] text-slate-500">Allows companion to react to smiles or nods in real-time.</p>
                  </div>
                  <button
                    onClick={() => setFaceTracking(!faceTracking)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      faceTracking ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      faceTracking ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-pink-100/60 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-500" />
                  Notifications & Reminders
                </h3>
                <p className="text-xs text-slate-500">Chimes, desktop alerts, and check-in prompts</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Desktop Notifications</h4>
                    <p className="text-[11px] text-slate-500">Receive gentle reminders for daily mindfulness check-ins.</p>
                  </div>
                  <button
                    onClick={() => setDesktopNotifs(!desktopNotifs)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      desktopNotifs ? 'bg-purple-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      desktopNotifs ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Sound Chimes</h4>
                    <p className="text-[11px] text-slate-500">Play subtle, peaceful audio cues during state changes.</p>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateSettings({ soundFxEnabled: !settings.soundFxEnabled });
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.soundFxEnabled ? 'bg-purple-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      settings.soundFxEnabled ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-pink-100/60 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-500" />
                  Privacy & Data Ownership
                </h3>
                <p className="text-xs text-slate-500">Hardware permissions, local session logs, and data export</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Camera Access Permission</h4>
                    <p className="text-[11px] text-slate-500">Hardware camera stream remains completely client-side.</p>
                  </div>
                  <button
                    onClick={() => setCameraPerm(!cameraPerm)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      cameraPerm ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      cameraPerm ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">Microphone Access Permission</h4>
                    <p className="text-[11px] text-slate-500">Real-time voice synthesis and audio input permission.</p>
                  </div>
                  <button
                    onClick={() => setMicPerm(!micPerm)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      micPerm ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      micPerm ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      alert('Data archive downloaded successfully.');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-pink-500" />
                    <span>Export All Data</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      if (confirm('Are you sure you want to clear chat history?')) {
                        alert('Chat history cleared.');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Chat History</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. About */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-pink-100/60 pb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-pink-500" />
                  About Shizuka AI Companion
                </h3>
                <p className="text-xs text-slate-500">Version details, updates, and feedback channels</p>
              </div>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="bg-white/80 p-4 rounded-2xl border border-pink-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Application Release</span>
                    <span className="font-semibold text-pink-600 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200">
                      v2.4.0 Serene
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Designed for emotional resonance, warmth, and peace. Built with Three.js WebGL, VRM 3D support, and real-time voice synthesis.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => soundFx.playClick()}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-pink-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span>Check for Updates</span>
                  </button>

                  <button
                    onClick={() => soundFx.playClick()}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-500" />
                    <span>Help & FAQ</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save & Reset Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                soundFx.playClick();
                onResetSettings();
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full glass-button font-bold text-xs text-slate-800 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-pink-500" /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
