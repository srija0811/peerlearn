import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ChevronDown,
  Minimize2,
  Maximize2,
  RefreshCw,
  Copy,
  Check,
  BookOpen,
  Code2,
  Compass,
  GraduationCap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'How does PeerLearn mutual skill matching work?',
  'Create a 3-week study roadmap for Java Spring Boot',
  'Explain Docker multi-stage builds in simple terms',
  'Give me 5 practice interview questions for Python DSA',
  'How should I structure my first 60-min skill exchange session?'
];

export const AIChatbotModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am **PeerLearn AI Study Assistant**. 🎓\n\nI can help you with:\n- **Technical Roadmaps** for Python, Java, Docker, K8s, and ML\n- **Study Session Agendas** to prepare for your peer exchanges\n- **Code Explanations & Debugging**\n- **Mutual Skill Matching tips**\n\nWhat would you like to learn or teach today?`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I'm here to help you learn and teach skills with your peers! What topic would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
    } catch {
      // Smart offline fallback response
      const fallbackReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: generateLocalAIResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#5425A8] to-[#7546D8] hover:from-[#431D86] hover:to-[#5425A8] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 cursor-pointer group border-2 border-white/20"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-tight hidden sm:inline">
            PeerLearn AI Tutor
          </span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono hidden md:inline">
            Gemini 3.8
          </span>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl border border-[#E9DDFC] bg-white rounded-3xl overflow-hidden flex flex-col ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-16'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[460px] h-[82vh] max-h-[680px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#5425A8] to-[#7546D8] text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold">PeerLearn AI Study Assistant</h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[#E9DDFC]">Peer Learning &amp; Tech Mentor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Minimized View Bar */}
          {isMinimized ? (
            <div
              onClick={() => setIsMinimized(false)}
              className="p-3 bg-white flex items-center justify-between text-xs text-[#5425A8] font-bold cursor-pointer"
            >
              <span>Click to restore conversation</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          ) : (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF9FD]">
                {messages.map(msg => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-end flex-row-reverse'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          isAi
                            ? 'bg-[#7546D8] text-white shadow-xs'
                            : 'bg-[#202033] text-white shadow-xs'
                        }`}
                      >
                        {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div className={`max-w-[85%] group ${isAi ? 'text-left' : 'text-right'}`}>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isAi
                              ? 'bg-white text-[#202033] border border-gray-100 rounded-tl-none whitespace-pre-wrap'
                              : 'bg-gradient-to-r from-[#5425A8] to-[#7546D8] text-white rounded-br-none whitespace-pre-wrap'
                          }`}
                        >
                          {msg.text}
                        </div>

                        <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#77758A]">
                          <span>{msg.timestamp}</span>
                          {isAi && (
                            <button
                              onClick={() => handleCopy(msg.text, msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#5425A8] flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-[#7546D8] p-3 bg-white rounded-2xl border border-gray-100 w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7546D8]" />
                    <span>PeerLearn AI is crafting your study guidance...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2.5 bg-white border-t border-gray-100 overflow-x-auto shrink-0 flex gap-1.5 scrollbar-none">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1.5 bg-[#FAF9FD] hover:bg-[#E9DDFC] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-[11px] font-medium shrink-0 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask about a skill, study roadmap, or peer session..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 bg-[#FAF9FD] border border-gray-200 rounded-xl text-xs text-[#202033] focus:outline-none focus:border-[#7546D8] focus:bg-white transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="p-2.5 bg-[#7546D8] hover:bg-[#5425A8] disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

function generateLocalAIResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('mutual') || q.includes('matching') || q.includes('algorithm')) {
    return `### How PeerLearn Mutual Skill Matching Works:
1. **Reciprocal Alignment**:
   - If Student A can TEACH Python and wants to LEARN Java.
   - And Student B can TEACH Java and wants to LEARN Python.
   - The platform calculates an **85% - 100% Mutual Match Score**.
2. **Direct Connection**:
   - You can send an **Exchange Request** directly from the Smart Matching tab.
   - Once the other student clicks **Accept**, you can start chatting and sharing study notes!`;
  }

  if (q.includes('docker') || q.includes('k8s') || q.includes('kubernetes')) {
    return `### Docker & Kubernetes Quick Guide for Students:
- **Docker**: Packages your Spring Boot app and MySQL into portable containers:
  \`\`\`dockerfile
  FROM maven:3.9.8-eclipse-temurin-21-jammy AS builder
  ...
  FROM eclipse-temurin:21-jre-jammy
  COPY --from=builder /app/target/*.jar app.jar
  ENTRYPOINT ["java", "-jar", "app.jar"]
  \`\`\`
- **Kubernetes**: Manages 2 app replicas with Rolling Updates on **NodePort 30080**, connecting to MySQL on port **3306** via persistent volume storage.`;
  }

  if (q.includes('roadmap') || q.includes('study plan') || q.includes('spring boot')) {
    return `### Recommended 3-Week Peer Exchange Roadmap:
- **Week 1 (Foundations)**: Core Java OOP, Streams API, and Python Data Structures. Schedule 2x 45-min peer sessions.
- **Week 2 (Frameworks & Data)**: Spring Boot REST controllers, Spring Data JPA, MySQL relationships. Add shared notes after sessions.
- **Week 3 (Deployment & DevOps)**: Dockerizing services, testing endpoints, and end-to-end integration!`;
  }

  if (q.includes('session') || q.includes('schedule') || q.includes('first')) {
    return `### 60-Minute Peer Session Best Practices:
1. **First 10 mins**: Review goals & clarify doubts from previous notes.
2. **35 mins**: Hands-on live coding / concept explanation (screen share).
3. **10 mins**: Q&A, key takeaways, and paste summary code in **Shared Study Notes**.
4. **Last 5 mins**: Complete the session in PeerLearn to award **+100 XP** to the mentor and **+50 XP** to the learner!`;
  }

  return `### PeerLearn Skill Recommendation:
Great question about "${query}"! In PeerLearn, you can pair up with campus peers who specialize in this.

**Next Steps**:
1. Check **Smart Matching** to see students offering this skill.
2. Send an **Exchange Request** proposing what you can teach in return.
3. Once accepted, open the **Peer Chat** to coordinate and exchange study notes!`;
}
