import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit3,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  Plus,
  Info,
  User,
  GraduationCap,
  Briefcase,
  Heart,
  Target,
  Users,
  Calendar,
  Activity,
  FolderKanban,
  HelpCircle,
  FileText
} from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  confidence: number;
  updatedAt: string;
}

export interface MemoryCategoryData {
  id: string;
  title: string;
  icon: any;
  count: number;
  lastUpdated: string;
  items: MemoryItem[];
}

const INITIAL_CATEGORIES: MemoryCategoryData[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: User,
    count: 4,
    lastUpdated: '2 hours ago',
    items: [
      { id: 'p1', key: 'Full Name', value: 'Lokesh Gangavarapu', confidence: 98, updatedAt: 'Today, 05:30 PM' },
      { id: 'p2', key: 'Nickname', value: 'Lokesh', confidence: 95, updatedAt: 'Yesterday' },
      { id: 'p3', key: 'Timezone', value: 'Pacific Time (US & Canada)', confidence: 99, updatedAt: '3 days ago' },
      { id: 'p4', key: 'Spoken Languages', value: 'English, Telugu', confidence: 90, updatedAt: '1 week ago' }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    icon: GraduationCap,
    count: 3,
    lastUpdated: '1 day ago',
    items: [
      { id: 'e1', key: 'Degree', value: 'B.S. in Computer Science', confidence: 96, updatedAt: '1 day ago' },
      { id: 'e2', key: 'University', value: 'Stanford University Alumni', confidence: 92, updatedAt: '2 days ago' },
      { id: 'e3', key: 'Study Interests', value: 'Human-AI Interaction, Computer Vision', confidence: 88, updatedAt: '4 days ago' }
    ]
  },
  {
    id: 'work',
    title: 'Work',
    icon: Briefcase,
    count: 3,
    lastUpdated: '3 hours ago',
    items: [
      { id: 'w1', key: 'Role', value: 'Senior AI System Engineer', confidence: 97, updatedAt: '3 hours ago' },
      { id: 'w2', key: 'Focus Areas', value: 'Full-stack TypeScript, React 18, 3D WebGL', confidence: 94, updatedAt: 'Yesterday' },
      { id: 'w3', key: 'Work Environment', value: 'Remote / Cloud Workstation', confidence: 91, updatedAt: '5 days ago' }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: Heart,
    count: 5,
    lastUpdated: '30 mins ago',
    items: [
      { id: 'pr1', key: 'Avatar Glow', value: 'Blush Pink Accent (#f472b6)', confidence: 99, updatedAt: '30 mins ago' },
      { id: 'pr2', key: 'Voice Atmosphere', value: 'Soothing & Empathetic Listener', confidence: 95, updatedAt: '2 hours ago' },
      { id: 'pr3', key: 'Favorite Drinks', value: 'Matcha Latte, Jasmine Green Tea', confidence: 89, updatedAt: 'Yesterday' },
      { id: 'pr4', key: 'Music Style', value: 'Ambient Lo-Fi & Piano Melodies', confidence: 92, updatedAt: '3 days ago' },
      { id: 'pr5', key: 'Theme Preference', value: 'Minimalist Soft Warm Light Canvas', confidence: 98, updatedAt: '4 days ago' }
    ]
  },
  {
    id: 'goals',
    title: 'Goals',
    icon: Target,
    count: 3,
    lastUpdated: '4 hours ago',
    items: [
      { id: 'g1', key: 'Daily Goal', value: 'Practice 15 minutes of diaphragm breathing', confidence: 93, updatedAt: '4 hours ago' },
      { id: 'g2', key: 'Quarterly Project', value: 'Launch interactive AI companion v2.4', confidence: 96, updatedAt: '2 days ago' },
      { id: 'g3', key: 'Mindfulness Aim', value: 'Reduce screen fatigue and improve posture', confidence: 90, updatedAt: '1 week ago' }
    ]
  },
  {
    id: 'relationships',
    title: 'Relationships',
    icon: Users,
    count: 2,
    lastUpdated: '2 days ago',
    items: [
      { id: 'r1', key: 'Team Members', value: 'Alex (UX Designer), Sarah (ML Engineer)', confidence: 89, updatedAt: '2 days ago' },
      { id: 'r2', key: 'Pet', value: 'Mochi (Golden Retriever)', confidence: 94, updatedAt: '5 days ago' }
    ]
  },
  {
    id: 'dates',
    title: 'Important Dates',
    icon: Calendar,
    count: 3,
    lastUpdated: 'Yesterday',
    items: [
      { id: 'd1', key: 'Companion Anniversary', value: 'October 12th', confidence: 99, updatedAt: 'Yesterday' },
      { id: 'd2', key: 'Project Milestone Review', value: 'August 15th', confidence: 95, updatedAt: '3 days ago' },
      { id: 'd3', key: 'Birthday', value: 'March 24th', confidence: 97, updatedAt: '1 month ago' }
    ]
  },
  {
    id: 'health',
    title: 'Health & Wellness',
    icon: Activity,
    count: 2,
    lastUpdated: '1 day ago',
    items: [
      { id: 'h1', key: 'Sleep Routine', value: 'Target 11:00 PM wind down time', confidence: 92, updatedAt: '1 day ago' },
      { id: 'h2', key: 'Dietary Note', value: 'Prefers vegetarian & gluten-light options', confidence: 88, updatedAt: '3 days ago' }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FolderKanban,
    count: 2,
    lastUpdated: '5 hours ago',
    items: [
      { id: 'pj1', key: 'Active Applet', value: 'Shizuka Serene AI Companion Framework', confidence: 98, updatedAt: '5 hours ago' },
      { id: 'pj2', key: 'Side Experiment', value: 'WebGL Shader Particle Synthesis', confidence: 87, updatedAt: '4 days ago' }
    ]
  },
  {
    id: 'other',
    title: 'Other Memories',
    icon: FileText,
    count: 2,
    lastUpdated: '3 days ago',
    items: [
      { id: 'o1', key: 'Favorite Quote', value: '"Peace comes from within. Do not seek it without."', confidence: 95, updatedAt: '3 days ago' },
      { id: 'o2', key: 'Travel Destination Aim', value: 'Kyoto Bamboo Forest Garden', confidence: 91, updatedAt: '1 week ago' }
    ]
  }
];

const AUTOMATIC_TOPICS = [
  'Personal preferences',
  'Favorite things',
  'Goals',
  'Daily routines',
  'Study information',
  'College information',
  'Work information',
  'Important dates',
  'Frequently discussed topics',
  'User likes',
  'User dislikes',
  'Future plans',
  'Long-term projects'
];

export const MemorySection: React.FC = () => {
  // Memory Master Switch
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  // Categories with sample memories
  const [categories, setCategories] = useState<MemoryCategoryData[]>(INITIAL_CATEGORIES);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    personal: true,
    preferences: true
  });

  // Privacy rules state
  const [privacyRules, setPrivacyRules] = useState({
    askBeforeSaving: false,
    autoSaveImportant: true,
    neverSaveSensitive: true,
    reviewBeforeSaving: false
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State for View / Edit Memory
  const [editingMemory, setEditingMemory] = useState<{
    categoryId: string;
    item: MemoryItem;
  } | null>(null);

  const [newMemory, setNewMemory] = useState<{
    categoryId: string;
    key: string;
    value: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleCategoryExpand = (catId: string) => {
    soundFx.playClick();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    soundFx.playClick();
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === catId) {
          const nextItems = cat.items.filter((i) => i.id !== itemId);
          return {
            ...cat,
            items: nextItems,
            count: nextItems.length
          };
        }
        return cat;
      })
    );
    showToast('Memory item deleted.');
  };

  const handleDeleteAllMemories = () => {
    soundFx.playClick();
    if (confirm('Are you sure you want to clear all saved memories? This action cannot be undone.')) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: [],
          count: 0
        }))
      );
      showToast('All memories have been cleared.');
    }
  };

  const handleSaveEditedMemory = () => {
    if (!editingMemory) return;
    soundFx.playClick();

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === editingMemory.categoryId) {
          const nextItems = cat.items.map((item) =>
            item.id === editingMemory.item.id
              ? { ...editingMemory.item, updatedAt: 'Just now' }
              : item
          );
          return { ...cat, items: nextItems };
        }
        return cat;
      })
    );

    setEditingMemory(null);
    showToast('Memory item updated.');
  };

  const handleAddMemory = () => {
    if (!newMemory || !newMemory.key.trim() || !newMemory.value.trim()) return;
    soundFx.playClick();

    const createdItem: MemoryItem = {
      id: `m-${Date.now()}`,
      key: newMemory.key,
      value: newMemory.value,
      confidence: 100,
      updatedAt: 'Just now'
    };

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === newMemory.categoryId) {
          const nextItems = [createdItem, ...cat.items];
          return {
            ...cat,
            items: nextItems,
            count: nextItems.length,
            lastUpdated: 'Just now'
          };
        }
        return cat;
      })
    );

    setNewMemory(null);
    showToast('New memory saved.');
  };

  // Total memory count across categories
  const totalMemories = categories.reduce((acc, cat) => acc + cat.count, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-lg flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-pink-100/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center font-bold shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              🧠 Memory Settings
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The AI Companion can remember information from your conversations to provide a more personalized experience.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Memory Status Toggle */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800">Memory Status</h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              memoryEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {memoryEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
            When enabled, the AI can remember useful information from conversations across all sessions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <span className="text-xs font-semibold text-slate-600">
            {memoryEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <button
            onClick={() => {
              soundFx.playClick();
              setMemoryEnabled(!memoryEnabled);
              showToast(memoryEnabled ? 'Memory storage paused.' : 'Memory storage enabled.');
            }}
            className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
              memoryEnabled ? 'bg-pink-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.75 transition-transform shadow-xs ${
                memoryEnabled ? 'right-0.75' : 'left-0.75'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Automatic Memory Topics */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Automatic Memory Categories
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              The AI should automatically detect and remember important information such as:
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-[10px] font-bold shrink-0">
            UI Preview
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {AUTOMATIC_TOPICS.map((topic) => (
            <span
              key={topic}
              className="px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-pink-50 border border-slate-200/80 hover:border-pink-200 text-slate-700 hover:text-pink-800 text-xs font-semibold transition-all cursor-default flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              {topic}
            </span>
          ))}
        </div>

        <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-400 italic">
          <Info className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span>This is only a UI preview. The backend logic will be connected in an upcoming release.</span>
        </div>
      </div>

      {/* 3. Memory Categories (Expandable) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Memory Categories ({totalMemories} Entries Saved)
            </h4>
          </div>
          
          <button
            onClick={() => {
              soundFx.playClick();
              setNewMemory({ categoryId: 'personal', key: '', value: '' });
            }}
            className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-pink-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory</span>
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            const isExpanded = !!expandedCategories[cat.id];

            return (
              <div
                key={cat.id}
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/90 shadow-2xs overflow-hidden transition-all duration-200"
              >
                {/* Category Header Row */}
                <div
                  onClick={() => toggleCategoryExpand(cat.id)}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-pink-50 border border-pink-200/80 text-pink-600 flex items-center justify-center font-bold">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">{cat.title}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-pink-600">{cat.count} saved memories</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" /> Updated {cat.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Item List */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 border-t border-slate-100 bg-slate-50/40 space-y-2 pt-3">
                    {cat.items.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center italic">
                        No saved memories in this category yet.
                      </p>
                    ) : (
                      cat.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-pink-200 transition-all"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{item.key}:</span>
                              <span className="text-xs font-medium text-slate-700">{item.value}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>Confidence: {item.confidence}%</span>
                              <span>•</span>
                              <span>Synced {item.updatedAt}</span>
                            </div>
                          </div>

                          {/* Item Action Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                soundFx.playClick();
                                setEditingMemory({ categoryId: cat.id, item });
                              }}
                              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Edit Memory"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(cat.id, item.id);
                              }}
                              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Memory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Memory Management & Data Actions */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-purple-500" />
          Memory Management Actions
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => {
              soundFx.playClick();
              showToast('Opening complete memory viewer index.');
            }}
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-pink-300 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Eye className="w-4 h-4 text-pink-500" />
            <span>View Memories</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              showToast('Memory import will be available in future version.');
            }}
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Upload className="w-4 h-4 text-purple-500" />
            <span>Import (Future)</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              showToast('Exporting encrypted memory archive JSON...');
            }}
            className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export (Future)</span>
          </button>

          <button
            onClick={handleDeleteAllMemories}
            className="p-3 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Delete All</span>
          </button>
        </div>
      </div>

      {/* 5. Privacy Controls */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-white/90 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            Privacy & Guardrails
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Control how and when the AI stores user memory data</p>
        </div>

        <div className="space-y-3">
          {[
            { id: 'askBeforeSaving', label: 'Ask before saving memories', desc: 'Require explicit user confirmation before recording new facts.' },
            { id: 'autoSaveImportant', label: 'Automatically save important memories', desc: 'Detect key details (e.g. goals, names) without interrupting chat flow.' },
            { id: 'neverSaveSensitive', label: 'Never save sensitive information', desc: 'Automatically redact credit cards, passwords, or medical records.' },
            { id: 'reviewBeforeSaving', label: 'Review memories before saving', desc: 'Show a brief review popup at the end of each session.' }
          ].map((rule) => {
            const key = rule.id as keyof typeof privacyRules;
            const isChecked = privacyRules[key];

            return (
              <div
                key={rule.id}
                onClick={() => {
                  soundFx.playClick();
                  setPrivacyRules((prev) => ({ ...prev, [key]: !prev[key] }));
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isChecked
                    ? 'bg-pink-50/70 border-pink-200 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold">{rule.label}</h5>
                  <p className="text-[11px] text-slate-500">{rule.desc}</p>
                </div>

                <div
                  className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${
                    isChecked ? 'bg-pink-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.75 transition-transform ${
                      isChecked ? 'right-0.75' : 'left-0.75'
                    }`}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-slate-500">Need to wipe stored profile memory data?</span>
            <button
              onClick={handleDeleteAllMemories}
              className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Clear All Memories
            </button>
          </div>
        </div>
      </div>

      {/* 6. Future Notice Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/80 text-slate-700 text-xs flex items-center gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-2xl bg-white border border-pink-200 text-pink-500 flex items-center justify-center shrink-0 font-bold">
          <Info className="w-4 h-4" />
        </div>
        <p className="leading-relaxed font-medium">
          <span className="font-bold text-pink-700">Future Notice:</span> Automatic memory extraction will be connected to the AI backend in a future update.
        </p>
      </div>

      {/* MODAL: EDIT MEMORY */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-bold text-slate-800">Edit Memory Entry</h4>
              <button
                onClick={() => setEditingMemory(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Memory Key / Title</label>
                <input
                  type="text"
                  value={editingMemory.item.key}
                  onChange={(e) =>
                    setEditingMemory({
                      ...editingMemory,
                      item: { ...editingMemory.item, key: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Memory Fact Content</label>
                <textarea
                  rows={3}
                  value={editingMemory.item.value}
                  onChange={(e) =>
                    setEditingMemory({
                      ...editingMemory,
                      item: { ...editingMemory.item, value: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingMemory(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedMemory}
                className="px-5 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW MEMORY */}
      {newMemory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-bold text-slate-800">Add New Memory Fact</h4>
              <button
                onClick={() => setNewMemory(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={newMemory.categoryId}
                  onChange={(e) => setNewMemory({ ...newMemory, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Memory Key / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Favorite Coffee"
                  value={newMemory.key}
                  onChange={(e) => setNewMemory({ ...newMemory, key: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-pink-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Memory Value / Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cold brew with oat milk and extra ice"
                  value={newMemory.value}
                  onChange={(e) => setNewMemory({ ...newMemory, value: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setNewMemory(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                className="px-5 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-600"
              >
                Save Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
