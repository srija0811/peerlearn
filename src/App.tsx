import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { Student, LearningSession, SkillCategoryName } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/StudentDashboard';
import { SmartMatching } from './components/SmartMatching';
import { TalentProfiles } from './components/TalentProfiles';
import { MySkills } from './components/MySkills';
import { SkillCategories } from './components/SkillCategories';
import { ExchangeRequests } from './components/ExchangeRequests';
import { LearningSessions } from './components/LearningSessions';
import { ActivityFeed } from './components/ActivityFeed';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { DevOpsModal } from './components/DevOpsModal';
import { SendRequestModal } from './components/SendRequestModal';
import { ScheduleSessionModal } from './components/ScheduleSessionModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AIChatBot } from './components/AIChatBot';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(storage.getCurrentStudent());
  const [isAdmin, setIsAdmin] = useState<boolean>(storage.isAdmin());

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'ADMIN'>('LOGIN');
  const [isDevOpsOpen, setIsDevOpsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Exchange proposal modal
  const [targetStudentForRequest, setTargetStudentForRequest] = useState<Student | null>(null);
  const [defaultTeachingSkill, setDefaultTeachingSkill] = useState<string>('');
  const [defaultLearningSkill, setDefaultLearningSkill] = useState<string>('');

  // Profile modal
  const [profileModalStudent, setProfileModalStudent] = useState<Student | null>(null);

  // Schedule session modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [schedulePeerId, setSchedulePeerId] = useState<string>('');
  const [scheduleSkill, setScheduleSkill] = useState<string>('');

  // Edit profile modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const refreshState = () => {
    setCurrentStudent(storage.getCurrentStudent());
    setIsAdmin(storage.isAdmin());
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER' | 'ADMIN') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (role: 'STUDENT' | 'ADMIN') => {
    refreshState();
    if (role === 'ADMIN') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleConnectWithStudent = (student: Student, teachSkill?: string, learnSkill?: string) => {
    setTargetStudentForRequest(student);
    setDefaultTeachingSkill(teachSkill || '');
    setDefaultLearningSkill(learnSkill || '');
  };

  const handleScheduleSession = (peerId?: string, defaultSkill?: string) => {
    setSchedulePeerId(peerId || '');
    setScheduleSkill(defaultSkill || '');
    setIsScheduleOpen(true);
  };

  // If Admin view is chosen and authenticated
  if (currentView === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-[#FEE2E2] text-[#E05252] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="inline-block px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#E05252] text-[11px] font-bold uppercase tracking-wider mb-2">
              Admin Access Only
            </span>
            <h2 className="text-xl font-extrabold text-[#202033] mb-2">Restricted Area</h2>
            <p className="text-xs text-[#77758A] mb-6 leading-relaxed">
              The PeerLearn Admin Dashboard is accessible only to verified administrators. Students and unauthenticated users cannot view administrative metrics, manage users, or review system audits.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleOpenAuth('ADMIN')}
                className="w-full py-2.5 px-4 bg-[#5425A8] hover:bg-[#431D86] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#5425A8]/20 cursor-pointer"
              >
                Sign In with Administrator Credentials
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-[#202033] rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Return to Student Dashboard
              </button>
            </div>
          </div>
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialMode={authMode}
            onSuccess={handleAuthSuccess}
          />
        </div>
      );
    }

    return (
      <>
        <AdminDashboard
          onBackToStudentPortal={() => setCurrentView('dashboard')}
          onAdminLogout={() => {
            storage.setAdmin(false);
            refreshState();
            setCurrentView('landing');
          }}
        />
        <DevOpsModal isOpen={isDevOpsOpen} onClose={() => setIsDevOpsOpen(false)} />
      </>
    );
  }

  // If public landing page is chosen
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            if (currentStudent) {
              setCurrentView('dashboard');
            } else {
              handleOpenAuth('REGISTER');
            }
          }}
          onExploreSkills={() => {
            setCurrentView('categories');
          }}
          onOpenAuth={handleOpenAuth}
          onOpenDevOps={() => setIsDevOpsOpen(true)}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialMode={authMode}
          onSuccess={handleAuthSuccess}
        />
        <DevOpsModal isOpen={isDevOpsOpen} onClose={() => setIsDevOpsOpen(false)} />
        <AIChatBot
          currentStudent={currentStudent}
          isOpen={isAIChatOpen}
          onToggle={() => setIsAIChatOpen(!isAIChatOpen)}
          onOpenScheduler={handleScheduleSession}
          onNavigate={tab => setCurrentView(tab)}
          isEmbedded={false}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex flex-col text-[#202033]">
      {/* Top Navbar */}
      <Navbar
        currentStudent={currentStudent}
        isAdmin={isAdmin}
        onOpenAuth={handleOpenAuth}
        onOpenDevOps={() => setIsDevOpsOpen(true)}
        onNavigate={tab => setCurrentView(tab)}
        onStudentChanged={refreshState}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(prev => !prev)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentView}
          onNavigate={tab => setCurrentView(tab)}
          currentStudent={currentStudent}
          isAdmin={isAdmin}
          onStudentUpdated={refreshState}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentView === 'dashboard' && (
            <StudentDashboard
              currentStudent={currentStudent}
              onNavigate={tab => setCurrentView(tab)}
              onConnect={handleConnectWithStudent}
              onViewProfile={student => setProfileModalStudent(student)}
              onScheduleSession={() => handleScheduleSession()}
              onOpenAddSkill={() => setCurrentView('my-skills')}
              onCompleteSession={() => refreshState()}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onOpenDevOps={() => setIsDevOpsOpen(true)}
            />
          )}

          {currentView === 'matches' && (
            <SmartMatching
              currentStudent={currentStudent}
              onConnect={handleConnectWithStudent}
              onViewProfile={student => setProfileModalStudent(student)}
            />
          )}

          {currentView === 'profiles' && (
            <TalentProfiles
              currentStudent={currentStudent}
              onConnect={student => handleConnectWithStudent(student)}
              onViewProfile={student => setProfileModalStudent(student)}
            />
          )}

          {currentView === 'my-skills' && (
            <MySkills
              currentStudent={currentStudent}
              onStudentUpdated={refreshState}
            />
          )}

          {currentView === 'categories' && (
            <SkillCategories
              onSelectCategory={catName => {
                setCurrentView('profiles');
              }}
            />
          )}

          {currentView === 'requests' && (
            <ExchangeRequests
              currentStudent={currentStudent}
              onScheduleSession={handleScheduleSession}
              onRequestsUpdated={refreshState}
            />
          )}

          {currentView === 'sessions' && (
            <LearningSessions
              currentStudent={currentStudent}
              onOpenScheduler={() => handleScheduleSession()}
              onSessionsUpdated={refreshState}
            />
          )}

          {currentView === 'activity' && <ActivityFeed />}

          {currentView === 'ai-mentor' && (
            <AIChatBot
              currentStudent={currentStudent}
              isOpen={true}
              onToggle={() => setCurrentView('dashboard')}
              onOpenScheduler={handleScheduleSession}
              onNavigate={tab => setCurrentView(tab)}
              isEmbedded={true}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />

      <DevOpsModal
        isOpen={isDevOpsOpen}
        onClose={() => setIsDevOpsOpen(false)}
      />

      <SendRequestModal
        isOpen={Boolean(targetStudentForRequest)}
        onClose={() => setTargetStudentForRequest(null)}
        targetStudent={targetStudentForRequest}
        defaultTeachingSkill={defaultTeachingSkill}
        defaultLearningSkill={defaultLearningSkill}
        onRequestSent={() => {
          refreshState();
          setCurrentView('requests');
        }}
      />

      <ScheduleSessionModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        preselectedPeerId={schedulePeerId}
        defaultSkillName={scheduleSkill}
        onSessionScheduled={() => {
          refreshState();
          setCurrentView('sessions');
        }}
      />

      <StudentProfileModal
        isOpen={Boolean(profileModalStudent)}
        onClose={() => setProfileModalStudent(null)}
        student={profileModalStudent}
        onConnect={student => handleConnectWithStudent(student)}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        student={currentStudent}
        onProfileUpdated={refreshState}
      />

      {/* Floating AI Chat Bot (Gemini 3.8 Flash) */}
      <AIChatBot
        currentStudent={currentStudent}
        isOpen={isAIChatOpen}
        onToggle={() => setIsAIChatOpen(!isAIChatOpen)}
        onOpenScheduler={handleScheduleSession}
        onNavigate={tab => setCurrentView(tab)}
        isEmbedded={false}
      />
    </div>
  );
}
