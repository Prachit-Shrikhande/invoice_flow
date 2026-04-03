import api from './axios';

export const getTerms = (type = '') => api.get(`/terms${type ? `?type=${type}` : ''}`);
export const createTerm = (data) => api.post('/terms', data);
export const updateTerm = (id, data) => api.put(`/terms/${id}`, data);
export const deleteTerm = (id) => api.delete(`/terms/${id}`);
