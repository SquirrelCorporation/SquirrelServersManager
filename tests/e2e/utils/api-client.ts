import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API client for interacting with the SSM server during E2E tests
 */
export class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:13000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  /**
   * Set the authentication token for subsequent requests
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Clear the authentication token
   */
  clearToken(): void {
    this.token = null;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(path, config);
  }

  /**
   * Make a POST request
   */
  async post<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(path, data, config);
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(path, data, config);
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(path, config);
  }
}

// Export a default instance
export default new ApiClient(
  process.env.API_URL || 'http://localhost:13000'
);