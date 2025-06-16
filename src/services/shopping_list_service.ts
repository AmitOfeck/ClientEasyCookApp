import apiClient from './api-client';
import axios from 'axios';

const addShoppingItem = (name: string, unit: string, quantity: number) => {
    return apiClient.post('/shopping-list/add', { name, unit, quantity });
  };
  
  const updateItemQuantity = (itemName: string, unit: string, delta: number) => {
    return apiClient.put('/shopping-list/update-quantity', { itemName, unit, delta });
  };
  
  const removeShoppingItem = (itemName: string) => {
    return apiClient.put('/shopping-list/remove', { itemName });
  };
  
  const clearShoppingList = () => {
    return apiClient.put('/shopping-list/clear');
  };

  const replaceShoppingItem = (name: string, unit: string, quantity: number) => {
    return apiClient.put('/shopping-list/replace', { name, unit, quantity });
  };
  

const addDishesToShoppingList = (dishIds: string[], accessToken: string) => {
    const abortController = new AbortController();
  
    const request = apiClient.post(
      '/shopping-list/add-dishes',
      { dishIds },
      {
        signal: abortController.signal,
        headers: {
          Authorization: accessToken, 
          'X-Skip-Auth': 'true', 
        },
      }
    );
  
    return { request, abort: () => abortController.abort() };
  };


// use without client api

  // const addDishesToShoppingList = (dishIds: string[], accessToken: string) => {
//     const abortController = new AbortController();
  
//     const request = axios.post(
//       'http://easycook.cs.colman.ac.il/shopping-list/add-dishes', // not throw client api
//       { dishIds },
//       {
//         signal: abortController.signal,
//         headers: {
//           Authorization: accessToken, 
//         },
//       }
//     );
  
//     return { request, abort: () => abortController.abort() };
//   };
  

export { addDishesToShoppingList, addShoppingItem, updateItemQuantity, removeShoppingItem, clearShoppingList , replaceShoppingItem};
