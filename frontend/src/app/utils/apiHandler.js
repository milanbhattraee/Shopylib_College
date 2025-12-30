const handleRequest = async ({ url, method = 'POST', data = null, headers = {} }) => {
  try {
    const response = await axios({
      url,
      method,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    const errorMessage = error?.response?.data?.message || 'An error occurred';
    toast.error(errorMessage);
    console.error(`Error in ${method} request:`, error);
    throw error;
  }
};

export default handleRequest;