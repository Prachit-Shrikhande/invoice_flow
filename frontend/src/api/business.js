import api from './axios';

export const getBusinessProfile = () => api.get('/business');
export const createBusinessProfile = (data) => api.post('/business', data);
export const updateBusinessProfile = (data) => api.put('/business', data);

export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/business/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadSignature = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/business/upload-signature', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
