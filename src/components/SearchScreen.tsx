// screens/SearchScreen.js
import React, { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform, Animated, Easing, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { searchDish } from "../services/search_service";
import { addDishesToShoppingList } from "../services/shopping_list_service";
import { DishCard } from "./DishCard";
import FridgeScanner from "../components/FridgeScanner";
import SearchFilters from "../components/SearchFilters";

const { width } = Dimensions.get("window");

const SearchScreen = ({ navigation }) => {
  // Filters state
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedLimitation, setSelectedLimitation] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [fridgeExpanded, setFridgeExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Results
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Animation
  const spinAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (loading) {
      loopRef.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loopRef.current.start();
    } else {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current = null;
      }
      spinAnim.setValue(0);
    }
  }, [loading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // --- Search Logic ---
  const handleSearch = async () => {
    setLoading(true);
    try {
      const { request } = searchDish({
        cuisine: selectedCuisine,
        limitation: selectedLimitation,
        level: selectedDifficulty,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
      });
      const { data } = await request;
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToShoppingList = async (dishId) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication token missing.");
        return;
      }
      const { request } = addDishesToShoppingList([dishId], token);
      await request;
      alert("Dish added to your shopping list!");
    } catch (err) {
      alert("Could not add dish to shopping list.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {/* --- Main Title --- */}
      <View style={styles.headerBox}>
        <View style={styles.headerIconBox}>
          <Icon name="magnify" size={30} color="#fff" />
        </View>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.headerTitle}>What would you like to eat today?</Text>
          <Text style={styles.headerSubtitle}>Discover amazing dishes tailored for you</Text>
        </View>
      </View>

      {/* --- Fridge Scanner --- */}
      <FridgeScanner expanded={fridgeExpanded} setExpanded={setFridgeExpanded} />

      {/* --- Search Filters --- */}
      <SearchFilters
        expanded={filtersExpanded}
        setExpanded={setFiltersExpanded}
        selectedCuisine={selectedCuisine}
        setSelectedCuisine={setSelectedCuisine}
        selectedLimitation={selectedLimitation}
        setSelectedLimitation={setSelectedLimitation}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        onSearch={handleSearch}
      />

      {/* --- Loading spinner --- */}
      {loading && (
        <View style={{ alignItems: "center", marginTop: 18 }}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
          </Animated.View>
          <Text style={{
            marginTop: 12,
            color: "#2563eb",
            fontWeight: "700",
            fontSize: 16,
          }}>
            Looking for delicious dishes...
          </Text>
        </View>
      )}

      {/* --- Results --- */}
      <View style={{ marginTop: 18, width: "100%", alignItems: "center", paddingBottom: 70 }}>
        {results.map((dish) => (
          <DishCard
            key={dish._id}
            dish={dish}
            onInfoPress={() => navigation.navigate("DishDetail", { dishId: dish._id })}
            onAddPress={() => handleAddToShoppingList(dish._id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: "#e4f0fd",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 24 : 10,
    minHeight: 700,
  },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 13,
    padding: 13,
    width: width * 0.93,
    minHeight: 67,
    shadowColor: "#2563eb66",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 13,
    elevation: 7,
  },
  headerIconBox: {
    backgroundColor: "#2563eb",
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 5,
  },
  headerTitle: {
   fontSize: 17.2,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6487b0",
    fontWeight: "500",
    opacity: 0.8,
    marginLeft: 1,
    marginTop: 1,
  },
});

export default SearchScreen;
