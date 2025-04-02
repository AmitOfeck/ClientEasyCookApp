import apiClient from './api-client';

export const fetchBestCart = (userId: string) => {
  return apiClient.get(`/cart/bestCart/${userId}`);
};
