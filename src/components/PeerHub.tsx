import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  FileText,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  Link2,
  ExternalLink,
  Calendar,
  Sparkles,
  ArrowRightLeft,
  Users,
  X,
  Paperclip,
  Download
} from 'lucide-react';
import { Student, ExchangeRequest, ChatMessage, SharedNote } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';

interface PeerHubProps {
  currentStudent: Student | null;
  requests: ExchangeRequest[];
  initialRequestId?: string | null;
  isBackendSession: boolean;
  onNavigate: (tab: string) => void;
  onScheduleSession: (peerId?: string, defaultSkill?: string) => void;
  onRequestsUpdated: () => void;
}

export const PeerHub: React.FC<PeerHubProps> = ({
  currentStudent,
  requests,
  initialRequestId,
  isBackendSession,
  onNavigate,
  onScheduleSession,
  onRequestsUpdated,
}) => {
  const userRequests = currentStudent
    ? (isBackendSession ? requests : storage.getRequests()).filter(
        request => request.senderId === currentStudent.id || request.receiverId === currentStudent.id
      )
    : [];

  const acceptedRequests = userRequests.filter(r => r.status === 'ACCEPTED');
  const pendingRequests = userRequests.filter(r => r.status === 'PENDING');

  const [selectedRequest, setSelectedRequest] = useState<ExchangeRequest | null>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // New Note state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSkill, setNoteSkill] = useState('');
  const [noteType, setNoteType] = useState<'NOTE' | 'CODE' | 'RESOURCE_LINK'>('NOTE');
  const [noteUrl, setNoteUrl] = useState('');

  useEffect(() => {
    const requestId = initialRequestId || selectedRequest?.id;
    const updatedSelected = userRequests.find(request => request.id === requestId);
    setSelectedRequest(updatedSelected || acceptedRequests[0] || pendingRequests[0] || null);
  }, [requests, currentStudent?.id, isBackendSession, initialRequestId]);

  useEffect(() => {
    let active = true;
    const loadMessages = async () => {
      if (!selectedRequest || !isBackendSession || selectedRequest.status !== 'ACCEPTED') {
        setMessages([]);
        setChatError(null);
        return;
      }

      try {
        const loadedMessages = await api.getMessages(selectedRequest.id);
        if (active) {
          setMessages(loadedMessages);
          setChatError(null);
        }
      } catch (error) {
        if (active) {
          setChatError(error instanceof Error ? error.message : 'Unable to load private messages.');
        }
      }
    };

    void loadMessages();
    const timer = window.setInterval(() => void loadMessages(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [selectedRequest?.id, selectedRequest?.status, isBackendSession]);

  useEffect(() => {
    if (!selectedRequest) {
      setNotes([]);
      return;
    }
    setNotes(storage.getNotesForRequest(selectedRequest.id));
  }, [selectedRequest?.id, selectedRequest?.status]);

  if (!currentStudent) return null;

  const isAccepted = selectedRequest?.status === 'ACCEPTED';
  const isReceiver = selectedRequest ? currentStudent.id === selectedRequest.receiverId : false;

  const peerName = selectedRequest
    ? isReceiver ? selectedRequest.senderName : selectedRequest.receiverName
    : '';
  const peerCollege = selectedRequest
    ? isReceiver ? selectedRequest.senderCollege : selectedRequest.receiverCollege
    : '';
  const peerAvatarBg = selectedRequest
    ? isReceiver ? selectedRequest.senderAvatarBg : selectedRequest.receiverAvatarBg
    : '#7546D8';
  const peerId = selectedRequest
    ? isReceiver ? selectedRequest.senderId : selectedRequest.receiverId
    : '';

  const visibleNotes: SharedNote[] = selectedRequest && isAccepted
    ? notes
    : [];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !selectedRequest || !isAccepted || !isBackendSession || isSending) return;

    try {
      setIsSending(true);
      setChatError(null);
      const savedMessage = await api.sendMessage(selectedRequest.id, text);
      setMessages(previous => [...previous, savedMessage]);
      setInputMessage('');
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !selectedRequest || !isAccepted || !isBackendSession || isUploadingAttachment) return;
    if (file.size > 10 * 1024 * 1024) {
      setChatError('Attachments must be 10 MB or smaller.');
      return;
    }

    try {
      setIsUploadingAttachment(true);
      setChatError(null);
      const savedMessage = await api.sendMessageAttachment(selectedRequest.id, file);
      setMessages(previous => [...previous, savedMessage]);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Could not upload attachment.');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !selectedRequest || !isAccepted) return;

    try {
      storage.createSharedNote({
        requestId: selectedRequest.id,
        authorId: currentStudent.id,
        authorName: currentStudent.name,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        skillName: noteSkill || selectedRequest.teachingSkill,
        type: noteType,
        url: noteUrl.trim() || undefined
      });

      setNoteTitle('');
      setNoteContent('');
      setNoteUrl('');
      setIsAddingNote(false);
      setNotes(storage.getNotesForRequest(selectedRequest.id));
      onRequestsUpdated();
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Could not create note.');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this shared study note?')) {
      storage.deleteSharedNote(noteId);
      if (selectedRequest) setNotes(storage.getNotesForRequest(selectedRequest.id));
      onRequestsUpdated();
    }
  };

  const handleCopyNote = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    try {
      if (isBackendSession) {
        await api.acceptRequest(selectedRequest.id);
        await onRequestsUpdated();
      } else {
        storage.acceptExchangeRequest(selectedRequest.id);
        onRequestsUpdated();
        const updated = storage.getRequests().find(r => r.id === selectedRequest.id);
        if (updated) setSelectedRequest(updated);
      }
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Could not accept request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-[#7546D8]" />
            <h1 className="text-xl font-extrabold text-[#202033]">Peer Chat &amp; Shared Study Notes</h1>
          </div>
          <p className="text-xs text-[#77758A]">
            Chat with accepted peers, coordinate learning sessions, and collaboratively build your shared study notes repository.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            {acceptedRequests.length} Active Connections
          </span>
          <span className="font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
            {pendingRequests.length} Pending (Locked)
          </span>
          <button
            type="button"
            aria-label="Close peer chat"
            onClick={() => onNavigate('dashboard')}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col md:flex-row h-[75vh] min-h-[600px]">
        {/* Left Sidebar: Peers List */}
        <div className="w-full md:w-80 border-r border-gray-100 bg-[#FAF9FD] flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100 bg-white">
            <span className="text-xs font-extrabold text-[#202033] uppercase tracking-wider block">
              Skill Exchange Peers
            </span>
            <span className="text-[11px] text-[#77758A]">
              Chat &amp; notes unlock after request acceptance
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Active Connections */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-bold text-[#16A36A] uppercase tracking-wider">
                <span>Active Connections ({acceptedRequests.length})</span>
                <span className="text-[9px] bg-emerald-100 px-1.5 py-0.2 rounded font-bold">Unlocked</span>
              </div>

              {acceptedRequests.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#77758A] bg-white rounded-xl border border-gray-100">
                  <p>No active connections yet.</p>
                  <button
                    onClick={() => onNavigate('matches')}
                    className="mt-1 text-[11px] text-[#7546D8] font-bold hover:underline cursor-pointer"
                  >
                    Find Mutual Matches →
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {acceptedRequests.map(req => {
                    const isSelected = selectedRequest?.id === req.id;
                    const reqPeerName = req.senderId === currentStudent.id ? req.receiverName : req.senderName;
                    const reqPeerCollege = req.senderId === currentStudent.id ? req.receiverCollege : req.senderCollege;
                    const reqBg = req.senderId === currentStudent.id ? req.receiverAvatarBg : req.senderAvatarBg;

                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#E9DDFC] border border-[#7546D8]/30 shadow-xs'
                            : 'bg-white hover:bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                          style={{ backgroundColor: reqBg || '#7546D8' }}
                        >
                          {reqPeerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#202033] truncate">{reqPeerName}</p>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <p className="text-[10px] text-[#77758A] truncate">{reqPeerCollege}</p>
                          <p className="text-[10px] text-[#5425A8] font-semibold truncate mt-0.5">
                            {req.teachingSkill} ⇄ {req.learningSkill}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Requests (Locked) */}
            {pendingRequests.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-bold text-[#77758A] uppercase tracking-wider">
                  <span>Pending Requests ({pendingRequests.length})</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">Locked</span>
                </div>

                <div className="space-y-1.5">
                  {pendingRequests.map(req => {
                    const isSelected = selectedRequest?.id === req.id;
                    const reqPeerName = req.senderId === currentStudent.id ? req.receiverName : req.senderName;
                    const reqPeerCollege = req.senderId === currentStudent.id ? req.receiverCollege : req.senderCollege;
                    const reqBg = req.senderId === currentStudent.id ? req.receiverAvatarBg : req.senderAvatarBg;

                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 opacity-80 ${
                          isSelected
                            ? 'bg-amber-50 border border-amber-300'
                            : 'bg-white hover:bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                          style={{ backgroundColor: reqBg || '#A78BFA' }}
                        >
                          {reqPeerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-[#202033] truncate">{reqPeerName}</p>
                            <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                          </div>
                          <p className="text-[10px] text-[#77758A] truncate">{reqPeerCollege}</p>
                          <p className="text-[10px] text-amber-700 font-semibold truncate mt-0.5">
                            Pending Approval
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Chat / Notes View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {!selectedRequest ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF9FD]">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-[#202033]">Select a Skill Partner</h3>
              <p className="text-xs text-[#77758A] max-w-sm mt-1">
                Choose an accepted peer from the left sidebar to start chatting and viewing shared study notes.
              </p>
            </div>
          ) : !isBackendSession ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF9FD]">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-3 border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#202033] mb-1">Sign in to open private chat</h3>
              <p className="text-xs text-[#77758A] max-w-md">
                Private messages are available only through your authenticated student account.
              </p>
            </div>
          ) : !isAccepted ? (
            /* LOCKED SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF9FD]">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-3 border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                Chat &amp; Notes Locked
              </span>
              <h3 className="text-lg font-bold text-[#202033] mb-1">
                Acceptance Required
              </h3>
              <p className="text-xs text-[#77758A] max-w-md mb-4 leading-relaxed">
                You can only chat and share notes with <strong>{peerName}</strong> after the skill exchange request is accepted.
              </p>

              {isReceiver ? (
                <button
                  onClick={handleAcceptRequest}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Accept Exchange Request &amp; Unlock Chat</span>
                </button>
              ) : (
                <div className="text-xs text-[#77758A] bg-white p-3 rounded-xl border border-gray-200">
                  Waiting for {peerName} to accept your exchange proposal ({selectedRequest.teachingSkill} ⇄ {selectedRequest.learningSkill}).
                </div>
              )}
            </div>
          ) : (
            /* ACTIVE CHAT & NOTES VIEW */
            <>
              {/* Partner Info Bar & Tab Switcher */}
              <div className="px-6 py-3 border-b border-gray-100 bg-[#FAF9FD] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                    style={{ backgroundColor: peerAvatarBg || '#7546D8' }}
                  >
                    {peerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#202033]">{peerName}</h3>
                    <p className="text-[11px] text-[#77758A]">
                      Exchange: <strong className="text-[#5425A8]">{selectedRequest.teachingSkill} ⇄ {selectedRequest.learningSkill}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'chat'
                          ? 'bg-[#7546D8] text-white shadow-xs'
                          : 'text-[#77758A] hover:text-[#202033]'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat ({messages.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === 'notes'
                          ? 'bg-[#7546D8] text-white shadow-xs'
                          : 'text-[#77758A] hover:text-[#202033]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Shared Notes ({visibleNotes.length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onScheduleSession(peerId, selectedRequest.teachingSkill)}
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-[#FAF9FD] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-bold hover:bg-[#E9DDFC] transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Close conversation"
                    title="Close chat"
                    onClick={() => onNavigate('dashboard')}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* TAB 1: PEER CHAT */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9FD]">
                  {chatError && (
                    <p role="alert" className="mx-5 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {chatError}
                    </p>
                  )}
                  <div className="flex-1 p-5 overflow-y-auto space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-16 text-[#77758A] text-xs">
                        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="font-bold text-[#202033]">Start the conversation!</p>
                        <p className="text-[11px] mt-0.5">Discuss dates, session goals, or ask questions.</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMe = msg.senderId === currentStudent.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isMe ? 'text-right' : 'text-left'}`}>
                              <span className="text-[10px] text-[#77758A] font-semibold px-1 block mb-0.5">
                                {msg.senderName}
                              </span>
                              <div
                                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                                  isMe
                                    ? 'bg-gradient-to-r from-[#5425A8] to-[#7546D8] text-white rounded-br-none'
                                    : 'bg-white text-[#202033] border border-gray-100 rounded-tl-none'
                                }`}
                              >
                                {msg.text && <p>{msg.text}</p>}
                                {msg.attachmentName && (
                                  <a
                                    href={api.getMessageAttachmentUrl(msg.requestId, msg.id)}
                                    download={msg.attachmentName}
                                    className={`mt-2 inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left ${
                                      isMe
                                        ? 'border-white/30 bg-white/10 text-white'
                                        : 'border-gray-200 bg-[#FAF9FD] text-[#5425A8]'
                                    }`}
                                  >
                                    <Paperclip className="h-4 w-4 shrink-0" />
                                    <span className="min-w-0 break-all">
                                      {msg.attachmentName}
                                      {msg.attachmentSize !== undefined && (
                                        <span className="ml-1 text-[10px] opacity-75">
                                          ({(msg.attachmentSize / (1024 * 1024)).toFixed(2)} MB)
                                        </span>
                                      )}
                                    </span>
                                    <Download className="h-3.5 w-3.5 shrink-0" />
                                  </a>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1 px-1 block">
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Quick Chat Starters */}
                  <div className="p-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                    {[
                      `Hey ${peerName.split(' ')[0]}! Are you free this weekend?`,
                      'I just posted our session notes in the shared tab!',
                      'Looking forward to our skill exchange session!'
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

                  {/* Input form */}
                  <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleUploadAttachment}
                    />
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <button
                        type="button"
                        aria-label="Upload chat file"
                        title="Upload a file (max 10 MB)"
                        onClick={() => attachmentInputRef.current?.click()}
                        disabled={isUploadingAttachment || isSending}
                        className="p-2.5 text-[#7546D8] hover:bg-[#F3EEFC] disabled:opacity-40 rounded-xl transition-all cursor-pointer"
                      >
                        {isUploadingAttachment
                          ? <Clock className="w-4 h-4 animate-spin" />
                          : <Paperclip className="w-4 h-4" />}
                      </button>
                      <input
                        type="text"
                        placeholder={`Message ${peerName}...`}
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-[#FAF9FD] border border-gray-200 rounded-xl text-xs text-[#202033] focus:outline-none focus:border-[#7546D8] focus:bg-white transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSending}
                        className="p-2.5 bg-[#7546D8] hover:bg-[#5425A8] disabled:opacity-40 text-white rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: SHARED STUDY NOTES */}
              {activeTab === 'notes' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9FD] p-5">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <div>
                      <h4 className="text-xs font-bold text-[#202033]">Shared Study Notes Hub</h4>
                      <p className="text-[11px] text-[#77758A]">
                        Both of you can add and view cheat sheets, links, and code snippets
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddingNote(!isAddingNote)}
                      className="px-3 py-1.5 bg-[#5425A8] hover:bg-[#431D86] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddingNote ? 'Cancel' : 'Add Note / Code'}</span>
                    </button>
                  </div>

                  {/* Note Creator Form */}
                  {isAddingNote && (
                    <form
                      onSubmit={handleCreateNote}
                      className="p-4 bg-white rounded-2xl border border-[#E9DDFC] shadow-sm mb-4 space-y-2.5 shrink-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#5425A8]">New Shared Resource</span>
                        <div className="flex gap-1">
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

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Title (e.g. Spring JPA Repository Cheat Sheet)"
                          value={noteTitle}
                          onChange={e => setNoteTitle(e.target.value)}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                        />
                        <input
                          type="text"
                          placeholder="Skill Name"
                          value={noteSkill}
                          onChange={e => setNoteSkill(e.target.value)}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                        />
                      </div>

                      {noteType === 'RESOURCE_LINK' && (
                        <input
                          type="url"
                          placeholder="Link URL"
                          value={noteUrl}
                          onChange={e => setNoteUrl(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                        />
                      )}

                      <textarea
                        required
                        rows={3}
                        placeholder={noteType === 'CODE' ? 'Paste code snippet...' : 'Write notes...'}
                        value={noteContent}
                        onChange={e => setNoteContent(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8] font-mono"
                      />

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingNote(false)}
                          className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 bg-[#7546D8] hover:bg-[#5425A8] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Save to Hub
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Notes Feed */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {visibleNotes.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-[#202033]">No notes created yet</p>
                        <p className="text-[11px] text-[#77758A] mt-0.5">
                          Click &quot;Add Note / Code&quot; to share resources with {peerName}.
                        </p>
                      </div>
                    ) : (
                      visibleNotes.map(n => {
                        const isMine = n.authorId === currentStudent.id;
                        return (
                          <div
                            key={n.id}
                            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs hover:border-[#E9DDFC] transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {n.type === 'CODE' && (
                                  <span className="p-1 bg-purple-50 text-[#7546D8] rounded-md">
                                    <Code2 className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                {n.type === 'RESOURCE_LINK' && (
                                  <span className="p-1 bg-blue-50 text-blue-600 rounded-md">
                                    <Link2 className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                {n.type === 'NOTE' && (
                                  <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                                    <FileText className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                <h5 className="text-xs font-bold text-[#202033]">{n.title}</h5>
                                <span className="text-[10px] bg-purple-100 text-[#5425A8] px-2 py-0.2 rounded font-bold">
                                  {n.skillName}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleCopyNote(n.content, n.id)}
                                  className="p-1 text-gray-400 hover:text-[#5425A8] rounded cursor-pointer"
                                  title="Copy"
                                >
                                  {copiedId === n.id ? (
                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {isMine && (
                                  <button
                                    onClick={() => handleDeleteNote(n.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="bg-[#FAF9FD] p-3 rounded-xl border border-gray-100 font-mono text-xs text-[#202033] whitespace-pre-wrap leading-relaxed">
                              {n.content}
                            </div>

                            {n.url && (
                              <a
                                href={n.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 text-[11px] text-[#7546D8] font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <span>Open Resource</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            <div className="mt-2 flex items-center justify-between text-[10px] text-[#77758A] pt-1.5 border-t border-gray-50">
                              <span>By <strong>{n.authorName}</strong></span>
                              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
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
    </div>
  );
};
