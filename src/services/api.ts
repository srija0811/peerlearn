
import {
  ChatMessage,
  ExchangeRequest,
  MutualSkillMatch,
  Student,
  StudentNotification,
  StudentSkill,
} from '../types';

const API_BASE_URL = '/api';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const responseText = await response.text();

  let data: any = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === 'string'
        ? data
        : data?.message ||
          data?.error ||
          `Request failed: ${response.status}`
    );
  }

  return data as T;
}

export interface AuthResponse {
  studentId: number;
  success: boolean;
  fullName: string;
  email: string;
  collegeName: string;
  branch: string;
  academicYear: string;
  role: string;
  message?: string;
}

export interface StudentSkillInput {
  skillName: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'TEACH' | 'LEARN';
  experienceOrGoal?: string;
}

interface BackendStudent {
  id: number | string;
  fullName: string;
  email: string;
  collegeName: string;
  branch: string;
  academicYear: string;
  profilePhoto?: string | null;
  bio?: string | null;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  xpPoints?: number;
  completedSessionsCount?: number;
  active?: boolean;
  createdAt?: string;
  skills?: Array<{
    id: number | string;
    skillName: string;
    category: string;
    proficiency: string;
    type: string;
    experienceOrGoal?: string;
  }>;
  achievements?: Array<{ badgeName: string }>;
}

interface BackendExchangeRequest {
  id: number | string;
  senderId: number | string;
  senderName: string;
  senderCollege: string;
  receiverId: number | string;
  receiverName: string;
  receiverCollege: string;
  teachingSkill: string;
  learningSkill: string;
  message: string;
  preferredMode: 'Online' | 'Offline' | 'Either';
  status: ExchangeRequest['status'];
  createdAt: string;
  updatedAt?: string;
}

interface BackendChatMessage {
  id: number | string;
  requestId: number | string;
  senderId: number | string;
  senderName: string;
  content: string;
  createdAt: string;
  attachmentName?: string | null;
  attachmentSize?: number | null;
}

interface BackendNotification {
  id: number | string;
  title: string;
  message: string;
  type: string;
  relatedRequestId?: number | string | null;
  read: boolean;
  createdAt: string;
}

const mapStudent = (student: BackendStudent): Student => ({
  id: String(student.id),
  name: student.fullName,
  email: student.email,
  collegeName: student.collegeName,
  branch: student.branch,
  academicYear: student.academicYear,
  avatarUrl: student.profilePhoto || undefined,
  bio: student.bio || '',
  availability: (student.availability || 'Available') as Student['availability'],
  rating: student.rating ?? 5,
  reviewCount: student.reviewCount ?? 0,
  xpPoints: student.xpPoints ?? 100,
  completedSessionsCount: student.completedSessionsCount ?? 0,
  badges: student.achievements?.map(achievement => achievement.badgeName) || [],
  status: student.active === false ? 'DEACTIVATED' : 'ACTIVE',
  createdAt: student.createdAt || new Date().toISOString(),
  skills: (student.skills || []).map((skill): StudentSkill => ({
    id: String(skill.id),
    skillName: skill.skillName,
    category: skill.category as StudentSkill['category'],
    proficiency: skill.proficiency as StudentSkill['proficiency'],
    type: skill.type as StudentSkill['type'],
    yearsExperienceOrGoal: skill.experienceOrGoal || '',
  })),
});

const mapRequest = (request: BackendExchangeRequest): ExchangeRequest => ({
  ...request,
  id: String(request.id),
  senderId: String(request.senderId),
  receiverId: String(request.receiverId),
});

const mapMessage = (message: BackendChatMessage): ChatMessage => ({
  id: String(message.id),
  requestId: String(message.requestId),
  senderId: String(message.senderId),
  senderName: message.senderName,
  text: message.content,
  timestamp: new Date(message.createdAt).toLocaleString(),
  attachmentName: message.attachmentName || undefined,
  attachmentSize: message.attachmentSize ?? undefined,
});

const mapNotification = (notification: BackendNotification): StudentNotification => ({
  ...notification,
  id: String(notification.id),
  relatedRequestId: notification.relatedRequestId ? String(notification.relatedRequestId) : undefined,
});

