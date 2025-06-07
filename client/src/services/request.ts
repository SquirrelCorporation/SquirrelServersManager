import { request as umiRequest } from '@umijs/max';

/**
 * Request service for API calls
 */
export const request = {
  /**
   * GET request
   * @param url URL to fetch
   * @param options Request options
   * @returns Promise with response
   */
  get: (url: string, options?: any) => {
    return umiRequest(url, {
      method: 'GET',
      ...(options || {}),
    });
  },
  
  /**
   * POST request
   * @param url URL to fetch
   * @param data Data to send
   * @param options Request options
   * @returns Promise with response
   */
  post: (url: string, data?: any, options?: any) => {
    return umiRequest(url, {
      method: 'POST',
      data,
      ...(options || {}),
    });
  },
  
  /**
   * PUT request
   * @param url URL to fetch
   * @param data Data to send
   * @param options Request options
   * @returns Promise with response
   */
  put: (url: string, data?: any, options?: any) => {
    return umiRequest(url, {
      method: 'PUT',
      data,
      ...(options || {}),
    });
  },
  
  /**
   * DELETE request
   * @param url URL to fetch
   * @param options Request options
   * @returns Promise with response
   */
  delete: (url: string, options?: any) => {
    return umiRequest(url, {
      method: 'DELETE',
      ...(options || {}),
    });
  },
}; 