// src/services/api.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class APIService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor pour ajouter le token à chaque requête
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('carepath-auth-token');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor pour gérer les erreurs d'authentification
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('carepath-auth-token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============= AUTH ENDPOINTS =============
  async register(username: string, email: string, password: string, firstName: string = '', lastName: string = '') {
    return this.axiosInstance.post('/auth/register/', {
      username,
      email,
      password,
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
    return this.axiosInstance.post('/auth/logout/');
  }

  // ============= AVATAR ENDPOINTS =============
  async getAvatarConfig() {
    return this.axiosInstance.get('/avatars/current/');
  }

  async createOrUpdateAvatarConfig(data: any) {
    return this.axiosInstance.post('/avatars/current/', data);
  }

  // ============= USER PROFILE ENDPOINTS =============
  async getUserProfile() {
    return this.axiosInstance.get('/profile/current/');
  }

  async completeOnboarding(avatar: any) {
    return this.axiosInstance.post('/profile/current/complete_onboarding/', {
      avatar,
    });
  }

  // ============= TASK ENDPOINTS =============
  async getTodayTasks() {
    return this.axiosInstance.get('/tasks/today/');
  }

  async getDailyTasks() {
    return this.axiosInstance.get('/tasks/daily/');
  }

  async getChallengeTasks() {
    return this.axiosInstance.get('/tasks/challenges/');
  }

  async createTask(data: any) {
    return this.axiosInstance.post('/tasks/', data);
  }

  async toggleTaskCompletion(taskId: number | string) {
    return this.axiosInstance.post(`/tasks/${taskId}/toggle_completion/`);
  }

  async initializeTodayTasks() {
    return this.axiosInstance.post('/tasks/initialize_today/');
  }

  // ============= CONSTELLATION ENDPOINTS =============
  async getConstellationStars() {
    return this.axiosInstance.get('/constellation/');
  }

  async createConstellationStar(data: any) {
    return this.axiosInstance.post('/constellation/', data);
  }

  async getConstellationStats() {
    return this.axiosInstance.get('/constellation/stats/');
  }

  // ============= USER STATE ENDPOINTS =============
  async getUserState() {
    return this.axiosInstance.get('/user-state/current/');
  }

  async updateUserState(data: any) {
    return this.axiosInstance.post('/user-state/current/', data);
  }

  // ============= ADAPTIVE CHALLENGES ENDPOINTS =============
  async getTodayAdaptiveChallenges() {
    return this.axiosInstance.get('/challenges/today/');
  }

  async createAdaptiveChallenge(data: any) {
    return this.axiosInstance.post('/challenges/', data);
  }

  async toggleAdaptiveChallengeCompletion(challengeId: number | string) {
    return this.axiosInstance.post(`/challenges/${challengeId}/toggle_completion/`);
  }

  // ============= FUTURE SELF MESSAGES ENDPOINTS =============
  async getFutureSelfMessages() {
    return this.axiosInstance.get('/future-messages/');
  }

  async getUnlockedMessages() {
    return this.axiosInstance.get('/future-messages/unlocked/');
  }

  async checkMessageUnlocks() {
    return this.axiosInstance.get('/future-messages/check_unlocks/');
  }
}

export const apiService = new APIService();