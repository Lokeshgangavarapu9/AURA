import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Play,
  Clock,
  Check,
  X,
  Plus,
  Tag
} from 'lucide-react';
import { soundFx } from '../../utils/soundEffects';
import { sessionService, SessionMetadataPayload } from '../../api/index.js';

export interface HistoryPageProps {
  onNavigateToChat: (sessionId?: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigateToChat }) => {
  const [sessions, setSessions] = useState<SessionMetadataPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Rename State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load Sessions from Backend Session Workspace
  const loadSessions = async () => {
    setLoading(true);
    const result = await sessionService.listSessions();
    if (result.success) {
      setSessions(result.data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Create New Session
  const handleCreateSession = async () => {
    soundFx.playClick();
    const result = await sessionService.createSession('New Conversation');
    if (result.success) {
      onNavigateToChat(result.data.data.id);
    }
  };

  // Toggle Pin Status
  const handleTogglePin = async (session: SessionMetadataPayload) => {
    soundFx.playClick();
    const updatedPin = !session.isPinned;

    // Optimistic UI update
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, isPinned: updatedPin } : s))
    );

    await sessionService.updateSession(session.id, { isPinned: updatedPin });
    loadSessions();
  };

  // Delete Session
  const handleDeleteSession = async (id: string) => {
    soundFx.playClick();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    await sessionService.deleteSession(id);
  };

  // Save Inline Rename
  const handleSaveRename = async (id: string) => {
    soundFx.playClick();
    if (editTitle.trim()) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: editTitle.trim() } : s))
      );
      await sessionService.updateSession(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  // Filtering by search query
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.currentTopic && s.currentTopic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-24 sm:py-28 text-slate-800 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-purple-700 text-xs font-semibold shadow-2xs">
            <History className="w-3.5 h-3.5" />
            <span>Conversation Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
            Active & Saved Sessions
          </h1>
          <p className="text-sm text-slate-500 max-w-md">
            Manage your persistent AI companion threads, topics, and message histories.
          </p>
        </div>

        {/* New Session Button */}
        <button
          onClick={handleCreateSession}
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-3xl p-4 mb-6 border border-white/80 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-all"
          />
        </div>
      </div>

      {/* Session Workspace List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card rounded-3xl p-12 text-center text-xs text-slate-400">
            Loading active sessions...
          </div>
        ) : filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`glass-card rounded-2xl p-4 border transition-all shadow-2xs group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                session.isPinned
                  ? 'border-purple-300/90 bg-purple-50/40 shadow-xs'
                  : 'border-white/80 hover:border-pink-200/80'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start gap-3.5 flex-1">
                <div className={`p-2.5 rounded-2xl mt-0.5 ${session.isPinned ? 'bg-purple-200/80 text-purple-700' : 'bg-pink-100/80 text-pink-600'}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>

                <div className="space-y-1 flex-1">
                  {editingId === session.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white border border-purple-300 text-xs font-semibold text-slate-800 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(session.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-pink-600 transition-colors flex items-center gap-2">
                      {session.title}
                      {session.isPinned && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-purple-700" />
                          Pinned
                        </span>
                      )}
                    </h4>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-purple-600 font-semibold">
                      <Tag className="w-3 h-3" />
                      {session.currentTopic || 'General'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(session.lastInteractionAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{session.messageCount} messages</span>
                  </div>
                </div>
              </div>

              {/* Right Actions Bar */}
              <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Resume / Continue Session */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onNavigateToChat(session.id);
                  }}
                  className="px-3.5 py-1.5 rounded-xl glass-button text-xs font-semibold text-slate-700 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  <span>Resume</span>
                </button>

                {/* Pin Toggle Button */}
                <button
                  onClick={() => handleTogglePin(session)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    session.isPinned
                      ? 'text-purple-600 bg-purple-100/80'
                      : 'text-slate-300 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  title={session.isPinned ? 'Unpin Session' : 'Pin Session'}
                >
                  <Pin className={`w-4 h-4 ${session.isPinned ? 'fill-purple-600' : ''}`} />
                </button>

                {/* Rename Button */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setEditingId(session.id);
                    setEditTitle(session.title);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                  title="Rename Session"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center space-y-3">
            <History className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No active sessions found</h3>
            <p className="text-xs text-slate-400">Start a new conversation to create your first session.</p>
          </div>
        )}
      </div>
    </div>
  );
};
