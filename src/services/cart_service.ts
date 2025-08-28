import apiClient from './api-client';

export const fetchBestCart = () => {
  return apiClient.get(`/cart/bestCart`);
};