export const api = {
  // Student Login
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Student Registration
  register: (student: {
    fullName: string;
    email: string;
    password: string;
    collegeName: string;
    branch: string;
    academicYear: string;
    bio?: string;
  }) =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(student),
    }),

  // Get all students
  getStudents: async (): Promise<Student[]> =>
    (await apiRequest<BackendStudent[]>('/students')).map(mapStudent),

  // Get one student
  getStudent: async (id: string | number): Promise<Student> =>
    mapStudent(await apiRequest<BackendStudent>(`/students/${id}`)),

  // Get database-backed skill matches
  getMatches: async (studentId: string | number): Promise<MutualSkillMatch[]> => {
    const matches = await apiRequest<Array<{
      student: BackendStudent;
      matchType: MutualSkillMatch['matchType'];
      matchPercentage: number;
      whatYouTeachThem: string[];
      whatTheyTeachYou: string[];
    }>>(`/matches/${studentId}`);

    return matches.map(match => ({
      ...match,
      student: mapStudent(match.student),
    }));
  },

  // Exchange requests
  getRequests: async (): Promise<ExchangeRequest[]> =>
    (await apiRequest<BackendExchangeRequest[]>('/requests/mine')).map(mapRequest),

  sendRequest: async (request: {
    receiverId: string;
    teachingSkill: string;
    learningSkill: string;
    message: string;
    preferredMode: 'Online' | 'Offline' | 'Either';
  }): Promise<ExchangeRequest> =>
    mapRequest(await apiRequest<BackendExchangeRequest>('/requests', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        receiverId: Number(request.receiverId),
      }),
    })),

  acceptRequest: async (requestId: string): Promise<ExchangeRequest> =>
    mapRequest(await apiRequest<BackendExchangeRequest>(`/requests/${requestId}/accept`, {
      method: 'PUT',
    })),

  rejectRequest: async (requestId: string): Promise<ExchangeRequest> =>
    mapRequest(await apiRequest<BackendExchangeRequest>(`/requests/${requestId}/reject`, {
      method: 'PUT',
    })),

  cancelRequest: async (requestId: string): Promise<ExchangeRequest> =>
    mapRequest(await apiRequest<BackendExchangeRequest>(`/requests/${requestId}/cancel`, {
      method: 'PUT',
    })),

  // Private chat; the backend derives identity from the authenticated session
  getMessages: async (requestId: string): Promise<ChatMessage[]> =>
    (await apiRequest<BackendChatMessage[]>(`/requests/${requestId}/messages`)).map(mapMessage),

  sendMessage: async (requestId: string, content: string): Promise<ChatMessage> =>
    mapMessage(await apiRequest<BackendChatMessage>(`/requests/${requestId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })),

  sendMessageAttachment: async (requestId: string, file: File): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/messages/attachments`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const responseText = await response.text();
    let data: unknown;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = responseText;
    }
    if (!response.ok) {
      const error = data as { message?: string; error?: string } | string | null;
      throw new Error(
        typeof error === 'string'
          ? error
          : error?.message || error?.error || `Request failed: ${response.status}`
      );
    }
    return mapMessage(data as BackendChatMessage);
  },

  getMessageAttachmentUrl: (requestId: string, messageId: string) =>
    `${API_BASE_URL}/requests/${requestId}/messages/${messageId}/attachment`,

  getNotifications: async (): Promise<StudentNotification[]> =>
    (await apiRequest<BackendNotification[]>('/notifications')).map(mapNotification),

  markNotificationRead: async (notificationId: string): Promise<StudentNotification> =>
    mapNotification(await apiRequest<BackendNotification>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    })),

  // Add a skill
  addStudentSkill: (
    studentId: string | number,
    skill: StudentSkillInput
  ) =>
    apiRequest<any>(`/students/${studentId}/skills`, {
      method: 'POST',
      body: JSON.stringify({
        skillName: skill.skillName,
        category: skill.category,
        proficiency: skill.proficiency,
        type: skill.type,
        experienceOrGoal: skill.experienceOrGoal,
      }),
    }),

  // Delete a skill
  deleteStudentSkill: (
    studentId: string | number,
    skillId: string | number
  ) =>
    apiRequest<any>(
      `/students/${studentId}/skills/${skillId}`,
      {
        method: 'DELETE',
      }
    ),

  // Update skill proficiency
  updateSkillProficiency: (
    studentId: string | number,
    skillId: string | number,
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced'
  ) =>
    apiRequest<any>(
      `/students/${studentId}/skills/${skillId}/proficiency?proficiency=${encodeURIComponent(proficiency)}`,
      {
        method: 'PUT',
      }
    ),
};
