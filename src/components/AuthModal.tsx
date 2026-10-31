import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  Plus,
  Trash2,
  GraduationCap,
  Award,
  BookMarked
} from 'lucide-react';
import { storage } from '../services/storage';
import { StudentSkill, ProficiencyLevel, SkillCategoryName } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'ADMIN';
  onSuccess: (role: 'STUDENT' | 'ADMIN') => void;
}

interface NewSkillInput {
  skillName: string;
  category: SkillCategoryName;
  proficiency: ProficiencyLevel;
  type: 'TEACH' | 'LEARN';
  yearsExperienceOrGoal?: string;
}

const CATEGORIES: SkillCategoryName[] = [
  'Programming',
  'Web Development',
  'Data and AI',
  'Cloud and DevOps',
  'Career Skills',
  'Communication',
  'Creative'
];

const POPULAR_TEACH_SUGGESTIONS = [
  { name: 'Python', category: 'Programming' as SkillCategoryName },
  { name: 'Java', category: 'Programming' as SkillCategoryName },
  { name: 'React', category: 'Web Development' as SkillCategoryName },
  { name: 'Data Structures & Algorithms', category: 'Programming' as SkillCategoryName },
  { name: 'HTML & CSS / Tailwind', category: 'Web Development' as SkillCategoryName },
  { name: 'C++', category: 'Programming' as SkillCategoryName },
];

