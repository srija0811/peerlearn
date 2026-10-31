import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Calendar,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { Student } from '../types';
import { ChatMessage, sendAIChatMessage, StudentAIContext } from '../services/aiChat';

interface AIChatBotProps {
  currentStudent: Student | null;
  isOpen: boolean;
  onToggle: () => void;
  onOpenScheduler?: (defaultSkill?: string) => void;
  onNavigate?: (tab: string) => void;
  isEmbedded?: boolean; // When rendered as full page tab
}

const INITIAL_GREETING: ChatMessage = {
  id: 'msg-welcome',
  sender: 'bot',
  text: `### 👋 Hi there! I'm **PeerBot**, your AI Learning Advisor.

I'm powered by **Gemini 3.8 Flash** to help you exchange skills faster and master new technologies with your peers.

Here are a few things you can ask me:
- **Session Agendas:** *"Plan a 60-minute agenda for teaching Spring Boot"*
- **Study Roadmaps:** *"Give me a 4-week roadmap to learn Python & FastAPI"*
- **Exchange Requests:** *"Draft a friendly proposal to exchange React for Java"*
- **Complementary Skills:** *"What skills pair well with Cloud & DevOps?"*`,
  timestamp: 'Just now',
  source: 'gemini-3.8-flash'
};

const QUICK_PROMPTS = [
  { label: '⏱️ 60-Min Session Agenda', prompt: 'Plan a structured 60-minute peer exchange session agenda for teaching Spring Boot.' },
  { label: '🗺️ Java 21 & Spring Roadmap', prompt: 'Create a 4-week study roadmap for learning Java 21 and Spring Boot 3.' },
  { label: '✉️ Draft Exchange Proposal', prompt: 'Draft a polite and engaging peer exchange request message for a student who teaches Python.' },
  { label: '💡 Skill Pairing Advice', prompt: 'What are high-demand technical skills that pair well together in a reciprocal peer exchange?' },
  { label: '🐳 Explain Kubernetes vs Docker', prompt: 'Explain the difference between Docker and Kubernetes in simple terms for a student.' }
];

