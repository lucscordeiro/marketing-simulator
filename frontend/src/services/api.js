import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },

  register: (name, email, password) => {
    return api.post('/auth/register', { name, email, password });
  }
};

export const projectService = {
  create: (projectData) => api.post('/projects', projectData),
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, updates) => api.put(`/projects/${id}`, updates),
  delete: (id) => api.delete(`/projects/${id}`)
};

export const datasetService = {
  upload: (projectId, formData) => 
    api.post(`/datasets/upload/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getByProject: (projectId) => api.get(`/datasets/project/${projectId}`),
  delete: (id) => api.delete(`/datasets/${id}`)
};

export const aiService = {
  
  trainModel: (projectId, datasetId, config) => 
    api.post('/ai/train', { projectId, datasetId, config }),
  getModels: (projectId) => api.get(`/ai/models/${projectId}`),

  simulate: (projectId, modelId, parameters) =>
    api.post('/ai/simulate', { projectId, modelId, parameters }),
  getSimulations: (projectId) => api.get(`/ai/simulations/${projectId}`),

  // Análise de projeto
  analyzeProject: (projectId) => 
    api.get(`/ai/analyze/project/${projectId}`),

  // Previsão de campanha
  predictCampaign: (projectId, campaignData) => 
    api.post(`/ai/predict/campaign/${projectId}`, campaignData),

  // Chat com agente
  chatWithAgent: (projectId, message, conversationHistory = []) => 
    api.post(`/ai/chat/${projectId}`, { message, conversationHistory }),

  // Otimização
  optimizeCampaign: (projectId, constraints) => 
    api.post(`/ai/optimize/campaign/${projectId}`, constraints),

  // Geração de insights
  generateInsights: (projectId, insightType = 'comprehensive') => 
    api.post(`/ai/insights/generate/${projectId}`, { insightType }),

  // Modelos existentes (compatibilidade)
  trainModel: (projectId, datasetId, config) => 
    api.post('/ai/train', { projectId, datasetId, config }),

  getModels: (projectId) => 
    api.get(`/ai/models/${projectId}`),

  simulate: (projectId, modelId, parameters) => 
    api.post('/ai/simulate', { projectId, modelId, parameters }),

  getSimulations: (projectId) => 
    api.get(`/ai/simulations/${projectId}`)
};

export default api;