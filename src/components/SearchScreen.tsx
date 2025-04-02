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
} from "react-native";
import { searchDish } from "../services/search_service"; 
// ^ Same function you've been using in DishScreen

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedLimitation, setSelectedLimitation] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [priceMin, setPriceMin] = useState("5");
  const [priceMax, setPriceMax] = useState("20");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
      const response = await request;
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
      Alert.alert("Error", "Failed to fetch search results.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Search Screen</Text>

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

      {/* CUISINE SELECTION */}
      <Text style={styles.filterLabel}>Cuisine:</Text>
      <View style={styles.selectionContainer}>
        {["ITALIAN", "CHINESE", "INDIAN", "MEXICAN"].map((cuisine) => (
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

      {/* LIMITATION SELECTION */}
      <Text style={styles.filterLabel}>Dietary Limitations:</Text>
      <View style={styles.selectionContainer}>
        {["VEGETARIAN", "VEGAN", "GLUTEN_FREE"].map((limit) => (
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

      {/* DIFFICULTY LEVEL */}
      <Text style={styles.filterLabel}>Difficulty Level:</Text>
      <View style={styles.selectionContainer}>
        {["EASY", "MEDIUM", "HARD"].map((level) => (
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

      {/* LOADING INDICATOR */}
      {loading && <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 20 }} />}

      {/* RESULTS */}
      <View style={{ marginTop: 20 }}>
        {searchResults.map((dish, index) => (
          <View key={dish._id || index} style={styles.resultContainer}>
            <Text style={styles.resultName}>{dish.name}</Text>
            <Text style={styles.resultDetails}>
              Price: ${dish.price} | Cuisine: {dish.cuisine} | Level: {dish.level}
            </Text>
            <Text style={styles.resultDetails}>
              Limitation: {dish.limitation} | Calories: {dish.dishCalories}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  priceInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1E3A8A',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    width: '35%',
    textAlign: 'center',
  },
  toText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  selectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  optionButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  optionButtonSelected: {
    backgroundColor: '#1E3A8A',
  },
  optionText: {
    color: '#1E3A8A',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#1E3A8A',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#F8F9FB',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultDetails: {
    fontSize: 13,
    color: '#555',
    marginTop: 5,
  },
});

export default SearchScreen;
