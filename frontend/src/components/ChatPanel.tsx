import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Mic,
  Bot,
  User,
  Smile,
  Terminal,
  ArrowDown
} from 'lucide-react';
import { ChatMessage, AIEmotion } from '../types';
import { SAMPLE_PROMPT_SUGGESTIONS } from '../utils/mockData';
import { soundFx } from '../utils/soundEffects';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isThinking: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onClearChat,
  isThinking
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isThinking]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    soundFx.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    soundFx.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 bottom-24 z-50 w-full max-w-md bg-white/85 backdrop-blur-2xl border border-pink-200/70 rounded-3xl shadow-2xl shadow-pink-100/70 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-6 duration-300 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-pink-100 bg-rose-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-200">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              CONVERSATION WITH SHIZUKA
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </h3>
            <p className="text-[10px] font-mono text-rose-500">REALTIME CHAT</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              soundFx.playClick();
              onClearChat();
            }}
            title="Clear Chat History"
            className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} gap-1.5`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 px-1">
                {isAI ? (
                  <>
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span className="font-semibold text-rose-600">SHIZUKA</span>
                    {msg.emotion && (
                      <span className="bg-pink-100 text-rose-700 border border-pink-200 px-1.5 py-0.2 rounded-full uppercase text-[9px] font-bold">
                        {msg.emotion}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-slate-700">YOU</span>
                    <User className="w-3 h-3 text-purple-500" />
                  </>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              {/* Chat Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                  isAI
                    ? 'bg-rose-50/90 border border-pink-200/80 text-slate-800 rounded-tl-xs'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-tr-xs shadow-md shadow-rose-200/50'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Optional Code Block */}
                {msg.codeBlock && (
                  <div className="mt-3 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden font-mono text-[11px] text-slate-100">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 text-[10px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-pink-400" />
                        {msg.codeBlock.language}
                      </span>
                      <button
                        onClick={() => handleCopyCode(msg.codeBlock!.code, msg.id)}
                        className="flex items-center gap-1 hover:text-white transition-all cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 overflow-x-auto text-pink-300">
                      <code>{msg.codeBlock.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-rose-500 text-xs font-mono p-2">
            <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
            <span>Shizuka is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 border-t border-pink-100 bg-rose-50/40">
        <span className="text-[10px] font-bold text-slate-500 block mb-1">
          SUGGESTED PROMPTS:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {SAMPLE_PROMPT_SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundFx.playClick();
                onSendMessage(prompt);
              }}
              className="text-[11px] font-medium text-slate-700 bg-white hover:bg-rose-100 border border-pink-200/80 rounded-full px-2.5 py-1 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-pink-100 bg-white/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-rose-50/60 border border-pink-200 rounded-2xl p-1.5 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-200 transition-all"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Talk with Shizuka..."
            className="flex-1 bg-transparent px-3 text-xs text-slate-800 placeholder-slate-400 outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              inputText.trim()
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
