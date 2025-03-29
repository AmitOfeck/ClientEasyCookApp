import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HomeScreen from "./HomeScreen";
import DishScreen from "./DishScreen";
import ShoppingListScreen from "./ShoppingListScreen";

type TabBarIconProps = {
  color: string;
  size: number;
};

const Tab = createBottomTabNavigator();

const BottomBar: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }: TabBarIconProps) => {
          let iconName: string;
          console.log(route.name, );
          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "Cart":
              iconName = "cart-outline";
              break;
            case "Search":
              iconName = "magnify";
              break;
            case "Dish":
              iconName = "silverware-fork-knife";
              break;
            case "Location":
              iconName = "map-marker-outline";
              break;
            default:
              iconName = "circle-outline";
          }

          return (
            <View style={styles.iconWrapper}>
              <Icon name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: "#1E3A8A", // Active tab color
        tabBarInactiveTintColor: "#8E8E93", // Inactive tab color
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen name="Search" component={HomeScreen} options={{ tabBarLabel: "Search" }} />
      <Tab.Screen name="Dish" component={DishScreen} options={{ tabBarLabel: "Dish" }} />
      <Tab.Screen name="Location" component={HomeScreen} options={{ tabBarLabel: "Location" }} />
      <Tab.Screen name="Cart" component={ShoppingListScreen} options={{ tabBarLabel: "Cart" }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    height: 75,
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 5,
  },
  tabBarItem: {
    paddingVertical: 8,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BottomBar;
