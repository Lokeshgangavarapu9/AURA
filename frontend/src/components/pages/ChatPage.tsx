import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Image as ImageIcon,
  Paperclip,
  Copy,
  RotateCcw,
  Trash2,
  Edit2,
  Video,
  Monitor,
  Sparkles,
  Check,
  Volume2,
  FileText,
  X,
  Plus
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { soundFx } from '../../utils/soundEffects';

export interface ChatPageProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isThinking?: boolean;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isThinking = false
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [placeholderNotice, setPlaceholderNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage && !attachedFile) return;

    let textToSend = inputText.trim();
    if (attachedImage) {
      textToSend += ` [Attached Image: ${attachedImage}]`;
    }
    if (attachedFile) {
      textToSend += ` [Attached File: ${attachedFile}]`;
    }

    onSendMessage(textToSend);
    setInputText('');
    setAttachedImage(null);
    setAttachedFile(null);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundFx.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateImageUpload = () => {
    soundFx.playClick();
    setAttachedImage('companion_memory.png');
  };

  const handleSimulateFileUpload = () => {
    soundFx.playClick();
    setAttachedFile('reflection_notes.pdf');
  };

  const triggerPlaceholderFeature = (featureName: string) => {
    soundFx.playClick();
    setPlaceholderNotice(`${featureName} is reserved for future releases.`);
    setTimeout(() => setPlaceholderNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-24 sm:py-28 text-slate-800 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border border-white/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 p-0.5 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Shizuka
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                Online & Listening
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Empathetic Companion • Realtime Memory</p>
          </div>
        </div>

        {/* Action Controls & Future Placeholders */}
        <div className="flex items-center gap-2">
          {/* Placeholder: Video Call */}
          <button
            onClick={() => triggerPlaceholderFeature('Video Call')}
            className="p-2.5 rounded-2xl bg-white/70 hover:bg-pink-50 border border-white/80 text-slate-600 hover:text-pink-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Video Call"
          >
            <Video className="w-4 h-4 text-pink-500" />
            <span className="hidden sm:inline">Video Call</span>
          </button>

          {/* Placeholder: Screen Share */}
          <button
            onClick={() => triggerPlaceholderFeature('Screen Share')}
            className="p-2.5 rounded-2xl bg-white/70 hover:bg-purple-50 border border-white/80 text-slate-600 hover:text-purple-600 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Screen Share"
          >
            <Monitor className="w-4 h-4 text-purple-500" />
            <span className="hidden sm:inline">Screen Share</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={() => {
              soundFx.playClick();
              onClearChat();
            }}
            className="p-2.5 rounded-2xl bg-white/70 hover:bg-rose-50 border border-white/80 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Notification Toast */}
      {placeholderNotice && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-pink-100/90 border border-pink-200 text-xs font-semibold text-pink-800 text-center shadow-sm animate-in fade-in duration-200">
          ✨ {placeholderNotice}
        </div>
      )}

      {/* Main Conversation Glass Scroll Area */}
      <div className="glass-card rounded-3xl p-4 sm:p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 no-scrollbar border border-white/80">
        {messages.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
            <Sparkles className="w-8 h-8 text-pink-300 animate-pulse" />
            <p className="text-sm font-medium text-slate-600">Start a warm conversation with Shizuka...</p>
            <p className="text-xs text-slate-400">Ask a question, share a thought, or record a voice note.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} space-y-1 group`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium px-1">
                  <span>{isAI ? 'Shizuka' : 'You'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="relative max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                      isAI
                        ? 'bg-white/90 text-slate-800 rounded-tl-sm border border-pink-100/80'
                        : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-tr-sm shadow-pink-500/20'
                    }`}
                  >
                    {/* Message Content */}
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Simulated Voice Audio Player if Voice Note */}
                    {msg.text.toLowerCase().includes('voice') && (
                      <div className="mt-2 pt-2 border-t border-slate-100/40 flex items-center gap-2">
                        <button
                          onClick={() => soundFx.triggerSpeechBlip()}
                          className="p-1.5 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex-1 bg-pink-50 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-pink-400 h-full w-[60%]" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">0:14</span>
                      </div>
                    )}
                  </div>

                  {/* Message Action Controls (Copy, Regenerate, Delete) */}
                  <div
                    className={`absolute bottom-[-28px] ${
                      isAI ? 'left-1' : 'right-1'
                    } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200/80 shadow-xs z-10`}
                  >
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="p-1 text-slate-400 hover:text-pink-600 transition-colors"
                      title="Copy Message"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>

                    {isAI && (
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          onSendMessage('Please rephrase that with more detail.');
                        }}
                        className="p-1 text-slate-400 hover:text-purple-600 transition-colors"
                        title="Regenerate"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing / Streaming Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-pink-600 font-medium p-3 bg-white/80 rounded-2xl w-fit border border-pink-100">
            <Sparkles className="w-4 h-4 animate-spin text-pink-500" />
            <span>Shizuka is reflecting and typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview Bar */}
      {(attachedImage || attachedFile) && (
        <div className="mt-3 px-4 py-2 bg-white/80 rounded-2xl border border-pink-100 flex items-center gap-3 text-xs text-slate-700">
          <span className="font-semibold text-pink-600">Attached:</span>
          {attachedImage && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-200">
              <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
              {attachedImage}
              <X className="w-3 h-3 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => setAttachedImage(null)} />
            </span>
          )}
          {attachedFile && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              {attachedFile}
              <X className="w-3 h-3 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => setAttachedFile(null)} />
            </span>
          )}
        </div>
      )}

      {/* Input Glass Control Panel */}
      <div className="mt-3 glass-card rounded-3xl p-3 flex items-center gap-2 border border-white/90 shadow-lg shadow-pink-100/20">
        <button
          onClick={handleSimulateImageUpload}
          className="p-2.5 rounded-2xl hover:bg-pink-50 text-slate-400 hover:text-pink-600 transition-colors"
          title="Attach Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <button
          onClick={handleSimulateFileUpload}
          className="p-2.5 rounded-2xl hover:bg-purple-50 text-slate-400 hover:text-purple-600 transition-colors"
          title="Attach File"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Share your thoughts with Shizuka..."
          className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() && !attachedImage && !attachedFile}
          className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md hover:shadow-pink-300/40 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
