import apiClient from './api-client';
import axios from 'axios';


const addDishesToShoppingList = (dishIds: string[], accessToken: string) => {
    const abortController = new AbortController();
  
    const request = axios.post(
      'http://10.0.2.2:3000/shopping-list/add-dishes', // not throw client api
      { dishIds },
      {
        signal: abortController.signal,
        headers: {
          Authorization: accessToken, 
        },
      }
    );
  
    return { request, abort: () => abortController.abort() };
  };

export { addDishesToShoppingList };
