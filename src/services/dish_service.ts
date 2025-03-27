import apiClient from './api-client'; // Ensure you have your apiClient set up for API calls
import { IDish } from './intefaces/dish';

const getDishes = (filters: {
    cuisine: string;
    limitation: string;
    difficulty: string;
    priceMin: string;
    priceMax: string;
}) => {
    const { cuisine, limitation, difficulty, priceMin, priceMax } = filters;
    const abortController = new AbortController();

    const request = apiClient.get<IDish[]>('/dish', {
        signal: abortController.signal,
        params: {
            cuisine,
            limitation,
            difficulty,
            priceMin,
            priceMax,
        },
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

const getDishByKey = (key: string, value: string) => {
    const abortController = new AbortController();
    const request = apiClient.post<IDish>('/dish/find',
        { key, value },
        { signal: abortController.signal }
    );
    return { request, abort: () => abortController.abort() };
};

const getDishesByKeyValue = (key: string, value: string) => {
    const abortController = new AbortController();
    const request = apiClient.post<IDish[]>('/dish/findMany',
        { key, value },
        { signal: abortController.signal }
    );
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

export {
    getDishes,
    getDishById,
    getDishByKey,
    getDishesByKeyValue,
    createDish,
    updateDish,
    deleteDish,
};
