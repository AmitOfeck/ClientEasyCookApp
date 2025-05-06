import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { searchDish } from "../services/search_service";
import dishPlaceholder from "../assets/dish.png";      // fallback image
import { IDish } from "../services/intefaces/dish";
import { addDishesToShoppingList } from "../services/shopping_list_service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CUISINES = ["ITALIAN", "CHINESE", "INDIAN", "MEXICAN"];
const LIMITATIONS = ["VEGETARIAN", "VEGAN", "GLUTEN_FREE"];
const LEVELS = ["EASY", "MEDIUM", "HARD"];

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedLimitation, setSelectedLimitation] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [priceMin, setPriceMin] = useState("5");
  const [priceMax, setPriceMax] = useState("20");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IDish[]>([]);

  /** ─────────────────────────  SEARCH  ───────────────────────── */
  const handleSearch = async () => {
    setLoading(true);
    try {
      const { request } = searchDish({
        cuisine: selectedCuisine,
        limitation: selectedLimitation,
        level: selectedDifficulty,
        priceMin: parseFloat(priceMin),
        priceMax: parseFloat(priceMax),
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

  /** ────────────────────  ADD TO SHOPPING LIST  ─────────────────── */
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
    } catch (err) {
      console.error("add-to-list error:", err);
      Alert.alert("Error", "Could not add dish to shopping list.");
    }
  };

  /** ─────────────────────────  RENDER  ───────────────────────── */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <Text style={styles.headerText}>Search Dishes</Text>

      {/* PRICE RANGE */}
      <Text style={styles.filterLabel}>Price Range:</Text>
      <View style={styles.priceInputContainer}>
        <TextInput
          style={styles.priceInput}
          keyboardType="numeric"
          value={priceMin}
          onChangeText={setPriceMin}
          placeholder="Min"
        />
        <Text style={styles.toText}>to</Text>
        <TextInput
          style={styles.priceInput}
          keyboardType="numeric"
          value={priceMax}
          onChangeText={setPriceMax}
          placeholder="Max"
        />
      </View>

      {/* CUISINE */}
      <Text style={styles.filterLabel}>Cuisine:</Text>
      <View style={styles.selectionContainer}>
        {CUISINES.map((cuisine) => (
          <TouchableOpacity
            key={cuisine}
            style={[
              styles.optionButton,
              selectedCuisine === cuisine && styles.optionButtonSelected,
            ]}
            onPress={() => setSelectedCuisine(cuisine)}
          >
            <Text
              style={[
                styles.optionText,
                selectedCuisine === cuisine && styles.optionTextSelected,
              ]}
            >
              {cuisine}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIMITATION */}
      <Text style={styles.filterLabel}>Dietary Limitations:</Text>
      <View style={styles.selectionContainer}>
        {LIMITATIONS.map((limit) => (
          <TouchableOpacity
            key={limit}
            style={[
              styles.optionButton,
              selectedLimitation === limit && styles.optionButtonSelected,
            ]}
            onPress={() => setSelectedLimitation(limit)}
          >
            <Text
              style={[
                styles.optionText,
                selectedLimitation === limit && styles.optionTextSelected,
              ]}
            >
              {limit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DIFFICULTY */}
      <Text style={styles.filterLabel}>Difficulty Level:</Text>
      <View style={styles.selectionContainer}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.optionButton,
              selectedDifficulty === level && styles.optionButtonSelected,
            ]}
            onPress={() => setSelectedDifficulty(level)}
          >
            <Text
              style={[
                styles.optionText,
                selectedDifficulty === level && styles.optionTextSelected,
              ]}
            >
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SEARCH BUTTON */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>

      {/* LOADING */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#1E3A8A"
          style={{ marginTop: 20 }}
        />
      )}

      {/* RESULTS */}
      <View style={{ marginTop: 30 }}>
        {results.map((dish) => (
          <View key={dish._id} style={styles.trendingRecipe}>
            <Image
              source={
                dish.imageUrl ? { uri: dish.imageUrl } : dishPlaceholder
              }
              style={styles.recipeImage}
            />

            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{dish.name}</Text>
              <Text style={styles.recipeDesc}>
                {dish.details || "No details available"}
              </Text>

              <View style={styles.recipeDetails}>
                <Text style={styles.recipeTime}>{dish.level}</Text>
                <Text style={styles.recipeRating}>
                  Calories: {dish.dishCalories}
                </Text>
              </View>

              <View style={styles.recipeDetails}>
                <Text style={styles.recipeCuisine}>
                  Cuisine: {dish.cuisine}
                </Text>
              </View>

              <View style={styles.recipeDetails}>
                <Text style={styles.recipeLimitation}>
                  Limitation: {dish.limitation}
                </Text>
              </View>

              <View style={styles.recipeDetails}>
                <Text style={styles.recipePrice}>Price: ${dish.price}</Text>
              </View>

              {/* quick action icons */}
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("DishDetail", { dishId: dish._id })
                  }
                >
                  <Icon
                    name="information"
                    size={24}
                    color="#1E3A8A"
                    style={styles.icon}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAddToShoppingList(dish._id)}
                >
                  <Icon
                    name="clipboard-list"
                    size={24}
                    color="#1E3A8A"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

/* ─────────────────────────  STYLES  ───────────────────────── */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1F1F1F",
  },
  /* ───── filter controls ───── */
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  priceInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#1E3A8A",
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    width: "40%",
    textAlign: "center",
  },
  toText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  selectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  optionButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  optionButtonSelected: {
    backgroundColor: "#1E3A8A",
  },
  optionText: {
    color: "#1E3A8A",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  searchButton: {
    backgroundColor: "#1E3A8A",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  /* ───── result card (mirrors DishScreen) ───── */
  trendingRecipe: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  recipeImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
  },
  recipeInfo: {
    flex: 1,
    padding: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  recipeDesc: {
    fontSize: 12,
    color: "#777",
    marginVertical: 5,
  },
  recipeDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recipeTime: {
    fontSize: 12,
    color: "#555",
  },
  recipeRating: {
    fontSize: 12,
    color: "#F39C12",
  },
  recipeCuisine: {
    fontSize: 11,
    color: "#555",
  },
  recipeLimitation: {
    fontSize: 11,
    color: "#555",
  },
  recipePrice: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  iconContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  icon: {
    marginRight: 15,
  },
});

export default SearchScreen;
