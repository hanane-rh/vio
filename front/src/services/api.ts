// src/services/api.ts - VERSION FINALE CORRIGÉE

import axios, { AxiosInstance } from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  
class APIService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 🔓 IMPORTANT: Charger le token depuis localStorage au démarrage
    const savedToken = localStorage.getItem('vio-auth-token');
    if (savedToken) {
      this.token = savedToken;
      console.log('🔓 Token loaded from localStorage');
    }

    // Interceptor pour ajouter le token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Token ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor pour les erreurs
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token invalide - logout
          console.log('🚪 401 Unauthorized - logging out');
          localStorage.removeItem('vio-auth-token');
          localStorage.removeItem('vio-user-profile');
          this.token = null;
          
          // Éviter la redirection en boucle
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      console.log('🔒 Token set in API service');
    } else {
      console.log('🔓 Token cleared from API service');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('vio-auth-token');
    localStorage.removeItem('vio-user-profile');
    console.log('🧹 Token and profile cleared');
  }

  // ============ AUTH ENDPOINTS ============

  async register(
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    firstName?: string,
    lastName?: string
  ) {
    return this.axiosInstance.post('/auth/register/', {
      username,
      email,
      password,
      password_confirm,
      first_name: firstName,
      last_name: lastName,
    });
  }

  async login(username: string, password: string) {
    return this.axiosInstance.post('/auth/login/', {
      username,
      password,
    });
  }

  async logout() {
    try {
      await this.axiosInstance.post('/auth/logout/');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearToken();
    }
  }

  // ============ PROFILE ENDPOINTS ============

  async getCurrentProfile() {
    return this.axiosInstance.get('/profiles/current/');
  }

  // ✅ CORRIGÉ: Utiliser POST (pas PATCH) car Django n'accepte que POST
  async completeOnboarding(data: any) {
    console.log('🔄 Sending onboarding completion...');
    return this.axiosInstance.post('/profiles/complete_onboarding/', data);
  }

  // ============ AVATAR ENDPOINTS ============

  async getCurrentAvatar() {
    return this.axiosInstance.get('/avatars/current/');
  }

  async updateAvatar(data: any) {
    return this.axiosInstance.post('/avatars/current/', data);
  }

  async createAvatar(data: any) {
    return this.axiosInstance.post('/avatars/', data);
  }

  // ============ TREATMENT INFO ENDPOINTS ============

  async getTreatmentInfo() {
    return this.axiosInstance.get('/treatment/current/');
  }

  async updateTreatmentInfo(data: any) {
    return this.axiosInstance.post('/treatment/current/', data);
  }

  async createTreatmentInfo(data: any) {
    return this.axiosInstance.post('/treatment/', data);
  }

  // ============ TASK TEMPLATE ENDPOINTS ============

  async getTaskTemplates() {
    return this.axiosInstance.get('/task-templates/');
  }

  async createTaskTemplate(data: any) {
    return this.axiosInstance.post('/task-templates/', data);
  }

  async regenerateFutureTasks() {
    return this.axiosInstance.post('/task-templates/regenerate_future_tasks/');
  }
// ============ TASK ENDPOINTS ============
// Create a task for today only
async createTask(data: { title: string; date: string }) {
  return this.axiosInstance.post('/tasks/', data);
}


async deleteTask(taskId: string | number) {
  return this.axiosInstance.delete(`/tasks/${taskId}/`);
}

  // ============ TASK ENDPOINTS ============

  async getTodayTasks() {
    return this.axiosInstance.get('/tasks/today/');
  }

  async getTasksByDate(date: string) {
    return this.axiosInstance.get('/tasks/by_date/', {
      params: { date },
    });
  }

  async initializeTodayTasks() {
    return this.axiosInstance.post('/tasks/init_today_tasks/');
  }

  async toggleTaskCompletion(taskId: number | string) {
    return this.axiosInstance.post(`/tasks/${taskId}/toggle_completion/`);
  }

  async getAllTasks() {
    return this.axiosInstance.get('/tasks/');
  }

  // ============ USER STATE ENDPOINTS ============

  async getUserState() {
    return this.axiosInstance.get('/user-state/current/');
  }

  async updateUserState(data: {
    fatigue_level?: number;
    consistency_score?: number;
    mood_level?: number;
  }) {
    return this.axiosInstance.post('/user-state/current/', data);
  }

  // ============ CONSTELLATION ENDPOINTS ============

  async getConstellationStars() {
    return this.axiosInstance.get('/constellation/');
  }

  async createConstellationStar(data: any) {
    return this.axiosInstance.post('/constellation/', data);
  }

  async getConstellationStats() {
    return this.axiosInstance.get('/constellation/stats/');
  }

  // ============ FUTURE SELF MESSAGE ENDPOINTS ============

  async getFutureMessages() {
    return this.axiosInstance.get('/messages/');
  }

  async getUnlockedMessages() {
    return this.axiosInstance.get('/messages/unlocked/');
  }

  // ============ NOTIFICATION ENDPOINTS ============

  async getPendingNotifications() {
    return this.axiosInstance.get('/notifications/pending/');
  }

  async dismissNotification(notificationId: number) {
    return this.axiosInstance.post(`/notifications/${notificationId}/dismiss/`);
  }

  async dismissAllNotifications() {
    return this.axiosInstance.post('/notifications/dismiss_all/');
  }

  async getTodayNotifications() {
    return this.axiosInstance.get('/notifications/today/');
  }
  async createWelcomeNotification() {
    return this.axiosInstance.post('/notifications/create_welcome/');
  }
}

