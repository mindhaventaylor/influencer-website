import { getApiBearerToken } from './config';

/**
 * Utility function to make API requests with the configured bearer token
 * @param url - The API endpoint URL
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise<Response>
 */
export async function makeApiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const bearerToken = getApiBearerToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${bearerToken}`,
  };

  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, requestOptions);
}

/**
 * Example usage for making API requests with the bearer token
 */
export const apiExamples = {
  // Example: GET request
  async getData(endpoint: string) {
    const response = await makeApiRequest(endpoint, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Example: POST request
  async postData(endpoint: string, data: any) {
    const response = await makeApiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Example: PUT request
  async putData(endpoint: string, data: any) {
    const response = await makeApiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Example: DELETE request
  async deleteData(endpoint: string) {
    const response = await makeApiRequest(endpoint, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return response.json();
  },
};