const POPULAR_LEARN_SUGGESTIONS = [
  { name: 'Spring Boot', category: 'Programming' as SkillCategoryName },
  { name: 'Docker & Kubernetes', category: 'Cloud and DevOps' as SkillCategoryName },
  { name: 'Machine Learning', category: 'Data and AI' as SkillCategoryName },
  { name: 'Career Mentorship', category: 'Career Skills' as SkillCategoryName },
  { name: 'Cloud Computing (AWS/GCP)', category: 'Cloud and DevOps' as SkillCategoryName },
  { name: 'TypeScript', category: 'Web Development' as SkillCategoryName },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'REGISTER',
  onSuccess,
}) => {
  // Role selection: STUDENT or ADMIN
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'ADMIN'>(
    initialMode === 'ADMIN' ? 'ADMIN' : 'STUDENT'
  );

  // Student action: LOGIN or REGISTER
  const [studentAction, setStudentAction] = useState<'REGISTER' | 'LOGIN'>(
    initialMode === 'LOGIN' ? 'LOGIN' : 'REGISTER'
  );

  const [error, setError] = useState<string | null>(null);

  // Student Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Student Register Form
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [collegeName, setCollegeName] = useState('Vasavi College of Engineering');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [academicYear, setAcademicYear] = useState('3rd Year');
  const [bio, setBio] = useState('');

  // Skills Section in Registration
  const [teachSkills, setTeachSkills] = useState<NewSkillInput[]>([
    {
      skillName: 'Python',
      category: 'Programming',
      proficiency: 'Intermediate',
      type: 'TEACH',
      yearsExperienceOrGoal: 'Core algorithms & problem solving'
    }
  ]);

  const [learnSkills, setLearnSkills] = useState<NewSkillInput[]>([
    {
      skillName: 'Java',
      category: 'Programming',
      proficiency: 'Beginner',
      type: 'LEARN',
      yearsExperienceOrGoal: 'Spring Boot & backend microservices'
    }
  ]);

  const [customTeachName, setCustomTeachName] = useState('');
  const [customTeachCategory, setCustomTeachCategory] = useState<SkillCategoryName>('Programming');
  const [customTeachProficiency, setCustomTeachProficiency] = useState<ProficiencyLevel>('Intermediate');

  const [customLearnName, setCustomLearnName] = useState('');
  const [customLearnCategory, setCustomLearnCategory] = useState<SkillCategoryName>('Programming');
  const [customLearnProficiency, setCustomLearnProficiency] = useState<ProficiencyLevel>('Beginner');

  // Administrator Login Form
  const [adminEmail, setAdminEmail] = useState('admin@peerlearn.edu');
  const [adminPassword, setAdminPassword] = useState('Admin@123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  if (!isOpen) return null;

  const handleAddTeachSkill = () => {
    if (!customTeachName.trim()) return;
    const exists = teachSkills.some(s => s.skillName.toLowerCase() === customTeachName.trim().toLowerCase());
    if (exists) {
      setError(`Skill "${customTeachName.trim()}" is already in your teaching list.`);
      return;
    }
    setTeachSkills([
      ...teachSkills,
      {
        skillName: customTeachName.trim(),
        category: customTeachCategory,
        proficiency: customTeachProficiency,
        type: 'TEACH',
        yearsExperienceOrGoal: 'Can mentor peers'
      }
    ]);
    setCustomTeachName('');
    setError(null);
  };

  const handleAddLearnSkill = () => {
    if (!customLearnName.trim()) return;
    const exists = learnSkills.some(s => s.skillName.toLowerCase() === customLearnName.trim().toLowerCase());
    if (exists) {
      setError(`Skill "${customLearnName.trim()}" is already in your learning list.`);
      return;
    }
    setLearnSkills([
      ...learnSkills,
      {
        skillName: customLearnName.trim(),
        category: customLearnCategory,
        proficiency: customLearnProficiency,
        type: 'LEARN',
        yearsExperienceOrGoal: 'Want to master this skill'
      }
    ]);
    setCustomLearnName('');
    setError(null);
  };

  const handleAddQuickTeach = (suggestion: { name: string; category: SkillCategoryName }) => {
    if (teachSkills.some(s => s.skillName.toLowerCase() === suggestion.name.toLowerCase())) return;
    setTeachSkills([
      ...teachSkills,
      {
        skillName: suggestion.name,
        category: suggestion.category,
        proficiency: 'Intermediate',
        type: 'TEACH',
        yearsExperienceOrGoal: 'Can guide beginners'
      }
    ]);
  };

  const handleAddQuickLearn = (suggestion: { name: string; category: SkillCategoryName }) => {
    if (learnSkills.some(s => s.skillName.toLowerCase() === suggestion.name.toLowerCase())) return;
    setLearnSkills([
      ...learnSkills,
      {
        skillName: suggestion.name,
        category: suggestion.category,
        proficiency: 'Beginner',
        type: 'LEARN',
        yearsExperienceOrGoal: 'Want to master'
      }
    ]);
  };

  const handleRemoveTeachSkill = (index: number) => {
    setTeachSkills(teachSkills.filter((_, i) => i !== index));
  };

  const handleRemoveLearnSkill = (index: number) => {
    setLearnSkills(learnSkills.filter((_, i) => i !== index));
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrim = loginEmail.trim().toLowerCase();
    const passTrim = loginPassword.trim();

    if (emailTrim === 'admin@peerlearn.edu' || emailTrim === 'admin') {
      const isValidAdminPass =
        passTrim === 'Admin@123' ||
        passTrim === 'admin@123' ||
        passTrim === 'Admin123' ||
        passTrim === 'admin';

      if (isValidAdminPass) {
        storage.setAdmin(true);
        onSuccess('ADMIN');
        onClose();
        return;
      } else {
        setSelectedRole('ADMIN');
        setAdminEmail('admin@peerlearn.edu');
        setAdminPassword(loginPassword || 'Admin@123');
        setError('Detected administrator account. Please authenticate with Admin password (default: Admin@123).');
        return;
      }
    }

    const students = storage.getStudents(true);
    const student = students.find(s => s.email.toLowerCase() === emailTrim);

    if (!student) {
      setError('No student account found with this email. Check your spelling or register a new student account.');
      return;
    }

    if (student.status === 'DEACTIVATED') {
      setError('This student account is currently deactivated by the campus administrator.');
      return;
    }

    storage.setCurrentUserId(student.id);
    storage.setAdmin(false);
    onSuccess('STUDENT');
    onClose();
  };

  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setError('Please provide your full name, student email, and password.');
      return;
    }

    if (teachSkills.length === 0) {
      setError('Please mention at least 1 skill you can teach to other students.');
      return;
    }

    if (learnSkills.length === 0) {
      setError('Please mention at least 1 skill you want to learn from other students.');
      return;
    }

    try {
      const formattedSkills: StudentSkill[] = [
        ...teachSkills.map((s, idx) => ({
          id: `sk-${Date.now()}-teach-${idx}`,
          skillName: s.skillName,
          category: s.category,
          proficiency: s.proficiency,
          type: 'TEACH' as const,
          yearsExperienceOrGoal: s.yearsExperienceOrGoal || 'Can mentor peers'
        })),
        ...learnSkills.map((s, idx) => ({
          id: `sk-${Date.now()}-learn-${idx}`,
          skillName: s.skillName,
          category: s.category,
          proficiency: s.proficiency,
          type: 'LEARN' as const,
          yearsExperienceOrGoal: s.yearsExperienceOrGoal || 'Want to master'
        }))
      ];

      const newStudent = storage.registerStudent({
        name: fullName.trim(),
        email: registerEmail.trim(),
        collegeName: collegeName.trim() || 'Vasavi College of Engineering',
        branch: branch.trim() || 'Computer Science & Engineering',
        academicYear,
        bio: bio.trim() || `Excited to teach ${teachSkills.map(s => s.skillName).join(', ')} and learn ${learnSkills.map(s => s.skillName).join(', ')}!`,
        availability: 'Available',
        skills: formattedSkills
      });

      storage.setCurrentUserId(newStudent.id);
      storage.setAdmin(false);
      onSuccess('STUDENT');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const emailClean = (adminEmail || '').trim().toLowerCase();
    const passClean = (adminPassword || '').trim();

    const isValidEmail =
      emailClean === 'admin@peerlearn.edu' ||
      emailClean === 'admin@peerlearn.com' ||
      emailClean === 'admin@peerlearn.org' ||
      emailClean === 'admin';

    const isValidPass =
      passClean === 'Admin@123' ||
      passClean === 'admin@123' ||
      passClean === 'Admin123' ||
      passClean === 'admin' ||
      passClean.toLowerCase() === 'admin@123';

    if (isValidEmail && isValidPass) {
      storage.setAdmin(true);
      onSuccess('ADMIN');
      onClose();
    } else {
      setError('Invalid Administrator credentials! Accepted: admin@peerlearn.edu and Admin@123.');
    }
  };

  const handle1ClickAdmin = () => {
    setAdminEmail('admin@peerlearn.edu');
    setAdminPassword('Admin@123');
    storage.setAdmin(true);
    onSuccess('ADMIN');
    onClose();
  };

  const handleQuickLogin = (studentId: string) => {
    storage.setCurrentUserId(studentId);
    storage.setAdmin(false);
    onSuccess('STUDENT');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[86vh] max-h-[86vh] flex flex-col border border-[#E9DDFC] overflow-hidden">
        {/* Sticky Header: NEVER CUT OFF */}
        <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 bg-[#FAF9FD] shrink-0 relative">
          <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
            <button
              onClick={onClose}
              title="Go Back / Close (Esc)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#5425A8] bg-white border border-[#E9DDFC] hover:bg-[#F3EFFC] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#7546D8]" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5425A8] to-[#7546D8] text-white flex items-center justify-center font-bold text-xs shadow-md">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#202033] tracking-tight">PeerLearn Access</h2>
              <p className="text-[10px] text-[#77758A]">Select your role to access the platform</p>
            </div>
          </div>

          {/* STEP 1: ROLE SELECTION */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('STUDENT');
                setError(null);
              }}
              className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'STUDENT'
                  ? 'bg-gradient-to-r from-[#5425A8] to-[#7546D8] text-white shadow-xs'
                  : 'text-[#77758A] hover:text-[#202033] hover:bg-gray-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('ADMIN');
                setError(null);
              }}
              className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#202033] text-white shadow-xs'
                  : 'text-[#77758A] hover:text-[#202033] hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin (Admin Only)</span>
            </button>
          </div>

          {/* Student Sub-Tabs */}
          {selectedRole === 'STUDENT' && (
            <div className="flex items-center justify-center gap-4 mt-2.5 pt-2 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStudentAction('REGISTER');
                  setError(null);
                }}
                className={`font-bold pb-0.5 transition-all cursor-pointer border-b-2 text-[11px] ${
                  studentAction === 'REGISTER'
                    ? 'border-[#7546D8] text-[#5425A8]'
                    : 'border-transparent text-[#77758A] hover:text-[#202033]'
                }`}
              >
                1. Register New Student (With Skills)
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setStudentAction('LOGIN');
                  setError(null);
                }}
                className={`font-bold pb-0.5 transition-all cursor-pointer border-b-2 text-[11px] ${
                  studentAction === 'LOGIN'
                    ? 'border-[#7546D8] text-[#5425A8]'
                    : 'border-transparent text-[#77758A] hover:text-[#202033]'
                }`}
              >
                2. Student Sign In
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Form Body: SMOOTH INTERNAL SCROLL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* 1. STUDENT REGISTRATION (WITH SKILLS) */}
          {selectedRole === 'STUDENT' && studentAction === 'REGISTER' && (
            <form id="student-reg-form" onSubmit={handleStudentRegister} className="space-y-4">
              <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-[#5425A8]">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#7546D8]" />
                  <span>Mention Skills to Activate Mutual Matching</span>
                </p>
                <p className="text-[10px] text-[#77758A] mt-0.5">
                  Specify what you teach &amp; what you want to learn so peers can match with you instantly!
                </p>
              </div>

              {/* Personal Details */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-[#77758A] uppercase tracking-wider block">
                  1. Student Details
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-[#202033] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Reddy"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202033] mb-1">Student Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ananya@college.edu"
                      value={registerEmail}
                      onChange={e => setRegisterEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202033] mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={e => setRegisterPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8] pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400"
                      >
                        {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202033] mb-1">Branch / Major</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#202033] mb-1">Academic Year</label>
                    <select
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#202033] mb-1">College / University</label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={e => setCollegeName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                  />
                </div>
              </div>

              {/* 2. Skills I Can Teach */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Skills I Can Teach * ({teachSkills.length})</span>
                  </span>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {teachSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold"
                    >
                      <span>{s.skillName} ({s.proficiency})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTeachSkill(idx)}
                        className="text-emerald-600 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Teach */}
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-[#77758A] font-bold uppercase block mb-1">
                    Quick Add Teaching Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_TEACH_SUGGESTIONS.map(sugg => {
                      const isAdded = teachSkills.some(s => s.skillName.toLowerCase() === sugg.name.toLowerCase());
                      return (
                        <button
                          key={sugg.name}
                          type="button"
                          onClick={() => handleAddQuickTeach(sugg)}
                          disabled={isAdded}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-100 text-emerald-800 opacity-60'
                              : 'bg-white border border-gray-200 text-[#202033] hover:border-[#7546D8]'
                          }`}
                        >
                          + {sugg.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Teach Add */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Custom skill to teach (e.g. Flutter, C++)"
                    value={customTeachName}
                    onChange={e => setCustomTeachName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#7546D8]"
                  />
                  <select
                    value={customTeachProficiency}
                    onChange={e => setCustomTeachProficiency(e.target.value as ProficiencyLevel)}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddTeachSkill}
                    className="px-3 py-1.5 bg-[#5425A8] text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 3. Skills I Want to Learn */}
              <div className="pt-3 border-t border-gray-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5 text-purple-600" />
                    <span>3. Skills I Want to Learn * ({learnSkills.length})</span>
                  </span>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {learnSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-[#5425A8] rounded-lg text-xs font-bold"
                    >
                      <span>{s.skillName} ({s.proficiency})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLearnSkill(idx)}
                        className="text-[#5425A8] hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Learn */}
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-[#77758A] font-bold uppercase block mb-1">
                    Quick Add Learning Goals:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_LEARN_SUGGESTIONS.map(sugg => {
                      const isAdded = learnSkills.some(s => s.skillName.toLowerCase() === sugg.name.toLowerCase());
                      return (
                        <button
                          key={sugg.name}
                          type="button"
                          onClick={() => handleAddQuickLearn(sugg)}
                          disabled={isAdded}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-purple-100 text-purple-800 opacity-60'
                              : 'bg-white border border-gray-200 text-[#202033] hover:border-[#7546D8]'
                          }`}
                        >
                          + {sugg.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Learn Add */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Custom skill to learn (e.g. Spring Boot)"
                    value={customLearnName}
                    onChange={e => setCustomLearnName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#7546D8]"
                  />
                  <select
                    value={customLearnProficiency}
                    onChange={e => setCustomLearnProficiency(e.target.value as ProficiencyLevel)}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLearnSkill}
                    className="px-3 py-1.5 bg-[#5425A8] text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 2. STUDENT LOGIN */}
          {selectedRole === 'STUDENT' && studentAction === 'LOGIN' && (
            <div className="space-y-4">
              <form id="student-login-form" onSubmit={handleStudentLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202033] mb-1">Student Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. chintaassrija@gmail.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202033] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </form>

              {/* 1-Click Demo Accounts */}
              <div className="pt-3 border-t border-gray-100">
                <span className="text-[10px] font-bold text-[#77758A] uppercase tracking-wider block mb-2">
                  Instant Demo Student Accounts (1-Click):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student-srija')}
                    className="p-2 text-left border border-[#E9DDFC] bg-[#FAF9FD] hover:bg-[#E9DDFC]/50 rounded-xl transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-[#5425A8]">Srija Chinta</p>
                    <p className="text-[10px] text-[#77758A]">Teaches Python ⇄ Wants Java</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student-rahul')}
                    className="p-2 text-left border border-[#E9DDFC] bg-[#FAF9FD] hover:bg-[#E9DDFC]/50 rounded-xl transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-[#5425A8]">Rahul Verma</p>
                    <p className="text-[10px] text-[#77758A]">Teaches Java ⇄ Wants Python</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. ADMINISTRATOR PORTAL */}
          {selectedRole === 'ADMIN' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#5425A8] shrink-0 mt-0.5" />
                <div className="text-xs text-[#202033]">
                  <p className="font-extrabold text-[#5425A8]">Restricted Administrator Access</p>
                  <p className="text-[11px] text-[#77758A] mt-0.5 leading-relaxed">
                    This portal is strictly for verified campus administrators. Students cannot access administrative controls.
                  </p>
                  <div className="mt-2 p-2 bg-white rounded-xl border border-purple-100 font-mono text-[11px] space-y-0.5">
                    <div>Email: <strong className="text-[#5425A8]">admin@peerlearn.edu</strong></div>
                    <div>Password: <strong className="text-[#5425A8]">Admin@123</strong></div>
                  </div>
                </div>
              </div>

              {/* 1-Click Fast Admin Sign In */}
              <button
                type="button"
                onClick={handle1ClickAdmin}
                className="w-full py-2.5 bg-gradient-to-r from-[#202033] to-[#3B3856] hover:from-black hover:to-[#202033] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>1-Click Sign In as Administrator</span>
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Or enter manually</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <form id="admin-form" onSubmit={handleAdminLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202033] mb-1">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202033] mb-1">Admin Password</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#7546D8] pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400"
                    >
                      {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sticky Footer: NEVER CUT OFF */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-gray-100 shrink-0">
          {selectedRole === 'STUDENT' && studentAction === 'REGISTER' && (
            <button
              form="student-reg-form"
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-[#5425A8] to-[#7546D8] hover:from-[#431D86] hover:to-[#5425A8] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Student Account &amp; Find Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {selectedRole === 'STUDENT' && studentAction === 'LOGIN' && (
            <button
              form="student-login-form"
              type="submit"
              className="w-full py-2.5 bg-[#7546D8] hover:bg-[#5425A8] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In as Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {selectedRole === 'ADMIN' && (
            <button
              form="admin-form"
              type="submit"
              className="w-full py-2.5 bg-[#202033] hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verify Credentials &amp; Open Admin Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
