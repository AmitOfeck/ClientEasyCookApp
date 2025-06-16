import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { searchDish } from "../services/search_service";
import { IDish } from "../services/intefaces/dish";
import { addDishesToShoppingList } from "../services/shopping_list_service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DishCard } from "./DishCard";

const { width } = Dimensions.get('window');

const CUISINES = [
  { label: "Italian", value: "ITALIAN", emoji: "🍝" },
  { label: "Chinese", value: "CHINESE", emoji: "🥡" },
  { label: "Indian", value: "INDIAN", emoji: "🍛" },
  { label: "Mexican", value: "MEXICAN", emoji: "🌮" },
];
const LIMITATIONS = [
  { label: "Vegetarian", value: "VEGETARIAN", emoji: "🥗" },
  { label: "Vegan", value: "VEGAN", emoji: "🥕" },
  { label: "Gluten Free", value: "GLUTEN_FREE", emoji: "🌾" },
];
const LEVELS = [
  { label: "Easy", value: "EASY", emoji: "🟢" },
  { label: "Medium", value: "MEDIUM", emoji: "🟠" },
  { label: "Hard", value: "HARD", emoji: "🔴" },
];

const MIN_PRICE = 0, MAX_PRICE = 62;

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedLimitation, setSelectedLimitation] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IDish[]>([]);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<any>(null);

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
    } catch (err) {
      console.error("add-to-list error:", err);
      Alert.alert("Error", "Could not add dish to shopping list.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollView,
        { paddingBottom: 90 }
      ]}
    >
      {/* --- Header --- */}
      <View style={styles.searchHeader}>
        <View style={styles.headerIconBox}>
          <Icon name="magnify" size={30} color="#fff" />
        </View>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.headerTitle}>What would you like to eat today?</Text>
          <Text style={styles.headerSubtitle}>
            Discover amazing dishes tailored for you
          </Text>
        </View>
      </View>

      {/* --- Filters Section --- */}
      <View style={styles.card}>
        {/* Price Range */}
        <Text style={styles.filterLabel}>Price Range</Text>
        <View style={styles.sliderContainer}>
          <MultiSlider
            values={priceRange}
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={1}
            sliderLength={width * 0.7}
            onValuesChange={setPriceRange}
            selectedStyle={{ backgroundColor: "#2563eb" }}
            markerStyle={styles.sliderMarker}
            pressedMarkerStyle={styles.sliderMarkerActive}
            trackStyle={{ height: 5, borderRadius: 3 }}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>₪{priceRange[0]}</Text>
            <Text style={styles.sliderLabel}>₪{priceRange[1]}</Text>
          </View>
        </View>
        {/* Cuisine */}
        <Text style={styles.filterLabel}>Cuisine</Text>
        <View style={styles.gridCompact}>
          {CUISINES.map(({ label, value, emoji }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.gridMiniButton,
                selectedCuisine === value && styles.gridMiniButtonSelected,
              ]}
              onPress={() =>
                setSelectedCuisine(selectedCuisine === value ? "" : value)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.emojiSmall}>{emoji}</Text>
              <Text
                style={[
                  styles.gridMiniButtonText,
                  selectedCuisine === value && styles.gridMiniButtonTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Limitations */}
        <Text style={styles.filterLabel}>Dietary Limitations</Text>
        <View style={styles.gridCompact}>
          {LIMITATIONS.map(({ label, value, emoji }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.gridMiniButton,
                selectedLimitation === value && styles.gridMiniButtonSelected,
              ]}
              onPress={() =>
                setSelectedLimitation(selectedLimitation === value ? "" : value)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.emojiSmall}>{emoji}</Text>
              <Text
                style={[
                  styles.gridMiniButtonText,
                  selectedLimitation === value && styles.gridMiniButtonTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Difficulty */}
        <Text style={styles.filterLabel}>Difficulty Level</Text>
        <View style={styles.gridCompact}>
          {LEVELS.map(({ label, value, emoji }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.gridMiniButton,
                selectedDifficulty === value && styles.gridMiniButtonSelected,
              ]}
              onPress={() =>
                setSelectedDifficulty(selectedDifficulty === value ? "" : value)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.emojiSmall}>{emoji}</Text>
              <Text
                style={[
                  styles.gridMiniButtonText,
                  selectedDifficulty === value && styles.gridMiniButtonTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* חיפוש */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={{ alignItems: "center", marginTop: 18 }}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Text style={{ fontSize: 48 }}>🍽️</Text>
            {/* אפשר להחליף לאימוג'י אחר או אייקון */}
            {/* <Icon name="silverware-fork-knife" size={48} color="#2563eb" /> */}
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

      {/* תוצאות חיפוש */}
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

export default SearchScreen;

/* --- styles --- */
const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: "#e4f0fd",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 24 : 10,
    // paddingBottom: 24, // 
    minHeight: 700,
  },
  searchHeader: {
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
    fontSize: 12.5,
    color: "#6487b0",
    fontWeight: "500",
    opacity: 0.8,
    marginLeft: 1,
    marginTop: 1,
  },
  card: {
    width: "95%",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: 23,
    padding: 16,
    marginVertical: 7,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.11,
    shadowRadius: 15,
    elevation: 7,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 2,
    textAlign: "center",
  },
  sliderContainer: {
    alignItems: "center",
    width: "99%",
    marginVertical: 6,
  },
  sliderMarker: {
    backgroundColor: "#2563eb",
    height: 23,
    width: 23,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#2563eb",
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  sliderMarkerActive: {
    backgroundColor: "#1e3a8a",
    borderColor: "#a3bffa",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "92%",
    marginTop: 5,
    marginBottom: 2,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    opacity: 0.75,
    backgroundColor: "#eaf3ff",
    paddingHorizontal: 11,
    paddingVertical: 2,
    borderRadius: 13,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#415c78",
    marginTop: 5,
    marginBottom: 1,
    opacity: 0.82,
    alignSelf: "flex-start",
  },
  // גריד קומפקטי!
  gridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
    marginVertical: 2,
    gap: 6,
  },
  gridMiniButton: {
    flexBasis: "28%", // 3 בשורה במסכים צרים, 4 בגדולים
    minWidth: 95,
    backgroundColor: "#eaf3ff",
    paddingVertical: 10,
    borderRadius: 12,
    margin: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.1,
    borderColor: "#eaf3ff",
    elevation: 2,
    flexShrink: 1,
  },
  gridMiniButtonSelected: {
    backgroundColor: "#f6f8ff",
    borderColor: "#2563eb",
    shadowColor: "#2563eb44",
    shadowOpacity: 0.11,
    shadowRadius: 8,
  },
  emojiSmall: {
    fontSize: 20,
    marginBottom: 1,
  },
  gridMiniButtonText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13,
    marginTop: 0,
  },
  gridMiniButtonTextSelected: {
    color: "#e54349",
  },
  searchButton: {
    backgroundColor: "#e8f2ff",
    borderRadius: 19,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2186eb",
    marginTop: 12,
    marginBottom: 6,
    width: "93%",
    alignSelf: "center",
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
    letterSpacing: 0.11,
    textAlign: "center",
  },
  /* כרטיס מנה */
  dishCard: {
    flexDirection: "row",
    width: "97%",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: 23,
    marginBottom: 18,
    alignItems: "center",
    padding: 9,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 15,
    elevation: 7,
    alignSelf: "center",
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: "#f7fafd",
  },
  recipeInfo: {
    flex: 1,
    paddingRight: 2,
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 2,
  },
  recipeDesc: {
    fontSize: 12,
    color: "#6e7e97",
    marginBottom: 2,
  },
  recipeDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 1,
    flexWrap: "wrap",
  },
  recipeTag: {
    backgroundColor: "#e4f0fd",
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 9,
    marginRight: 4,
    marginTop: 1,
    opacity: 0.87,
  },
  recipePrice: {
    color: "#2dc44a",
    fontWeight: "bold",
    fontSize: 12,
    marginRight: 6,
  },
  recipeCalories: {
    fontSize: 10.5,
    color: "#a4791d",
    marginRight: 5,
  },
  iconContainer: {
    flexDirection: "row",
    marginTop: 6,
    gap: 7,
  },
  circleIcon: {
    backgroundColor: "#e4f0fd",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    shadowColor: "#bcd7f8",
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 1,
  },
});

