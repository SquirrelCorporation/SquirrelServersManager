import { request as umiRequest } from '@umijs/max';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
}

/**
 * Shared API client with consistent error handling and response format
 */
export const apiClient = {
  /**
   * GET request
   */
  get: async <T = any>(url: string, options?: any): Promise<T> => {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'GET',
        ...(options || {}),
      });
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  
  /**
   * POST request
   */
  post: async <T = any>(url: string, data?: any, options?: any): Promise<T> => {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'POST',
        data,
        ...(options || {}),
      });
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  
  /**
   * PUT request
   */
  put: async <T = any>(url: string, data?: any, options?: any): Promise<T> => {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'PUT',
        data,
        ...(options || {}),
      });
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  
  /**
   * DELETE request
   */
  delete: async <T = any>(url: string, options?: any): Promise<T> => {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'DELETE',
        ...(options || {}),
      });
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  },
  
  /**
   * PATCH request
   */
  patch: async <T = any>(url: string, data?: any, options?: any): Promise<T> => {
    try {
      const response = await umiRequest<ApiResponse<T>>(url, {
        method: 'PATCH',
        data,
        ...(options || {}),
      });
      return response.data;
    } catch (error) {
      throw normalizeError(error);
    }
  }
};

/**
 * Normalize error responses to a consistent format
 */
function normalizeError(error: any): ApiError {
  if (error?.response?.data?.message) {
    return {
      message: error.response.data.message,
      code: error.response.status,
      details: error.response.data
    };
  }
  
  if (error?.message) {
    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    };
  }
  
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error
  };
}