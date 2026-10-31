import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  FileText,
  Send,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Link2,
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
  User,
  ArrowRightLeft
} from 'lucide-react';
import { ExchangeRequest, ChatMessage, SharedNote, SkillCategoryName } from '../types';
import { storage } from '../services/storage';

interface PeerChatAndNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ExchangeRequest | null;
  initialTab?: 'chat' | 'notes';
  onScheduleSession?: (peerId: string, skill: string) => void;
  onRequestAccepted?: () => void;
}

export const PeerChatAndNotesModal: React.FC<PeerChatAndNotesModalProps> = ({
  isOpen,
  onClose,
  request,
  initialTab = 'chat',
  onScheduleSession,
  onRequestAccepted,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>(initialTab);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Note Form State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSkill, setNoteSkill] = useState('');
  const [noteType, setNoteType] = useState<'NOTE' | 'CODE' | 'RESOURCE_LINK'>('NOTE');
  const [noteUrl, setNoteUrl] = useState('');
  const [noteCategory, setNoteCategory] = useState<SkillCategoryName>('Programming');

  const currentStudent = storage.getCurrentStudent();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (request && isOpen) {
      setNoteSkill(request.teachingSkill);
      refreshData();
    }
  }, [request, isOpen]);

  const refreshData = () => {
    if (!request) return;
    if (request.status === 'ACCEPTED') {
      setMessages(storage.getMessagesForRequest(request.id));
      setNotes(storage.getNotesForRequest(request.id));
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isOpen || !request) return null;

  const isAccepted = request.status === 'ACCEPTED';
  const isReceiver = currentStudent?.id === request.receiverId;
  const isSender = currentStudent?.id === request.senderId;
  const peerName = isReceiver ? request.senderName : request.receiverName;
  const peerCollege = isReceiver ? request.senderCollege : request.receiverCollege;
  const peerAvatarBg = isReceiver ? request.senderAvatarBg : request.receiverAvatarBg;
  const peerId = isReceiver ? request.senderId : request.receiverId;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !request) return;

    try {
      storage.sendMessage(request.id, text);
      setInputMessage('');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Could not send message');
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !request) return;

    try {
      storage.createSharedNote({
        requestId: request.id,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        skillName: noteSkill || request.teachingSkill,
        category: noteCategory,
        type: noteType,
        url: noteUrl.trim() || undefined
      });

      // Reset form
      setNoteTitle('');
      setNoteContent('');
      setNoteUrl('');
      setIsAddingNote(false);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Could not create note');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this shared note?')) {
      storage.deleteSharedNote(noteId);
      refreshData();
    }
  };

  const handleCopyNote = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAcceptRequestFromModal = () => {
    try {
      storage.acceptExchangeRequest(request.id);
      if (onRequestAccepted) onRequestAccepted();
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[86vh] flex flex-col overflow-hidden border border-[#E9DDFC]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF9FD] border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ backgroundColor: peerAvatarBg || '#7546D8' }}
            >
              {peerName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#202033]">{peerName}</h2>
                {isAccepted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Exchange Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Request Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[#77758A] flex items-center gap-1.5 mt-0.5">
                <span>{peerCollege}</span>
                <span>•</span>
                <span className="font-semibold text-[#5425A8]">
                  {request.teachingSkill} ⇄ {request.learningSkill}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAccepted && onScheduleSession && (
              <button
                onClick={() => {
                  onClose();
                  onScheduleSession(peerId, request.teachingSkill);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FD] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-bold hover:bg-[#E9DDFC] transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#7546D8]" />
                <span>Schedule Session</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CASE 1: REQUEST IS NOT ACCEPTED (STRICT LOCKOUT VIEW)    */}
        {/* ======================================================== */}
        {!isAccepted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8F7FC]">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-4 border border-amber-200 shadow-sm">
              <Lock className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              Peer Chat &amp; Notes Locked
            </span>

            <h3 className="text-xl font-extrabold text-[#202033] mb-2 max-w-md">
              Available Only After Request is Accepted
            </h3>

            <p className="text-xs text-[#77758A] max-w-lg mb-6 leading-relaxed">
              To protect student privacy and ensure mutual agreement, <strong>Peer Chat</strong> and <strong>Shared Study Notes</strong> unlock automatically once the skill exchange proposal is accepted by both peers.
            </p>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 max-w-md w-full mb-6 text-left shadow-xs">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100 mb-2">
                <span className="text-[#77758A]">Proposal Status:</span>
                <span className="font-bold text-amber-600">PENDING APPROVAL</span>
              </div>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Sender:</strong> {request.senderName} (Teaches: {request.teachingSkill})
                </p>
                <p>
                  <strong>Receiver:</strong> {request.receiverName} (Learns: {request.learningSkill})
                </p>
                <p className="text-[#77758A] italic mt-1">&quot;{request.message}&quot;</p>
              </div>
            </div>

            {isReceiver ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleAcceptRequestFromModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Accept Request &amp; Unlock Chat &amp; Notes Now</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#202033] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-xs text-[#77758A]">
                Waiting for <strong>{request.receiverName}</strong> to accept your request. You will be notified immediately once approved!
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* CASE 2: REQUEST IS ACCEPTED (ACTIVE CHAT & SHARED NOTES) */
          /* ======================================================== */
          <>
            {/* Tab Switcher */}
            <div className="flex items-center px-6 bg-white border-b border-gray-100 text-xs font-bold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'chat'
                    ? 'border-[#7546D8] text-[#5425A8]'
                    : 'border-transparent text-[#77758A] hover:text-[#202033]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>1. Peer Chat ({messages.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-[#7546D8] text-[#5425A8]'
                    : 'border-transparent text-[#77758A] hover:text-[#202033]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>2. Shared Study Notes &amp; Resources ({notes.length})</span>
              </button>
            </div>

            {/* TAB 1: PEER CHAT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col bg-[#FAF9FD] overflow-hidden">
                {/* Messages Body */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 max-w-lg mx-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Skill Exchange Connected! You and <strong>{peerName}</strong> can now chat, coordinate learning sessions, and share notes.
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-[#77758A] text-xs">
                      <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-semibold">No messages yet.</p>
                      <p className="text-[11px] mt-0.5">Say hello to {peerName} and discuss your first session!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === currentStudent?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${isMe ? 'text-right' : 'text-left'}`}>
                            <div className="text-[10px] text-[#77758A] mb-0.5 px-1 font-semibold">
                              {msg.senderName}
                            </div>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                                isMe
                                  ? 'bg-gradient-to-r from-[#5425A8] to-[#7546D8] text-white rounded-br-none'
                                  : 'bg-white text-[#202033] border border-gray-100 rounded-tl-none'
                              }`}
                            >
                              {msg.text}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1 px-1">
                              {msg.timestamp}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Chat Starters */}
                <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                  {[
                    `Hey ${peerName.split(' ')[0]}! When are you free for our first session?`,
                    'I just checked the shared notes tab. Looks great!',
                    'Shall we connect over Google Meet this weekend?'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 bg-[#FAF9FD] hover:bg-[#E9DDFC] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-[11px] font-medium shrink-0 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Field */}
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
                      placeholder={`Message ${peerName}...`}
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-[#FAF9FD] border border-gray-200 rounded-xl text-xs text-[#202033] focus:outline-none focus:border-[#7546D8] focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="p-2.5 bg-[#7546D8] hover:bg-[#5425A8] disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: SHARED STUDY NOTES & RESOURCES */}
            {activeTab === 'notes' && (
              <div className="flex-1 flex flex-col bg-[#FAF9FD] overflow-hidden p-5">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#202033]">
                      Shared Study Notes &amp; Resources
                    </h3>
                    <p className="text-xs text-[#77758A]">
                      Share code snippets, documentation links, and cheat sheets for {request.teachingSkill} and {request.learningSkill}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="px-3.5 py-2 bg-[#5425A8] hover:bg-[#431D86] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5425A8]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isAddingNote ? 'Cancel' : 'Share New Note'}</span>
                  </button>
                </div>

                {/* Add Note Form */}
                {isAddingNote && (
                  <form
                    onSubmit={handleCreateNote}
                    className="p-4 bg-white rounded-2xl border border-[#E9DDFC] shadow-sm mb-4 space-y-3 shrink-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5425A8]">Add Note or Code Snippet</span>
                      <div className="flex items-center gap-2">
                        {(['NOTE', 'CODE', 'RESOURCE_LINK'] as const).map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setNoteType(type)}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                              noteType === type
                                ? 'bg-[#7546D8] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Title (e.g. Python List Comprehensions Cheat Sheet)"
                        value={noteTitle}
                        onChange={e => setNoteTitle(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                      />
                      <input
                        type="text"
                        placeholder="Skill Name (e.g. Python, Java, Docker)"
                        value={noteSkill}
                        onChange={e => setNoteSkill(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                      />
                    </div>

                    {noteType === 'RESOURCE_LINK' && (
                      <input
                        type="url"
                        placeholder="Resource URL (e.g. https://github.com/... or https://docs.oracle.com)"
                        value={noteUrl}
                        onChange={e => setNoteUrl(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                      />
                    )}

                    <textarea
                      required
                      rows={4}
                      placeholder={
                        noteType === 'CODE'
                          ? 'Paste code snippet here...'
                          : 'Write concept explanations, key points, interview tips...'
                      }
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8] font-mono"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingNote(false)}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#7546D8] hover:bg-[#5425A8] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Publish to Shared Hub
                      </button>
                    </div>
                  </form>
                )}

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-6">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#202033]">No notes shared yet</p>
                      <p className="text-[11px] text-[#77758A] mt-1 max-w-sm mx-auto">
                        Click &quot;Share New Note&quot; above to post code examples, summaries, or links for {peerName}.
                      </p>
                    </div>
                  ) : (
                    notes.map(note => {
                      const isMyNote = note.authorId === currentStudent?.id;
                      return (
                        <div
                          key={note.id}
                          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs hover:border-[#E9DDFC] transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {note.type === 'CODE' && (
                                <span className="p-1.5 bg-purple-50 text-[#7546D8] rounded-lg">
                                  <Code2 className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {note.type === 'RESOURCE_LINK' && (
                                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                  <Link2 className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {note.type === 'NOTE' && (
                                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                  <FileText className="w-3.5 h-3.5" />
                                </span>
                              )}

                              <h4 className="text-xs font-extrabold text-[#202033]">{note.title}</h4>
                              <span className="text-[10px] bg-purple-100 text-[#5425A8] px-2 py-0.2 rounded-md font-bold">
                                {note.skillName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopyNote(note.content, note.id)}
                                className="p-1.5 text-gray-400 hover:text-[#5425A8] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                                title="Copy content"
                              >
                                {copiedId === note.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {isMyNote && (
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="bg-[#FAF9FD] p-3 rounded-xl border border-gray-100 font-mono text-xs text-[#202033] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </div>

                          {note.url && (
                            <a
                              href={note.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 text-[11px] text-[#7546D8] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Open Resource Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#77758A] pt-2 border-t border-gray-50">
                            <span>Author: <strong>{note.authorName}</strong></span>
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
