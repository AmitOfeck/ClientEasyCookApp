import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ShoppingListScreen from '../components/ShoppingListScreen';
import CartOptionsScreen from '../components/CartOptionsScreen';
import CartDetailScreen from '../components/CartDetailScreen';

export type CartStackParamList = {
  ShoppingList: undefined;
  CartOptions: {
    cartOptions: {
      _id: string;
      superId: string;
      totalCost: number;
      products: {
        itemId: string;
        name: string;
        unit_info: string;
        image_url: string;
        price: number;
        quantity: number;
      }[];
    }[];
  };
  CartDetail: {
    products: {
      itemId: string;
      quantity: number;
      price: number;
      name: string;
      image_url: string;
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
