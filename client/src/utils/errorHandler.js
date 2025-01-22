export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  }
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return 'An unexpected error occurred';
}; 