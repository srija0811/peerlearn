/**
 * PeerLearn Full-Stack REST API Client
 * Connects frontend UI to the backend service (Port 3000 / Spring Boot Port 8080)
 */

import { Student, ExchangeRequest, LearningSession, StudentSkill } from '../types';

export interface HealthResponse {
  status: string;
  database: string;
  studentsCount: number;
  timestamp: string;
}

export interface DevOpsStatusResponse {
  application: {
    name: string;
    version: string;
    tagline: string;
    runtime: string;
    database: string;
    status: string;
    uptimeSeconds: number;
    timestamp: string;
  };
  syllabusPillars: {
    git: {
      tool: string;
      status: string;
      branch: string;
      secondaryBranch: string;
      latestCommit: string;
      gitignoreEnforced: boolean;
      trackedFilesCount: number;
    };
    maven: {
      tool: string;
      status: string;
      version: string;
      jdkVersion: string;
      buildCommand: string;
      testSuite: string;
      artifact: string;
    };
    jenkins: {
      tool: string;
      status: string;
      pipelineFile: string;
      stages: Array<{ name: string; status: string; duration: string }>;
      lastBuildNumber: number;
      buildResult: string;
    };
    docker: {
      tool: string;
      status: string;
      imageName: string;
      baseImage: string;
      containers: Array<{ name: string; port: number; status: string }>;
      dockerfile: string;
    };
    kubernetes: {
      tool: string;
      status: string;
      namespace: string;
      manifests: string[];
      appServiceType: string;
      nodePort: number;
      replicas: number;
      pvcStorage: string;
      healthProbes: {
        liveness: string;
        readiness: string;
      };
    };
  };
  liveStats: {
    studentsCount: number;
    activeSessions: number;
    pendingRequests: number;
  };
}

class ApiClient {
  private baseUrl = '';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorMessage = `HTTP error ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // ignore
      }
      throw new Error(errorMessage);
    }

    return res.json() as Promise<T>;
  }

  // Health
  public async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health');
  }

  // DevOps Status (5 Syllabus Pillars)
  public async getDevOpsStatus(): Promise<DevOpsStatusResponse> {
    return this.request<DevOpsStatusResponse>('/api/devops/status');
  }

  // Authentication
  public async login(email: string, password?: string) {
    return this.request<{ success: boolean; role?: string; student?: Student; admin?: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  public async register(studentData: Partial<Student> & { password?: string }) {
    return this.request<Student>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  // Students
  public async getStudents(params?: { branch?: string; year?: string; availability?: string; q?: string }): Promise<Student[]> {
    const searchParams = new URLSearchParams();
    if (params?.branch) searchParams.append('branch', params.branch);
    if (params?.year) searchParams.append('year', params.year);
    if (params?.availability) searchParams.append('availability', params.availability);
    if (params?.q) searchParams.append('q', params.q);

    const queryStr = searchParams.toString();
    const endpoint = queryStr ? `/api/students?${queryStr}` : '/api/students';
    return this.request<Student[]>(endpoint);
  }

  public async getStudentById(id: string): Promise<Student> {
    return this.request<Student>(`/api/students/${id}`);
  }

  public async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    return this.request<Student>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async addStudentSkill(studentId: string, skill: Omit<StudentSkill, 'id'>): Promise<Student> {
    return this.request<Student>(`/api/students/${studentId}/skills`, {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  }

  public async removeStudentSkill(studentId: string, skillId: string): Promise<Student> {
    return this.request<Student>(`/api/students/${studentId}/skills/${skillId}`, {
      method: 'DELETE',
    });
  }

  // Mutual Skill Matches
  public async getMatches(studentId: string): Promise<any[]> {
    return this.request<any[]>(`/api/matches/${studentId}`);
  }

  // Exchange Requests
  public async getRequests(studentId: string): Promise<{ incoming: ExchangeRequest[]; sent: ExchangeRequest[]; accepted: ExchangeRequest[] }> {
    return this.request<{ incoming: ExchangeRequest[]; sent: ExchangeRequest[]; accepted: ExchangeRequest[] }>(`/api/requests/student/${studentId}`);
  }

  public async sendRequest(requestData: Partial<ExchangeRequest>): Promise<ExchangeRequest> {
    return this.request<ExchangeRequest>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  public async acceptRequest(requestId: string): Promise<ExchangeRequest> {
    return this.request<ExchangeRequest>(`/api/requests/${requestId}/accept`, {
      method: 'PUT',
    });
  }

  // Sessions
  public async getSessions(studentId: string): Promise<{ upcoming: LearningSession[]; completed: LearningSession[] }> {
    return this.request<{ upcoming: LearningSession[]; completed: LearningSession[] }>(`/api/sessions/student/${studentId}`);
  }

  public async scheduleSession(sessionData: Partial<LearningSession>): Promise<LearningSession> {
    return this.request<LearningSession>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  public async completeSession(sessionId: string, rating: number, feedback?: string): Promise<LearningSession> {
    return this.request<LearningSession>(`/api/sessions/${sessionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  // Admin Stats
  public async getAdminStats(): Promise<any> {
    return this.request<any>('/api/admin/stats');
  }
}

export const api = new ApiClient();
