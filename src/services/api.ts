const API_BASE_URL = 'http://localhost:3001/api';

export interface Config {
  provider: 'plex' | 'jellyfin';
  plexUrl: string;
  plexToken: string;
  jellyfinUrl: string;
  jellyfinApiKey: string;
  jellyfinUserId: string;
  tmdbApiKey: string;
  overseerrUrl: string;
  overseerrApiKey: string;
  useJellyseerr: boolean;
  jellyseerrUrl: string;
  jellyseerrApiKey: string;
  ratingThreshold: number;
  recommendationsPerSeed: number;
  useWatchHistory: boolean; // New field for non-review-based recommendations
  watchHistoryLimit: number; // Number of recent items to use for watch history mode
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
    console.log('Request options:', options);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        if (error instanceof TypeError) {
          console.error('This is likely a network connectivity issue - backend server may not be running');
        }
      }
      throw error;
    }
  }

  // Configuration endpoints
  async getConfig(): Promise<Config> {
    try {
      return await this.request<Config>('/config');
    } catch (error) {
      console.log('No existing config found, returning defaults');
      return {
        provider: 'plex',
        plexUrl: '',
        plexToken: '',
        jellyfinUrl: '',
        jellyfinApiKey: '',
        jellyfinUserId: '',
        tmdbApiKey: '',
        overseerrUrl: '',
        overseerrApiKey: '',
        useJellyseerr: false,
        jellyseerrUrl: '',
        jellyseerrApiKey: '',
        ratingThreshold: 4,
        recommendationsPerSeed: 5,
        useWatchHistory: false,
        watchHistoryLimit: 25
      };
    }
  }

  async saveConfig(config: Partial<Config>): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // Connection testing
  async testConnection(service: 'plex' | 'jellyfin' | 'tmdb' | 'overseerr' | 'jellyseerr'): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/test/${service}`, {
      method: 'POST',
    });
  }

  // Library sync
  async syncLibrary(): Promise<ApiResponse<{ processedMovies: number; processedShows: number }>> {
    return this.request<ApiResponse<{ processedMovies: number; processedShows: number }>>('/sync', {
      method: 'POST',
    });
  }

  // Recommendations
  async getRecommendations(type: 'movies' | 'tv'): Promise<any[]> {
    console.log(`🌐 API: Getting recommendations for ${type}`);
    const result = await this.request<any[]>(`/recommendations/${type}`);
    console.log(`🌐 API: Received ${result.length} recommendation groups for ${type}`);
    return result;
  }

  // Content requests - FIXED: backend expects 'contentType' not 'type'
  async requestContent(tmdbId: number, contentType: 'movie' | 'tv'): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('/request', {
      method: 'POST',
      body: JSON.stringify({ tmdbId, contentType }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }

  // Debug endpoint
  async getDebugInfo(): Promise<any> {
    return this.request<any>('/debug');
  }

  // Stats endpoint
  async getStats(): Promise<any> {
    return this.request<any>('/stats');
  }
}

export const apiService = new ApiService();
