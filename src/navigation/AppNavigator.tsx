import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomBar from '../components/Bottombar';
import { LoginScreen } from '../components/LoginScreen';
import SignUp from '../components/SignupScreen';
import DishScreen from '../components/DishScreen';
import DishCreateScreen from '../components/DishCreateScreen';
import DishUpdateScreen from '../components/DishUpdateScreen';
import DishDetailScreen from '../components/DishDetailScreen';
import ShoppingListScreen from '../components/ShoppingListScreen';
import CartOptionsScreen from '../components/CartOptionsScreen';

export type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  Login: undefined;
  Dish: undefined;
  DishCreate: undefined;
  DishUpdate: { dishId: string };
  DishDetail: { dishId: string };
  ShoppingList?: undefined;
  CartOptions: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

import { createStackNavigator as createNestedStackNavigator } from '@react-navigation/stack';

const CartStack = createNestedStackNavigator();

const CartStackScreen = () => (
  <CartStack.Navigator screenOptions={{ headerShown: false }}>
    <CartStack.Screen name="ShoppingList" component={ShoppingListScreen} />
    <CartStack.Screen name="CartOptions" component={CartOptionsScreen} />
  </CartStack.Navigator>
);


const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Home" component={BottomBar} />
      <Stack.Screen name="Dish" component={DishScreen} />
      <Stack.Screen name="DishCreate" component={DishCreateScreen} />
      <Stack.Screen name="DishUpdate" component={DishUpdateScreen} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
    </Stack.Navigator>
  );
};

export { CartStackScreen }; 
export default AppNavigator;
