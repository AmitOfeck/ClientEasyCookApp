import React, { useEffect, useState, useCallback } from "react";
// --- NEW: We import useFocusEffect to refetch data every time the screen is visited ---
import { useFocusEffect } from "@react-navigation/native";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDishes } from "../services/dish_service";
import { IDish } from "../services/intefaces/dish";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDishesToShoppingList } from '../services/shopping_list_service';

const cuisines = ["ITALIAN", "CHINESE", "INDIAN", "MEXICAN"];
const limitations = ["VEGETARIAN", "VEGAN", "GLUTEN_FREE"];
const difficultyLevels = ["EASY", "MEDIUM", "HARD"];

const DishScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [showFilters, setShowFilters] = useState(false);
    
    const [selectedCuisine, setSelectedCuisine] = useState("");
    const [selectedLimitation, setSelectedLimitation] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    
    const [loading, setLoading] = useState(true);

    const [originalDishes, setOriginalDishes] = useState<IDish[]>([]);
    const [filteredDishes, setFilteredDishes] = useState<IDish[]>([]);

    // --- MODIFIED: Replaced useEffect with useFocusEffect ---
    // This hook runs every time the user navigates to this screen, ensuring the data is always fresh.
    useFocusEffect(
        useCallback(() => {
            const fetchAllDishes = async () => {
                setLoading(true);
                // The filter state is reset here to ensure the fresh list is not immediately filtered by old selections.
                handleClearFilters(false); // We pass `false` to avoid hiding the filter view if it's open.
                
                const { request } = getDishes({}); 
                try {
                    const response = await request;

                    // The sorting logic remains the same.
                    const sortedDishes = response.data.sort((a, b) => 
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
        }, []) // The empty dependency array for useCallback is correct and intended.
    );

    const handleAddToShoppingList = async (dishId: string) => {
        try {
          const accessToken = await AsyncStorage.getItem('accessToken');
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
            results = results.filter(dish => dish.cuisine === selectedCuisine);
        }
        if (selectedLimitation) {
            results = results.filter(dish => dish.limitation === selectedLimitation);
        }
        if (selectedDifficulty) {
            results = results.filter(dish => dish.level === selectedDifficulty);
        }
        const min = parseFloat(priceMin);
        if (!isNaN(min)) {
            results = results.filter(dish => dish.price >= min);
        }
        const max = parseFloat(priceMax);
        if (!isNaN(max)) {
            results = results.filter(dish => dish.price <= max);
        }

        setFilteredDishes(results);
        setShowFilters(false); 
    };

    // --- MODIFIED: Added an optional parameter to control closing the filter view ---
    const handleClearFilters = (closeFilterView = true) => {
        setSelectedCuisine("");
        setSelectedLimitation("");
        setSelectedDifficulty("");
        setPriceMin("");
        setPriceMax("");
        setFilteredDishes(originalDishes);
        if (closeFilterView) {
            setShowFilters(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.headerText}>Hi! Dianne</Text>
                <Text style={styles.subHeaderText}>What are you cooking today</Text>

                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                    <Icon name="filter" size={20} color="white" />
                </TouchableOpacity>

                {showFilters && (
                    <View style={styles.filterSection}>
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
                        
                        <Text style={styles.filterLabel}>Cuisine:</Text>
                        <View style={styles.selectionContainer}>
                            {cuisines.map((cuisine) => (
                                <TouchableOpacity
                                    key={cuisine}
                                    style={[styles.optionButton, selectedCuisine === cuisine && styles.optionButtonSelected]}
                                    onPress={() => setSelectedCuisine(cuisine === selectedCuisine ? "" : cuisine)}
                                >
                                    <Text style={[styles.optionText, selectedCuisine === cuisine && styles.optionTextSelected]}>{cuisine}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterLabel}>Dietary Limitations:</Text>
                        <View style={styles.selectionContainer}>
                            {limitations.map((limit) => (
                                <TouchableOpacity
                                    key={limit}
                                    style={[styles.optionButton, selectedLimitation === limit && styles.optionButtonSelected]}
                                    onPress={() => setSelectedLimitation(limit === selectedLimitation ? "" : limit)}
                                >
                                    <Text style={[styles.optionText, selectedLimitation === limit && styles.optionTextSelected]}>{limit}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.filterLabel}>Difficulty Level:</Text>
                        <View style={styles.selectionContainer}>
                            {difficultyLevels.map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[styles.optionButton, selectedDifficulty === level && styles.optionButtonSelected]}
                                    onPress={() => setSelectedDifficulty(level === selectedDifficulty ? "" : level)}
                                >
                                    <Text style={[styles.optionText, selectedDifficulty === level && styles.optionTextSelected]}>{level}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <View style={styles.filterActionsContainer}>
                            <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={() => handleClearFilters(true)}>
                                <Text style={styles.actionButtonText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={handleSearch}>
                                <Text style={styles.actionButtonText}>Search</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {!showFilters && (
                    <View>
                        {loading ? (
                            <ActivityIndicator size="large" color="#1E3A8A" style={styles.loadingIndicator} />
                        ) : (
                            <View>
                                <Text style={styles.sectionTitle}>Dishes</Text>
                                
                                {filteredDishes.length > 0 ? (
                                    <View>
                                        {filteredDishes.map((dish) => (
                                            <View key={dish._id} style={styles.trendingRecipe}>
                                                <Image source={{ uri: dish.imageUrl }} style={styles.recipeImage} />
                                                <View style={styles.recipeInfo}>
                                                    <Text style={styles.recipeTitle}>{dish.name}</Text>
                                                    <Text style={styles.recipeDesc} numberOfLines={2}>{dish.details || "No details available"}</Text>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipeTime}>{dish.level}</Text>
                                                        <Text style={styles.recipeRating}>Calories: {dish.dishCalories}</Text>
                                                    </View>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipeCuisine}>Cuisine: {dish.cuisine}</Text>
                                                    </View>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipeLimitation}>Limitation: {dish.limitation}</Text>
                                                    </View>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipeCost}>Ingredients Cost: ${dish.ingredientsCost}</Text>
                                                    </View>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipeCost}>Average Cost: ${dish.averageDishCost}</Text>
                                                    </View>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipePrice}>Price: ${dish.price}</Text>
                                                    </View>
                                                    <View style={styles.iconContainer}>
                                                        <TouchableOpacity onPress={() => navigation.navigate("DishDetail", { dishId: dish._id })}>
                                                            <Icon name="information" size={24} color="#1E3A8A" style={styles.icon} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleAddToShoppingList(dish._id)}>
                                                            <Icon name="clipboard-list" size={24} color="#1E3A8A" style={styles.icon} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={styles.noResultsText}>
                                        No dishes match your criteria. Try clearing the filters.
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollViewContent: {
        padding: 20,
        paddingBottom: 80,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1F1F1F",
    },
    subHeaderText: {
        fontSize: 16,
        color: "#555",
        marginBottom: 15,
    },
    filterButton: {
        backgroundColor: "#1E3A8A",
        padding: 10,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        position: "absolute",
        right: 20,
        top: 20,
        zIndex: 10,
    },
    filterSection: {
        backgroundColor: "#F8F9FB",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderColor: '#E0E0E0',
        borderWidth: 1,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    priceInput: {
        backgroundColor: "white",
        borderColor: "#B0B0B0",
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        flex: 1,
        textAlign: "center",
    },
    toText: {
        marginHorizontal: 10,
        fontSize: 16,
        color: '#555',
    },
    selectionContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 5,
    },
    optionButton: {
        backgroundColor: "#E9E9E9",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        margin: 4,
    },
    optionButtonSelected: {
        backgroundColor: "#1E3A8A",
    },
    optionText: {
        color: "#333",
    },
    optionTextSelected: {
        color: "#FFFFFF",
    },
    filterActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginHorizontal: 5,
        backgroundColor: "#1E3A8A",
    },
    clearButton: {
        backgroundColor: '#6c757d',
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#1F1F1F",
    },
    trendingRecipe: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    recipeImage: {
        width: 120,
        height: '100%',
    },
    recipeInfo: {
        flex: 1,
        padding: 15,
        justifyContent: 'center',
    },
    recipeTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    recipeDesc: {
        fontSize: 14,
        color: "#777",
        marginVertical: 5,
    },
    recipeDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 3,
    },
    recipeTime: {
        fontSize: 12,
        color: "#555",
    },
    recipeRating: {
        fontSize: 12,
        color: "#555",
    },
    recipeCuisine: {
        fontSize: 12,
        color: '#555',
    },
    recipeLimitation: {
        fontSize: 12,
        color: '#555',
    },
    recipeCost: {
        fontSize: 12,
        color: '#555',
    },
    recipePrice: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#2E8B57',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    iconContainer: {
        flexDirection: "row",
        marginTop: 15,
    },
    icon: {
        marginRight: 20,
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#6c757d',
    },
});

export default DishScreen;