export const AIChatBot: React.FC<AIChatBotProps> = ({
  currentStudent,
  isOpen,
  onToggle,
  onOpenScheduler,
  onNavigate,
  isEmbedded = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('peerlearn_ai_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [INITIAL_GREETING];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('peerlearn_ai_chat_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBack = () => {
    if (isEmbedded) {
      if (onNavigate) {
        onNavigate('dashboard');
      } else {
        onToggle();
      }
    } else {
      onToggle();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, isEmbedded]);

  // Close floating chat when clicking outside
  useEffect(() => {
    if (!isOpen || isEmbedded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        // Only trigger if click wasn't on the toggle trigger buttons
        const target = e.target as HTMLElement;
        if (target.closest('[aria-label="Open PeerBot AI Chat"]') || target.closest('[title*="AI Mentor"]')) {
          return;
        }
        onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isEmbedded, onToggle]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const studentContext: StudentAIContext | null = currentStudent
        ? {
            id: currentStudent.id,
            name: currentStudent.name,
            collegeName: currentStudent.collegeName,
            branch: currentStudent.branch,
            academicYear: currentStudent.academicYear,
            teachingSkills: currentStudent.skills.filter(s => s.type === 'TEACH').map(s => s.skillName),
            learningSkills: currentStudent.skills.filter(s => s.type === 'LEARN').map(s => s.skillName),
            xpPoints: currentStudent.xpPoints
          }
        : null;

      const { reply, source } = await sendAIChatMessage(textToSend, newHistory, studentContext);

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: source || 'gemini-3.8-flash'
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: `⚠️ **Connection Note:** I was unable to reach the inference service. Please check your network or try asking another question.

*Tip: You can ask for Spring Boot roadmaps, session agendas, or proposal templates anytime.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'system'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear your conversation history with PeerBot?')) {
      setMessages([INITIAL_GREETING]);
      localStorage.removeItem('peerlearn_ai_chat_history');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Basic Markdown Formatter for bold, lists, quotes, and headers
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-[#202033] mt-2 mb-1 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Header 2 or 1
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return (
          <h3 key={idx} className="text-base font-extrabold text-[#5425A8] mt-2 mb-1">
            {line.replace(/^#+ /, '')}
          </h3>
        );
      }
      // Blockquote
      if (line.startsWith('> ')) {
        return (
          <div key={idx} className="pl-3 border-l-2 border-[#7546D8] italic text-xs my-1 bg-[#F9F7FD] py-1 pr-2 rounded-r">
            {line.replace(/^> /, '')}
          </div>
        );
      }
      // Bullet list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemContent = line.replace(/^[-*] /, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed my-0.5">
            {parseInlineMarkdown(itemContent)}
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} className="ml-4 list-decimal text-xs leading-relaxed my-0.5">
            {parseInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-xs leading-relaxed my-1">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Inline formatting: **bold**, `code`, *italic*
  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-[#202033]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 bg-gray-100 text-[#5425A8] font-mono text-[11px] rounded">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-gray-700">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Embedded Full Page View
  if (isEmbedded) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto overflow-hidden">
        {/* Header with Prominent Back Button */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#FAF9FE] to-white">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              title="Back to Dashboard (Esc)"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F3EFFC] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-102"
            >
              <ArrowLeft className="w-4 h-4 text-[#7546D8]" />
              <span>Back</span>
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center shadow-md shadow-[#5425A8]/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#202033]">PeerBot AI Mentor</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9DDFC] text-[#5425A8]">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-[#77758A]">
                Your personal AI Academic & Peer Skill Exchange Advisor (Ask any subject!)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              title="Close and return to dashboard"
              className="flex items-center gap-1 px-3 py-1.5 bg-[#FAF9FD] hover:bg-[#E9DDFC] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </button>
            <button
              onClick={handleClearHistory}
              title="Clear Chat History"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-[#FAF9FD] border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-[#77758A] whitespace-nowrap flex items-center gap-1 shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-[#F5A623]" /> Quick Prompts:
          </span>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={isLoading}
              className="text-[11px] font-medium px-3 py-1 bg-white hover:bg-[#E9DDFC]/40 text-[#202033] hover:text-[#5425A8] border border-gray-200 hover:border-[#7546D8]/30 rounded-full whitespace-nowrap transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs relative group ${
                  msg.sender === 'user'
                    ? 'bg-[#7546D8] text-white rounded-br-xs'
                    : 'bg-[#F9F8FD] text-[#202033] border border-gray-100 rounded-bl-xs'
                }`}
              >
                <div className="text-xs">
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>{renderFormattedText(msg.text)}</div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gray-200 text-[#202033] flex items-center justify-center shrink-0 font-bold text-xs">
                  {currentStudent ? currentStudent.name.charAt(0) : 'U'}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#F9F8FD] border border-gray-100 rounded-2xl rounded-bl-xs p-3.5 flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#7546D8] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#7546D8] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#7546D8] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-[#77758A] ml-2">PeerBot is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="flex items-end gap-2 bg-[#F8F7FC] border border-gray-200 focus-within:border-[#7546D8] focus-within:ring-2 focus-within:ring-[#7546D8]/20 rounded-2xl p-2 transition-all">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask PeerBot anything (e.g. roadmaps, session agendas, exchange proposals)..."
              className="flex-1 bg-transparent border-0 focus:outline-none resize-none text-xs text-[#202033] placeholder:text-gray-400 max-h-32 p-1.5"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-[#7546D8] hover:bg-[#5425A8] text-white rounded-xl disabled:opacity-40 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#77758A]">
            <span>Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">Shift+Enter</kbd> for newline</span>
            <span>Server-side inference via <strong>Gemini 3.8 Flash</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Floating Widget View
  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          aria-label="Open PeerBot AI Chat"
          className="fixed bottom-6 right-6 z-50 p-3.5 bg-gradient-to-tr from-[#5425A8] to-[#7546D8] hover:scale-105 active:scale-95 text-white rounded-full shadow-2xl shadow-[#5425A8]/40 flex items-center gap-2.5 transition-all cursor-pointer group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline">Ask AI Mentor</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          ref={chatRef}
          className={`fixed z-50 transition-all duration-300 ease-out bg-white shadow-2xl border border-[#E9DDFC] flex flex-col overflow-hidden ${
            isExpanded
              ? 'inset-2 sm:inset-6 rounded-2xl sm:rounded-3xl'
              : 'bottom-2 sm:bottom-4 right-2 sm:right-6 w-[min(96vw,440px)] h-[min(560px,calc(100dvh-4.5rem))] max-h-[calc(100dvh-4.5rem)] rounded-2xl sm:rounded-3xl'
          }`}
        >
          {/* Header with Back & Close Button */}
          <div className="p-3 sm:p-3.5 bg-gradient-to-r from-[#5425A8] to-[#7546D8] text-white flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                title="Go Back / Close Chat (Esc)"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#5425A8] hover:bg-[#F3EFFC] active:scale-95 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border border-white"
              >
                <ArrowLeft className="w-4 h-4 text-[#5425A8]" />
                <span>Back</span>
              </button>
              <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold tracking-tight">PeerBot AI Mentor</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-white/80">
                  Gemini 3.8 Flash
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear History"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Shrink' : 'Expand'}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleBack}
                title="Close Chat (Esc)"
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prompt chips */}
          <div className="px-3 py-2 bg-[#FAF9FD] border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={handleBack}
              title="Close Chat"
              className="text-[10px] font-bold px-2.5 py-0.5 bg-[#FAF9FD] hover:bg-red-50 text-[#7546D8] hover:text-red-600 border border-[#E9DDFC] hover:border-red-200 rounded-full flex items-center gap-1 shrink-0 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Close</span>
            </button>
            <span className="text-[10px] font-bold text-[#77758A] flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-[#7546D8]" /> Chips:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={isLoading}
                className="text-[10px] font-medium px-2.5 py-0.5 bg-white hover:bg-[#E9DDFC]/50 text-[#202033] hover:text-[#5425A8] border border-gray-200 rounded-full whitespace-nowrap transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#FCFBFF]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#7546D8] text-white rounded-br-xs'
                      : 'bg-white text-[#202033] border border-gray-100 rounded-bl-xs'
                  }`}
                >
                  <div className="text-xs">
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div>{renderFormattedText(msg.text)}</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[9px] opacity-75">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-green-600" />
                            <span className="text-green-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-xs px-3 py-2 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7546D8] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7546D8] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7546D8] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-[#77758A] ml-1">Generating response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Footer */}
          {onOpenScheduler && (
            <div className="px-3 py-1.5 bg-[#FAF9FE] border-t border-gray-100 flex items-center justify-between text-[11px]">
              <span className="text-[#77758A] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#5425A8]" /> Ready to meet?
              </span>
              <button
                onClick={() => onOpenScheduler()}
                className="font-bold text-[#5425A8] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Schedule Session <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-end gap-1.5 bg-[#F8F7FC] border border-gray-200 focus-within:border-[#7546D8] focus-within:ring-2 focus-within:ring-[#7546D8]/20 rounded-xl p-1.5 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask PeerBot for advice, agendas, or roadmaps..."
                className="flex-1 bg-transparent border-0 focus:outline-none resize-none text-xs text-[#202033] placeholder:text-gray-400 max-h-24 p-1"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="p-2 bg-[#7546D8] hover:bg-[#5425A8] text-white rounded-lg disabled:opacity-40 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#77758A]">
              <button
                onClick={handleBack}
                className="text-[#7546D8] hover:text-[#5425A8] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                title="Close Chat (or press Esc)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Close Chat (Esc)</span>
              </button>
              <span>Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
