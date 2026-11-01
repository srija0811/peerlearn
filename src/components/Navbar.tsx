import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Bell,
  Search,
  Code2,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Sparkles,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { ExchangeRequest, Student, StudentNotification } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';

interface NavbarProps {
  currentStudent: Student | null;
  isAdmin: boolean;
  isBackendSession: boolean;
  requests: ExchangeRequest[];
  onOpenAuth: (mode: 'LOGIN' | 'REGISTER' | 'ADMIN') => void;
  onOpenDevOps: () => void;
  onNavigate: (view: string) => void;
  onOpenChatRequest: (requestId: string) => void;
  onStudentChanged: () => void;
  onEditProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  isAdmin,
  isBackendSession,
  requests,
  onOpenAuth,
  onOpenDevOps,
  onNavigate,
  onOpenChatRequest,
  onStudentChanged,
  onEditProfile,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const students = storage.getStudents();
  const pendingRequests = currentStudent
    ? (isBackendSession
        ? requests.filter(request => request.receiverId === currentStudent.id && request.status === 'PENDING')
        : storage.getRequestsForStudent(currentStudent.id).incoming)
    : [];

  useEffect(() => {
    if (!currentStudent) {
      setNotifications([]);
      setNotificationError(null);
      return;
    }

    if (!isBackendSession) {
      setNotifications(storage.getNotificationsForStudent(currentStudent.id));
      setNotificationError(null);
      return;
    }

    let active = true;
    const loadNotifications = async () => {
      try {
        const result = await api.getNotifications();
        if (active) {
          setNotifications(result);
          setNotificationError(null);
        }
      } catch (error) {
        if (active) {
          setNotificationError(error instanceof Error ? error.message : 'Unable to load notifications.');
        }
      }
    };

    void loadNotifications();
    const timer = window.setInterval(() => void loadNotifications(), 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isBackendSession, currentStudent?.id]);

  const unreadCount = notifications.filter(notification => !notification.read).length + pendingRequests.length;

  const handleNotificationClick = async (notification: StudentNotification) => {
    try {
      if (isBackendSession) {
        await api.markNotificationRead(notification.id);
      } else if (currentStudent) {
        storage.markNotificationRead(currentStudent.id, notification.id);
      }
      setNotifications(previous => previous.map(item =>
        item.id === notification.id ? { ...item, read: true } : item
      ));
      setShowNotifications(false);
      if (isBackendSession && notification.type === 'REQUEST_ACCEPTED' && notification.relatedRequestId) {
        onOpenChatRequest(notification.relatedRequestId);
      } else {
        onNavigate('requests');
      }
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : 'Unable to update notification.');
    }
  };

  const handleSwitchStudent = (id: string) => {
    storage.setCurrentUserId(id);
    storage.setAdmin(false);
    setShowSwitchDropdown(false);
    onStudentChanged();
  };

