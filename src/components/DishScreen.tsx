import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getDishes } from "../services/dish_service";
import { IDish } from "../services/intefaces/dish";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDishesToShoppingList } from "../services/shopping_list_service";
import { DishCard } from "../components/DishCard";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const { width } = Dimensions.get("window");
const MIN_PRICE = 0, MAX_PRICE = 500;

const CUISINES = [
  { value: "ITALIAN", label: "Italian", emoji: "🍝" },
  { value: "CHINESE", label: "Chinese", emoji: "🥡" },
  { value: "INDIAN", label: "Indian", emoji: "🍛" },
  { value: "MEXICAN", label: "Mexican", emoji: "🌮" },
];
const LIMITATIONS = [
  { value: "VEGETARIAN", label: "Vegetarian", emoji: "🥗" },
  { value: "VEGAN", label: "Vegan", emoji: "🥕" },
  { value: "GLUTEN_FREE", label: "Gluten Free", emoji: "🌾" },
];
const LEVELS = [
  { value: "EASY", label: "Easy", emoji: "🟢" },
  { value: "MEDIUM", label: "Medium", emoji: "🟠" },
  { value: "HARD", label: "Hard", emoji: "🔴" },
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
    results = results.filter(
      (dish) =>
        dish.price >= priceRange[0] &&
        dish.price <= priceRange[1]
    );
    setFilteredDishes(results);
    setShowFilters(false);
  };

  const handleClearFilters = (closeFilterView = true) => {
    setSelectedCuisine("");
    setSelectedLimitation("");
    setSelectedDifficulty("");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setFilteredDishes(originalDishes);
    if (closeFilterView) setShowFilters(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#e4f0fd" }}>
      {/* Header */}
      <View style={styles.searchHeader}>
        <View style={styles.headerIconBox}>
          <Icon name="silverware-fork-knife" size={30} color="#fff" />
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

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              <Text style={styles.filterTitle}>Filter Dishes</Text>
              {/* --- Price Range --- */}
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.sliderContainer}>
                <MultiSlider
                  values={priceRange}
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1}
                  sliderLength={width * 0.72}
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
              {/* --- Cuisine --- */}
              <Text style={styles.filterLabel}>Cuisine</Text>
              <View style={styles.gridCompact}>
                {CUISINES.map(({ value, label, emoji }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.gridMiniButton,
                      selectedCuisine === value && styles.gridMiniButtonSelected,
                    ]}
                    onPress={() =>
                      setSelectedCuisine(selectedCuisine === value ? "" : value)
                    }
                    activeOpacity={0.86}
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
              {/* --- Limitations --- */}
              <Text style={styles.filterLabel}>Dietary Limitations</Text>
              <View style={styles.gridCompact}>
                {LIMITATIONS.map(({ value, label, emoji }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.gridMiniButton,
                      selectedLimitation === value && styles.gridMiniButtonSelected,
                    ]}
                    onPress={() =>
                      setSelectedLimitation(selectedLimitation === value ? "" : value)
                    }
                    activeOpacity={0.86}
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
              {/* --- Difficulty --- */}
              <Text style={styles.filterLabel}>Difficulty</Text>
              <View style={styles.gridCompact}>
                {LEVELS.map(({ value, label, emoji }) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.gridMiniButton,
                      selectedDifficulty === value && styles.gridMiniButtonSelected,
                    ]}
                    onPress={() =>
                      setSelectedDifficulty(selectedDifficulty === value ? "" : value)
                    }
                    activeOpacity={0.86}
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
              {/* --- Actions --- */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.modernButton, styles.clearModern]}
                  onPress={() => handleClearFilters(true)}
                  activeOpacity={0.83}
                >
                  <Text style={[styles.modernButtonText, styles.clearModernText]}>
                    Clear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modernButton, styles.applyModern]}
                  onPress={handleSearch}
                  activeOpacity={0.83}
                >
                  <Text style={[styles.modernButtonText, styles.applyModernText]}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Main Content --- */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.sectionTitle}>Dishes</Text>
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

const styles = StyleSheet.create({
  // HEADER
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 23,
    marginTop: Platform.OS === "ios" ? 10 : 7,
    marginBottom: 13,
    padding: 14,
    width: width * 0.96,
    alignSelf: "center",
    minHeight: 59,
    shadowColor: "#2563eb33",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 11,
    elevation: 6,
  },
  headerIconBox: {
    backgroundColor: "#2563eb",
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 4,
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
  filterButton: {
    backgroundColor: "#eaf3ff",
    borderRadius: 25,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    shadowColor: "#2563eb33",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "#181f2c44",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 17,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    shadowColor: "#2563eb77",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.11,
    shadowRadius: 16,
    elevation: 17,
    maxHeight: "87%",
    minHeight: 375,
  },
  filterTitle: {
    fontSize: 19.7,
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: 11,
    alignSelf: "center",
    letterSpacing: 0.05,
  },
  filterLabel: {
    fontSize: 13.2,
    fontWeight: "700",
    color: "#415c78",
    marginTop: 8,
    marginBottom: 3,
    opacity: 0.81,
    alignSelf: "flex-start",
  },
  // SLIDER
  sliderContainer: {
    alignItems: "center",
    width: "100%",
    marginVertical: 3,
    marginBottom: 8,
  },
  sliderMarker: {
    backgroundColor: "#2563eb",
    height: 23,
    width: 23,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#2563eb",
    shadowOpacity: 0.13,
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
    width: "97%",
    marginTop: 3,
    marginBottom: 1,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    opacity: 0.80,
    backgroundColor: "#eaf3ff",
    paddingHorizontal: 13,
    paddingVertical: 2,
    borderRadius: 13,
  },
  // GRID BUTTONS
  gridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
    marginVertical: 4,
    gap: 9,
  },
  gridMiniButton: {
    flexBasis: "27%",
    minWidth: 95,
    backgroundColor: "#eaf3ff",
    paddingVertical: 13,
    borderRadius: 13,
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
    fontSize: 23,
    marginBottom: 2,
  },
  gridMiniButtonText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13.8,
    marginTop: 0,
  },
  gridMiniButtonTextSelected: {
    color: "#e54349",
  },
  // MODERN ACTION BUTTONS
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 14,
    marginTop: 17,
    marginBottom: 5,
  },
  modernButton: {
    flex: 1,
    height: 43,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.1,
    borderColor: '#d7e4fa',
    backgroundColor: "#f6f8ff",
  },
  clearModern: {
    backgroundColor: "#fff",
    borderColor: "#e99a96",
    shadowColor: "#e5434924",
  },
  applyModern: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  modernButtonText: {
    fontWeight: "700",
    fontSize: 16.1,
    letterSpacing: 0.02,
    color: "#2563eb",
  },
  clearModernText: {
    color: "#e54349",
  },
  applyModernText: {
    color: "#fff",
  },
  // MAIN CONTENT
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2363eb",
    alignSelf: "center",
    marginTop: 3,
  },
  scrollViewContent: {
    paddingTop: 10,
    paddingHorizontal: 9,
    paddingBottom: 80,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 70,
    fontSize: 16,
    color: "#6c757d",
  },
});

export default DishScreen;
