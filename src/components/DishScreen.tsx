import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getDishes } from "../services/dish_service";
import { IDish } from "../services/intefaces/dish";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDishesToShoppingList } from "../services/shopping_list_service";
import { DishCard } from "../components/DishCard";

const { width, height } = Dimensions.get("window");
const CARD_MAX_WIDTH = 440;
const MIN_PRICE = 0, MAX_PRICE = 62;

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

const DishScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [selectedLimitation, setSelectedLimitation] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);

  const [loading, setLoading] = useState(true);

  const [originalDishes, setOriginalDishes] = useState<IDish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<IDish[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchAllDishes = async () => {
        setLoading(true);
        handleClearFilters(false);

        const { request } = getDishes({});
        try {
          const response = await request;
          const sortedDishes = response.data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setOriginalDishes(sortedDishes);
          setFilteredDishes(sortedDishes);
        } catch (error) {
          console.error("Error fetching dishes:", error);
          Alert.alert("Error", "Could not fetch dishes from the server.");
        } finally {
          setLoading(false);
        }
      };

      fetchAllDishes();
    }, [])
  );

  const handleAddToShoppingList = async (dishId: string) => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        Alert.alert("Error", "Authentication token missing.");
        return;
      }
      const { request } = addDishesToShoppingList([dishId], accessToken);
      await request;
      Alert.alert("Success", "Dish added to your shopping list!");
    } catch (error) {
      console.error("Failed to add to shopping list:", error);
      Alert.alert("Error", "Could not add dish to shopping list.");
    }
  };

  const handleSearch = () => {
    let results = [...originalDishes];

    if (selectedCuisine) {
      results = results.filter((dish) => dish.cuisine === selectedCuisine);
    }
    if (selectedLimitation) {
      results = results.filter((dish) => dish.limitation === selectedLimitation);
    }
    if (selectedDifficulty) {
      results = results.filter((dish) => dish.level === selectedDifficulty);
    }
    const [min, max] = priceRange;
    results = results.filter((dish) => dish.price >= min && dish.price <= max);

    setFilteredDishes(results);
    setShowFilters(false);
  };

  const handleClearFilters = (closeFilterView = true) => {
    setSelectedCuisine("");
    setSelectedLimitation("");
    setSelectedDifficulty("");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setFilteredDishes(originalDishes);
    if (closeFilterView) {
      setShowFilters(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.searchHeader}>
        <View style={styles.headerIconBox}>
          <Icon name="silverware-fork-knife" size={28} color="#fff" />
        </View>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.headerTitle}>Explore Our Dishes</Text>
          <Text style={styles.headerSubtitle}>
            Browse & filter tasty recipes
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="tune-variant" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Dishes</Text>

      {/* --- FILTER MODAL --- */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
              bounces
            >
              {/* Slider price */}
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.sliderContainer}>
                <MultiSlider
                  values={priceRange}
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1}
                  sliderLength={width * 0.7}
                  onValuesChange={(vals) => setPriceRange([vals[0], vals[1]])}
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

              {/* Actions */}
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Text style={styles.searchButtonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.searchButton, styles.clearButton]}
                onPress={() => handleClearFilters(true)}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- MAIN CONTENT --- */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 48 }} />
        ) : (
          <>
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <DishCard
                  key={dish._id}
                  dish={dish}
                  onInfoPress={() =>
                    navigation.navigate("DishDetail", { dishId: dish._id })
                  }
                  onAddPress={() => handleAddToShoppingList(dish._id)}
                />
              ))
            ) : (
              <Text style={styles.noResultsText}>
                No dishes match your criteria. Try clearing the filters.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

/* --- styles --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4f0fd",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 25,
    marginTop: Platform.OS === "ios" ? 18 : 10,
    marginBottom: 6,
    padding: 13,
    width: width * 0.93,
    minHeight: 64,
    alignSelf: "center",
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
    fontSize: 17.5,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: "#6487b0",
    fontWeight: "500",
    opacity: 0.8,
    marginLeft: 1,
    marginTop: 1,
  },
  filterButton: {
    backgroundColor: "#eaf3ff",
    borderRadius: 24,
    padding: 9,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 7,
    alignSelf: "center",
    marginTop: 3,
  },
  // FILTER MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "#1117",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: width * 0.98,
    minHeight: height * 0.54,
    maxHeight: height * 0.85,
    alignSelf: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 14,
    marginBottom: 4,
    paddingTop: 18,
    paddingHorizontal: 11,
    paddingBottom: 10,
  },
  modalContent: {
    paddingBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#415c78",
    marginTop: 9,
    marginBottom: 2,
    opacity: 0.82,
    alignSelf: "flex-start",
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
  gridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
    marginVertical: 2,
    gap: 6,
  },
  gridMiniButton: {
    flexBasis: "28%",
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
  clearButton: {
    backgroundColor: "#fbe4e4",
    borderColor: "#e54349",
    marginTop: 0,
  },
  clearButtonText: {
    color: "#e54349",
    fontWeight: "700",
    fontSize: 15.5,
    letterSpacing: 0.11,
    textAlign: "center",
  },
  scrollViewContent: {
    paddingTop: 2,
    paddingHorizontal: 9,
    paddingBottom: 20,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 70,
    fontSize: 16,
    color: "#6c757d",
  },
});

export default DishScreen;