export const apiService = new APIService();

// src/services/api.ts - COMPLETE API SERVICE

import type {
  Routine,
  RoutinePayload,
  RoutineCompletion,
  UserScore,
  ScoreHistory,
  LeaderboardEntry,
  CompleteRoutineResponse,
  RoutineStatistics,
  ApiError
} from '../types/routine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('vio-auth-token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Token ${token}` } : {})
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let error: ApiError;
      try {
        error = await response.json();
      } catch {
        error = { 
          detail: response.status === 401 
            ? 'Authentication required. Please log in.' 
            : `HTTP ${response.status}: ${response.statusText}`
        };
      }
      console.error('API Error:', error);
      throw error;
    }
    
    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return (response.status === 204 ? null : []) as T;
    }
    
    try {
      return JSON.parse(text) as T;
    } catch {
      console.error('Failed to parse JSON response:', text);
      throw { detail: 'Invalid response from server' };
    }
  }

  // ==================== ROUTINE ENDPOINTS ====================

  async getRoutines(): Promise<Routine[]> {
    const response = await fetch(`${API_BASE_URL}/routines/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Routine[]>(response);
  }

  async getTodayRoutines(): Promise<Routine[]> {
    const response = await fetch(`${API_BASE_URL}/routines/today/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Routine[]>(response);
  }

  async getRoutine(id: number): Promise<Routine> {
    const response = await fetch(`${API_BASE_URL}/routines/${id}/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Routine>(response);
  }

  async createRoutine(data: RoutinePayload): Promise<Routine> {
    const response = await fetch(`${API_BASE_URL}/routines/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<Routine>(response);
  }

  async updateRoutine(id: number, data: Partial<RoutinePayload>): Promise<Routine> {
    const response = await fetch(`${API_BASE_URL}/routines/${id}/`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<Routine>(response);
  }

  async deleteRoutine(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/routines/${id}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete routine');
    }
  }

  async completeRoutine(id: number): Promise<CompleteRoutineResponse> {
    const response = await fetch(`${API_BASE_URL}/routines/${id}/complete/`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CompleteRoutineResponse>(response);
  }

  async toggleRoutinePause(id: number): Promise<{ detail: string; routine: Routine }> {
    const response = await fetch(`${API_BASE_URL}/routines/${id}/toggle_pause/`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<{ detail: string; routine: Routine }>(response);
  }

  async getRoutineStatistics(): Promise<RoutineStatistics> {
    const response = await fetch(`${API_BASE_URL}/routines/statistics/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<RoutineStatistics>(response);
  }

  // ==================== SCORE ENDPOINTS ====================

  async getCurrentScore(): Promise<UserScore> {
    const response = await fetch(`${API_BASE_URL}/scores/current/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<UserScore>(response);
  }

  async getScoreHistory(): Promise<ScoreHistory[]> {
    const response = await fetch(`${API_BASE_URL}/scores/history/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<ScoreHistory[]>(response);
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE_URL}/scores/leaderboard/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<LeaderboardEntry[]>(response);
  }

  // ==================== COMPLETION ENDPOINTS ====================

  async getCompletions(): Promise<RoutineCompletion[]> {
    const response = await fetch(`${API_BASE_URL}/completions/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<RoutineCompletion[]>(response);
  }

  async getTodayCompletions(): Promise<RoutineCompletion[]> {
    const response = await fetch(`${API_BASE_URL}/completions/today/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<RoutineCompletion[]>(response);
  }

  async getCalendarCompletions(month: string): Promise<RoutineCompletion[]> {
    const response = await fetch(`${API_BASE_URL}/completions/calendar/?month=${month}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<RoutineCompletion[]>(response);
  }
}

// Export singleton instance
export const api = new ApiService();

// Also export the class for testing
export default ApiService;