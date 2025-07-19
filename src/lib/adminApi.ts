// Utility function for making authenticated admin API calls
export async function adminApiCall(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error('No admin token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Helper function to handle API responses
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
} 