  const handleLogout = () => {
    storage.setAdmin(false);
    onOpenAuth('LOGIN');
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Trigger */}
        <div className="flex items-center gap-6 shrink-0">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#202033]">
                  Peer<span className="text-[#7546D8]">Learn</span>
                </span>
                {isAdmin && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-[#5425A8] text-white px-2 py-0.5 rounded-md">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#77758A] font-medium hidden sm:block">
                Learn Together. Grow Together.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search skills (e.g. Python, Java, Docker, Machine Learning)..."
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onNavigate('skills');
                }
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#F8F7FC] hover:bg-gray-100/80 focus:bg-white text-xs text-[#202033] border border-transparent focus:border-[#E9DDFC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7546D8]/20 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Windows 11 / Spring Boot Artifacts Button */}
          <button
            onClick={onOpenDevOps}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9FD] hover:bg-[#E9DDFC] text-[#5425A8] border border-[#E9DDFC] rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Inspect Java 21, Spring Boot, Maven & Windows 11 commands"
          >
            <Code2 className="w-3.5 h-3.5 text-[#7546D8]" />
            <span className="hidden sm:inline">Spring Boot Source</span>
          </button>

          {/* Quick Demo Student Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8F7FC] hover:bg-gray-100 text-xs font-medium text-[#202033] rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title="Quick switch demo student"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#7546D8]" />
              <span className="hidden lg:inline">Switch Demo</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showSwitchDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-bold text-[#77758A] uppercase tracking-wider">Test Personas</span>
                  <button type="button" aria-label="Close demo student menu" onClick={() => setShowSwitchDropdown(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {students.map(s => {
                  const isCurrent = currentStudent?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSwitchStudent(s.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-[#E9DDFC] text-[#5425A8] font-bold'
                          : 'hover:bg-gray-50 text-[#202033]'
                      }`}
                    >
                      <div>
                        <p>{s.name}</p>
                        <p className="text-[10px] text-[#77758A]">{s.branch.split(' ')[0]}</p>
                      </div>
                      {isCurrent && <span className="text-[10px] bg-[#7546D8] text-white px-1.5 py-0.5 rounded">Active</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Navigation - Only visible when administrator is actively logged in */}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#5425A8] hover:bg-[#431D86] text-white rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-[#7546D8] hover:bg-[#F8F7FC] rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#E05252] text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                  <div>
                    <span className="text-xs font-bold text-[#202033]">Notifications</span>
                    <span className="ml-2 text-[11px] text-[#7546D8] font-semibold">{unreadCount} unread</span>
                  </div>
                  <button type="button" aria-label="Close notifications" onClick={() => setShowNotifications(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {notificationError && (
                  <p role="alert" className="py-2 text-[11px] text-red-600">{notificationError}</p>
                )}
                {notifications.length === 0 && pendingRequests.length === 0 ? (
                  <p className="text-xs text-[#77758A] py-3 text-center">No notifications right now.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map(notification => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => void handleNotificationClick(notification)}
                        className={`w-full text-left p-2 rounded-xl transition-colors cursor-pointer text-xs ${notification.read ? 'hover:bg-[#FAF9FD]' : 'bg-[#FAF9FD] hover:bg-[#E9DDFC]/50'}`}
                      >
                        <p className="font-semibold text-[#202033]">{notification.title}</p>
                        <p className="text-[11px] text-[#77758A]">{notification.message}</p>
                      </button>
                    ))}
                    {pendingRequests.map(req => (
                      <div
                        key={req.id}
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate('requests');
                        }}
                        className="p-2 hover:bg-[#FAF9FD] rounded-xl transition-colors cursor-pointer text-xs"
                      >
                        <p className="font-semibold text-[#202033]">{req.senderName}</p>
                        <p className="text-[11px] text-[#77758A]">
                          Offers: <span className="text-[#7546D8] font-medium">{req.teachingSkill}</span> ⇄ Wants:{' '}
                          <span className="text-[#5425A8] font-medium">{req.learningSkill}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('requests');
                  }}
                  className="w-full mt-2 py-1.5 text-center text-[11px] font-bold text-[#7546D8] hover:bg-[#E9DDFC]/40 rounded-lg transition-colors cursor-pointer"
                >
                  View All Requests
                </button>
              </div>
            )}
          </div>

          {/* Current Profile / Account Menu */}
          {currentStudent ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2 hover:bg-[#F8F7FC] rounded-xl transition-colors cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
                  style={{ backgroundColor: currentStudent.avatarBg || '#7546D8' }}
                >
                  {currentStudent.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-[#202033] leading-none">{currentStudent.name}</p>
                  <p className="text-[10px] text-[#77758A] leading-tight">{currentStudent.academicYear}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                  <div className="flex items-start justify-between px-3 py-2 border-b border-gray-100 mb-1">
                    <div>
                      <p className="text-xs font-bold text-[#202033]">{currentStudent.name}</p>
                      <p className="text-[10px] text-[#77758A] truncate">{currentStudent.collegeName}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-[#7546D8]">
                        <span>{currentStudent.xpPoints} XP</span>
                        <span>·</span>
                        <span>{currentStudent.completedSessionsCount} Sessions</span>
                      </div>
                    </div>
                    <button type="button" aria-label="Close account menu" onClick={() => setShowUserDropdown(false)} className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('my-skills');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#202033] hover:bg-gray-50 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>My Skills</span>
                  </button>

                  {onEditProfile && (
                    <button
                      onClick={() => {
                        onEditProfile();
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#5425A8] hover:bg-[#FAF9FD] rounded-lg flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <User className="w-3.5 h-3.5 text-[#7546D8]" />
                      <span>Edit Profile</span>
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('LOGIN')}
                className="px-3 py-1.5 text-xs font-bold text-[#7546D8] hover:bg-[#FAF9FD] rounded-xl transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('REGISTER')}
                className="px-3 py-1.5 text-xs font-bold bg-[#7546D8] hover:bg-[#5425A8] text-white rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
