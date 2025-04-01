// navigation/CartStackScreen.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ShoppingListScreen from '../components/ShoppingListScreen';
import CartOptionsScreen from '../components/CartOptionsScreen';
import CartDetailScreen from '../components/CartDetailScreen';

export type CartStackParamList = {
  ShoppingList: undefined;
  CartOptions: undefined;
  CartDetail: {
    products: {
      itemId: string;
      quantity: number;
      price: number;
    }[];
    superId: string;
    totalCost: number;
  };
};

const Stack = createStackNavigator<CartStackParamList>();

const CartStackScreen: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen name="CartOptions" component={CartOptionsScreen} />
      <Stack.Screen name="CartDetail" component={CartDetailScreen} />
    </Stack.Navigator>
  );
};

export default CartStackScreen;
