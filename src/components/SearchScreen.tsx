import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { searchDish } from "../services/search_service";
import { addDishesToShoppingList } from "../services/shopping_list_service";
import { DishCard } from "../components/DishCard";
import FridgeScanner from "../components/FridgeScanner";
import SearchFilters from "../components/SearchFilters";
import SearchPrompt from "../components/SearchPrompt";
import { IDish } from "../services/intefaces/dish";

const { width } = Dimensions.get("window");

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Prompt state
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [prompt, setPrompt] = useState("");

  // “Use fridge items” toggle lifted here
  const [useFridgeItems, setUseFridgeItems] = useState(false);

  // Filters state
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedLimitation, setSelectedLimitation] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 500]);
  const [fridgeExpanded, setFridgeExpanded] = useState<boolean>(true);
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);

  // Results
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<IDish[]>([]);

  // Spinner animation
  const spinAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
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
      loopRef.current?.stop();
      spinAnim.setValue(0);
    }
  }, [loading, spinAnim]);
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const handleSearch = async () => {
    setFridgeExpanded(false);
    setFiltersExpanded(false);
    setPromptExpanded(false);
    setLoading(true);
    try {
      const { request } = searchDish({
        prompt: prompt.trim() || undefined,
        cuisine: selectedCuisine || undefined,
        limitation: selectedLimitation || undefined,
        level: selectedDifficulty || undefined,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
        useFridge: useFridgeItems,   
      });
      const { data } = await request;
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      Alert.alert("Error", "Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToShoppingList = async (dishId: string) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "Authentication token missing.");
        return;
      }
      const { request } = addDishesToShoppingList([dishId], token);
      await request;
      Alert.alert("Success", "Dish added to your shopping list!");
    } catch {
      Alert.alert("Error", "Could not add dish to shopping list.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      {/* Header */}
      <View style={styles.headerBox}>
        <View style={styles.headerIconBox}>
          <Icon name="magnify" size={30} color="#fff" />
        </View>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.headerTitle}>
            What would you like to eat today?
          </Text>
          <Text style={styles.headerSubtitle}>
            Discover amazing dishes tailored for you
          </Text>
        </View>
      </View>

      {/* Fridge Scanner */}
      <FridgeScanner
        expanded={fridgeExpanded}
        setExpanded={setFridgeExpanded}
        useFridgeItems={useFridgeItems}
        setUseFridgeItems={setUseFridgeItems}
      />

      {/* Search Prompt */}
      <SearchPrompt
        expanded={promptExpanded}
        setExpanded={setPromptExpanded}
        prompt={prompt}
        setPrompt={setPrompt}
      />

      {/* Filters */}
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
      />

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {/* Loading Spinner */}
      {loading && (
        <View style={{ alignItems: "center", marginTop: 18 }}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
          </Animated.View>
          <Text style={styles.loadingText}>Looking for delicious dishes...</Text>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
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
  },
  headerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 25,
    marginVertical: 12,
    padding: 12,
    width: width * 0.93,
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6487b0",
    fontWeight: "500",
    opacity: 0.8,
  },
  searchButton: {
    backgroundColor: "#e8f2ff",
    borderRadius: 19,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2186eb",
    marginVertical: 12,
    width: "93%",
    shadowColor: "#2563eb22",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchButtonText: {
    color: "#2186eb",
    fontSize: 15.5,
    fontWeight: "700",
  },
  loadingText: {
    marginTop: 12,
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 18,
    width: "100%",
    alignItems: "center",
    paddingBottom: 70,
  },
});

export default SearchScreen;
