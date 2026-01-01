import axios from "axios";

const handleRequest = async ({ url, method = 'POST', data = null, headers = {} }) => {
  try {
    console.log(`Making ${method} request to ${url} with data:`, data);

    // Build config dynamically
    const config = {
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      withCredentials: true,
    };

    // Only attach data for methods that allow a body
    if (method !== 'GET' && data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;

  } catch (error) {
    const errorMessage = error?.response?.data?.message || 'An error occurred';
    console.error(`Error in ${method} request:`, error);
    throw error;
  }
};

export default handleRequest;
