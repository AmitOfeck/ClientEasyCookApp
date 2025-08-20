import apiClient from './api-client';
import { IDish } from './intefaces/dish';

const getDishes = (filters: {
    cuisine: string;
    limitation: string;
    difficulty: string;
    priceMin: string;
    priceMax: string;
}) => {
    const abortController = new AbortController();
    const request = apiClient.get<IDish[]>('/dish', {
        signal: abortController.signal,
        params: {
            cuisine: filters.cuisine,
            limitation: filters.limitation,
            level: filters.difficulty,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
        },
    });
    return { request, abort: () => abortController.abort() };
};

const getMadeDishes = () => {
    const abortController = new AbortController();
    const request = apiClient.get<IDish[]>('/user/madeBefore', {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

const geRecommendedDishes = () => {
    const abortController = new AbortController();
    const request = apiClient.get<IDish[]>('/user/recommended', {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

const getDishById = (id: string) => {
    const abortController = new AbortController();
    const request = apiClient.get<IDish>(`/dish/${id}`, {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

const createDish = (dish: Partial<IDish>) => {
    const abortController = new AbortController();
    const request = apiClient.post<IDish>('/dish', dish, {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

const updateDish = (id: string, dish: Partial<IDish>) => {
    const abortController = new AbortController();
    const request = apiClient.put<IDish>(`/dish/${id}`, dish, {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

const deleteDish = (id: string) => {
    const abortController = new AbortController();
    const request = apiClient.delete<IDish>(`/dish/${id}`, {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

const healthifyDish = (id: string) => {
    const abortController = new AbortController();
    const request = apiClient.post<IDish>(`/dish/${id}/healthify`, {}, {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

const cheapifyDish = (id: string) => {
    const abortController = new AbortController();
    const request = apiClient.post<IDish>(`/dish/${id}/cheapify`, {}, {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

export {
    getDishes,
    getDishById,
    createDish,
    updateDish,
    deleteDish,
    healthifyDish,
    cheapifyDish,
    geRecommendedDishes,
    getMadeDishes,
};
