// src/services/api.ts - VERSION AMÉLIORÉE

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

    // 🔑 IMPORTANT: Charger le token depuis localStorage au démarrage
    const savedToken = localStorage.getItem('vio-auth-token');
    if (savedToken) {
      this.token = savedToken;
      console.log('🔐 Token loaded from localStorage');
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
      console.log('🔑 Token set in API service');
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
    firstName?: string,
    lastName?: string
  ) {
    return this.axiosInstance.post('/auth/register/', {
      username,
      email,
      password,
      password_confirm: password,
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

  async completeOnboarding(data: any) {
    return this.axiosInstance.post('/profiles/current/complete_onboarding/', data);
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
}

export const apiService = new APIService();