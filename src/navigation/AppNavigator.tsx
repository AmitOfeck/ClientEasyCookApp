import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomBar from '../components/Bottombar';
import { LoginScreen } from '../components/LoginScreen';
import SignUp from '../components/SignupScreen';
import DishScreen from '../components/DishScreen';
import DishCreateScreen from '../components/DishCreateScreen';
import DishUpdateScreen from '../components/DishUpdateScreen';
import DishDetailScreen from '../components/DishDetailScreen';
import SearchScreen from '../components/SearchScreen'; 

// Define navigation type for TypeScript
export type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  Login: undefined;
  Dish: undefined;
  DishCreate: undefined;
  DishUpdate: { dishId: string };
  DishDetail: { dishId: string };
  Search: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Hide headers globally
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Home" component={BottomBar} />
      <Stack.Screen name="Dish" component={DishScreen} />
      <Stack.Screen name="DishCreate" component={DishCreateScreen}  />
      <Stack.Screen name="DishUpdate" component={DishUpdateScreen} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
