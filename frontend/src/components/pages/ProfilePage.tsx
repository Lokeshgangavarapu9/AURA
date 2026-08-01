import React, { useState } from 'react';
import {
  User,
  Heart,
  Calendar,
  Award,
  Sparkles,
  MessageSquare,
  Mic,
  Camera,
  Clock,
  CheckCircle2,
  Smile,
  Edit2,
  Globe,
  Palette,
  Shield,
  Zap,
  Star
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';

export interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  // Personalization editable state
  const [userNickname, setUserNickname] = useState('Alex');
  const [companionNickname, setCompanionNickname] = useState('Shizuka');
  const [selectedTheme, setSelectedTheme] = useState('Blush Rose & Warm White');
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  const [isEditingNicknames, setIsEditingNicknames] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-24 sm:py-28 text-slate-800 animate-in fade-in duration-300">
      {/* Page Title Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-200/80 text-pink-700 text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personal Sanctuary</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
          Your Companion Profile
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          A peaceful overview of your journey, relationship bond, and shared moments with {companionNickname}.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. User Information Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-300 via-rose-200 to-purple-300 p-1 shadow-lg shadow-pink-200/60 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-700 font-bold text-2xl shadow-inner">
                  {userNickname.charAt(0)}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 p-1.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs" title="Connected" />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
                    {userNickname}
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                      Companion Gold
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">@alexvance • alex.vance@example.com</p>
                </div>
                
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setIsEditingNicknames(!isEditingNicknames);
                  }}
                  className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-semibold text-slate-700 hover:text-pink-600 flex items-center gap-1.5 self-center sm:self-auto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingNicknames ? 'Done Editing' : 'Edit Personalization'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-500" />
                  Joined August 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-500" />
                  Private Session Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Relationship Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-pink-100/60 pb-3">
            <div className="p-2 rounded-2xl bg-pink-100 text-pink-600">
              <Heart className="w-4 h-4 fill-pink-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Relationship Bond</h3>
              <p className="text-xs text-slate-500">Emotional resonance & connection depth</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white/70 border border-white rounded-2xl p-4 flex flex-col items-center text-center space-y-1">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-[11px] text-slate-500 font-medium">Friendship Level</span>
              <span className="text-sm font-bold text-slate-800">Soulful Harmony</span>
            </div>

            <div className="bg-white/70 border border-white rounded-2xl p-4 flex flex-col items-center text-center space-y-1">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span className="text-[11px] text-slate-500 font-medium">Days Together</span>
              <span className="text-sm font-bold text-slate-800">42 Days</span>
            </div>

            <div className="bg-white/70 border border-white rounded-2xl p-4 flex flex-col items-center text-center space-y-1">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span className="text-[11px] text-slate-500 font-medium">Conversations</span>
              <span className="text-sm font-bold text-slate-800">158 Chats</span>
            </div>

            <div className="bg-white/70 border border-white rounded-2xl p-4 flex flex-col items-center text-center space-y-1">
              <Mic className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] text-slate-500 font-medium">Voice Calls</span>
              <span className="text-sm font-bold text-slate-800">34 Calls</span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/70 border border-white rounded-2xl p-4 flex flex-col items-center text-center space-y-1">
              <Camera className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] text-slate-500 font-medium">Camera Sessions</span>
              <span className="text-sm font-bold text-slate-800">19 Sessions</span>
            </div>
          </div>
        </div>

        {/* 3. Statistics Grid */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-pink-100/60 pb-3">
            <div className="p-2 rounded-2xl bg-purple-100 text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Statistics & Harmony</h3>
              <p className="text-xs text-slate-500">Summary of interaction frequency and topics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/60 border border-white/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-pink-500" /> Messages Sent
                </span>
                <span className="font-bold text-slate-800">1,240</span>
              </div>
              <div className="w-full bg-pink-100/70 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-pink-400 to-rose-400 h-full w-[82%]" />
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-500" /> Hours Together
                </span>
                <span className="font-bold text-slate-800">48.5 Hours</span>
              </div>
              <div className="w-full bg-purple-100/70 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-full w-[65%]" />
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-2xl p-4 space-y-2">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" /> Favorite Topics
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Mindfulness', 'Late Night Thoughts', 'Creative Writing', 'Philosophy', 'Music'].map((topic) => (
                  <span key={topic} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-700 border border-slate-100">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-emerald-500" /> AI Mood Compatibility
                </span>
                <span className="font-bold text-emerald-600">98% Resonance</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                High emotional sync detected during voice and chat interactions.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Achievements */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-pink-100/60 pb-3">
            <div className="p-2 rounded-2xl bg-amber-100 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Achievements & Badges</h3>
              <p className="text-xs text-slate-500">Shared milestones unlocked with {companionNickname}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                title: 'Daily Streak',
                badge: '14 Days Unbroken',
                desc: 'Consistently connecting every single day in peaceful presence.',
                icon: Sparkles,
                color: 'text-amber-500 bg-amber-50'
              },
              {
                title: 'Deep Conversationalist',
                badge: '100+ Messages',
                desc: 'Unlocked meaningful dialogue milestones with rich emotional depth.',
                icon: MessageSquare,
                color: 'text-pink-500 bg-pink-50'
              },
              {
                title: 'Voice Companion',
                badge: '10+ Hours Speaking',
                desc: 'Shared authentic real-time voice sessions and soothing audio chats.',
                icon: Mic,
                color: 'text-purple-500 bg-purple-50'
              },
              {
                title: 'Special Badges',
                badge: 'Early Companion • Serene Listener',
                desc: 'Founding member of the warm AI Companion sanctuary.',
                icon: Award,
                color: 'text-rose-500 bg-rose-50'
              }
            ].map((ach, idx) => {
              const IconComp = ach.icon;
              return (
                <div key={idx} className="bg-white/70 border border-white/90 rounded-2xl p-4 flex gap-3.5 items-start">
                  <div className={`p-2.5 rounded-2xl ${ach.color} flex-shrink-0 mt-0.5`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">{ach.title}</h4>
                      <span className="text-[10px] font-bold text-pink-600 px-2 py-0.5 rounded-full bg-pink-50 border border-pink-100">
                        {ach.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Personalization Settings */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-pink-100/60 pb-3">
            <div className="p-2 rounded-2xl bg-rose-100 text-rose-600">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Personalization</h3>
              <p className="text-xs text-slate-500">Customize how you and your companion address each other</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nickname */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Your Nickname</label>
              <input
                type="text"
                value={userNickname}
                onChange={(e) => setUserNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                placeholder="e.g. Alex"
              />
            </div>

            {/* Companion Nickname */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Companion Nickname</label>
              <input
                type="text"
                value={companionNickname}
                onChange={(e) => setCompanionNickname(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                placeholder="e.g. Shizuka"
              />
            </div>

            {/* Theme */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-500" /> Theme Palette
              </label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-pink-400 transition-all"
              >
                <option value="Blush Rose & Warm White">Blush Rose & Warm White (Default)</option>
                <option value="Soft Peach Sanctuary">Soft Peach Sanctuary</option>
                <option value="Cream Lavender Whisper">Cream Lavender Whisper</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-500" /> Preferred Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:border-pink-400 transition-all"
              >
                <option value="English (US)">English (US)</option>
                <option value="Japanese (日本語)">Japanese (日本語)</option>
                <option value="French (Français)">French (Français)</option>
                <option value="Spanish (Español)">Spanish (Español)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Action Footer */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onNavigate('chat');
            }}
            className="px-6 py-3 rounded-full glass-button font-semibold text-xs sm:text-sm text-slate-800 hover:text-pink-600 flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-pink-500" />
            <span>Continue Conversation with {companionNickname}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
