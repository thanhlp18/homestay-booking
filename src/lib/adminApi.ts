// Utility function for making authenticated admin API calls
export async function adminApiCall(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Merge options
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  console.log('Making admin API call to:', url);
  console.log('Options:', finalOptions);

  return fetch(url, finalOptions);
}

// Helper function to handle API responses
export async function handleApiResponse(response: Response) {
  console.log('API Response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    console.error('API Error:', error);
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API Success:', data);
  return data;
} 