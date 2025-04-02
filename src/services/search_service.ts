import apiClient from './api-client'; // Ensure you have your apiClient set up for API calls
import { ISearch } from './intefaces/search';

const searchDish = (criteria: Partial<ISearch>) => {
    const abortController = new AbortController();
    const request = apiClient.post<any>('/search', criteria, {
        signal: abortController.signal,
    });
    return { request, abort: () => abortController.abort() };
};

export {
    searchDish
};
