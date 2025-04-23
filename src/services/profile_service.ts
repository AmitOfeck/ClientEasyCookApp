import apiClient from './api-client';

export interface IProfile {
  name: string;
  userName: string;
  email: string;
  dishes: any[];
  favoriteDishes: any[];
  addresses: any[];
  profileImage?: string;
}

const getProfile = () => {
  const abortController = new AbortController();
  const request = apiClient.get<IProfile>('/user/profile', {
    signal: abortController.signal,
  });
  return { request, abort: () => abortController.abort() };
};

const updateProfile = (profileData: FormData) => {
  const abortController = new AbortController();
  const request = apiClient.put<any>('/user/update-profile', profileData, {
    signal: abortController.signal,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return { request, abort: () => abortController.abort() };
};

export { getProfile, updateProfile };
