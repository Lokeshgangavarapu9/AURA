import React from 'react';
import { X, History, MessageSquare, Clock, Plus, ChevronRight } from 'lucide-react';
import { ConversationHistoryItem } from '../types';
import { soundFx } from '../utils/soundEffects';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: ConversationHistoryItem[];
  onSelectSession: (session: ConversationHistoryItem) => void;
  onNewSession: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyList,
  onSelectSession,
  onNewSession
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xs sm:max-w-sm h-full bg-slate-900 border-r border-white/15 p-5 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100">PAST CONVERSATIONS</h2>
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

        {/* New Chat Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onNewSession();
            onClose();
          }}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Start New Conversation
        </button>

        {/* History Session List */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2.5 no-scrollbar pr-1">
          {historyList.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                soundFx.playClick();
                onSelectSession(item);
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group flex items-start justify-between gap-2"
            >
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.timestamp}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    {item.messageCount} msgs
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors self-center" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-slate-500 text-center">
          AURA MEMORY SUBSYSTEM • LOCAL CACHE
        </div>
      </div>
    </div>
  );
};
