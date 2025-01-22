const getApiBaseUrl = async () => {
  // Try to get the port from the server startup logs
  const ports = [5000, 5001, 5002, 5003, 5004, 5005];

  const testPort = async (port) => {
    try {
      const response = await fetch(`http://localhost:${port}/health`);
      const data = await response.json();
      return data.status === 'ok' ? port : null;
    } catch (error) {
      return null;
    }
  };

  // Try all ports in parallel
  const results = await Promise.all(ports.map(testPort));
  const activePort = results.find(port => port !== null);

  if (activePort) {
    console.log(`Found server on port ${activePort}`);
    return `http://localhost:${activePort}/api`;
  }

  console.error('Could not find active server port');
  return 'http://localhost:5000/api'; // fallback
};

let API_BASE_URL = null;

export const initializeApi = async () => {
  API_BASE_URL = await getApiBaseUrl();
  return API_BASE_URL;
};

export const testApiConnection = async () => {
  try {
    if (!API_BASE_URL) {
      API_BASE_URL = await getApiBaseUrl();
    }

    const responses = await Promise.all([
      fetch(`${API_BASE_URL}/health`),
      fetch(API_BASE_URL.replace('/api', '/health'))
    ]);
    
    for (const response of responses) {
      if (response.ok) {
        const data = await response.json();
        console.log('API Connection Test:', data);
        return true;
      }
    }
    throw new Error('No successful response');
  } catch (error) {
    console.error('API Connection Test Failed:', error);
    return false;
  }
};

export const getApiBaseURL = () => API_BASE_URL; 