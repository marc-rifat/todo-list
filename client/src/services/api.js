import axios from 'axios';
import { getApiBaseURL } from '../config';

const createApi = (token) => {
  return axios.create({
    baseURL: getApiBaseURL(),
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${getApiBaseURL()}/login`, {
      username,
      password,
    });
    return response.data;
  },
  register: async (username, password) => {
    const response = await axios.post(`${getApiBaseURL()}/register`, {
      username,
      password,
    });
    return response.data;
  }
};

export const todoService = {
  getTodos: async (token) => {
    const api = createApi(token);
    const response = await api.get('/todos');
    return response.data;
  },
  createTodo: async (token, title) => {
    const api = createApi(token);
    const response = await api.post('/todos', { title });
    return response.data;
  },
  updateTodo: async (token, id, updates) => {
    const api = createApi(token);
    const response = await api.put(`/todos/${id}`, updates);
    return response.data;
  },
  deleteTodo: async (token, id) => {
    const api = createApi(token);
    await api.delete(`/todos/${id}`);
  }
}; 