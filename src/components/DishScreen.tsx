import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
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
import { deleteDish, getDishes } from "../services/dish_service";
import { IDish } from "../services/intefaces/dish";
import dishImage from '../assets/dish.png';

const cuisines = ["Italian", "Asian", "French", "Indian", "Arabic", "Spanish"];
const limitations = ["Kosher", "Gluten Free", "Vegetarian", "Vegan"];
const difficultyLevels = ["Easy", "Medium", "Expert", "Chef"];

const DishScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCuisine, setSelectedCuisine] = useState("");
    const [selectedLimitation, setSelectedLimitation] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [priceMin, setPriceMin] = useState("5");
    const [priceMax, setPriceMax] = useState("20");
    const [loading, setLoading] = useState(false);
    const [dishes, setDishes] = useState<IDish[]>([]);

    useFocusEffect(
        useCallback(() => {
            const fetchDishes = async () => {
                setLoading(true);
                const { request, abort } = getDishes({
                    cuisine: selectedCuisine,
                    limitation: selectedLimitation,
                    difficulty: selectedDifficulty,
                    priceMin,
                    priceMax,
                });

                try {
                    const response = await request;
                    setDishes(response.data);
                } catch (error) {
                    console.error("Error fetching dishes:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchDishes();

            return () => {
                // Cleanup function if needed
            };
        }, [selectedCuisine, selectedLimitation, selectedDifficulty, priceMin, priceMax])
    );

    const handleDeleteDish = async (dishId: string) => {
        try {
            const { request, abort } = deleteDish(dishId);
            const response = await request;
            
            console.log("Dish deleted successfully:", response.data);
            // Reload dishes or update state
            Alert.alert("Success", "Dish deleted successfully!");
            setDishes(prevDishes => prevDishes.filter(dish => dish._id !== dishId));
        } catch (error) {
            console.error("Failed to delete dish:", error);
            Alert.alert("Error", "Failed to delete the dish. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 80 }]}>
                {/* HEADER */}
                <Text style={styles.headerText}>Hi! Dianne</Text>
                <Text style={styles.subHeaderText}>What are you cooking today</Text>

                {/* FILTER BUTTON */}
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
                    <Icon name="filter" size={20} color="white" />
                </TouchableOpacity>

                {/* FILTER SECTION */}
                {showFilters && (
                    <View style={styles.filterSection}>
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
                            {cuisines.map((cuisine) => (
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
                            {limitations.map((limit) => (
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
                            {difficultyLevels.map((level) => (
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
                        <TouchableOpacity style={styles.searchButton}>
                            <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!showFilters && (
                    <>
                        <TouchableOpacity
                            style={styles.createDishButton}
                            onPress={() => navigation.navigate("DishCreate")}
                        >
                            <Text style={styles.createDishButtonText}>Create Dish</Text>
                        </TouchableOpacity><View>
                            {/* CATEGORY TABS */}
                            {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {["Discover", "Recommended", "Easy", "Vegan"].map((tab, index) => (
            <TouchableOpacity key={index} style={styles.tab}>
                <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
        ))}
    </ScrollView> */}

                            {loading ? (
                                <ActivityIndicator size="large" color="#1E3A8A" style={styles.loadingIndicator} />
                            ) : (
                                <View>
                                    <Text style={styles.sectionTitle}>Dishes</Text>
                                    <View>
                                        {dishes.map((dish) => (
                                            <View key={dish._id} style={styles.trendingRecipe}>
                                                <Image source={dishImage} style={styles.recipeImage} />
                                                <View style={styles.recipeInfo}>
                                                    {/* Dish Name */}
                                                    <Text style={styles.recipeTitle}>{dish.name}</Text>

                                                    {/* Dish Details */}
                                                    <Text style={styles.recipeDesc}>{dish.details || "No details available"}</Text>

                                                    <View style={styles.recipeDetails}>
                                                        {/* Dish Level (difficulty) */}
                                                        <Text style={styles.recipeTime}>{dish.level}</Text>

                                                        {/* Calories */}
                                                        <Text style={styles.recipeRating}>Calories: {dish.dishCalories}</Text>
                                                    </View>

                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipeCuisine}>Cuisine: {dish.cuisine}</Text>

                                                    </View>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipeLimitation}>Limitation: {dish.limitation}</Text>
                                                    </View>

                                                    <View style={styles.recipeDetails}>
                                                        {/* Ingredients Cost */}
                                                        <Text style={styles.recipeCost}>Ingredients Cost: ${dish.ingredientsCost}</Text>
                                                    </View>
                                                    <View style={styles.recipeDetails}>

                                                        <Text style={styles.recipeCost}>Average Cost: ${dish.averageDishCost}</Text>
                                                    </View>
                                                    <View style={styles.recipeDetails}>
                                                        <Text style={styles.recipePrice}>Price: ${dish.price}</Text>
                                                    </View>

                                                    <View style={styles.iconContainer}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("DishUpdate", { dishId: dish._id })}
                            >
                                <Icon name="pencil" size={24} color="#1E3A8A" style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => navigation.navigate("DishDetail", { dishId: dish._id })}
                            >
                                <Icon name="information" size={24} color="#1E3A8A" style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleDeleteDish(dish._id)}
                            >
                                <Icon name="delete" size={24} color="red" style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                                                </View>
                                            </View>

                                        ))}
                                    </View>
                                </View>
                            )}
                        </View></>
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
        right: 10,
        top: 10,
    },
    filterButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    filterSection: {
        backgroundColor: "#F8F9FB",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
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
        backgroundColor: "white",
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
        padding: 12,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 15,
    },
    searchButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 20,
    },
    tab: {
        backgroundColor: "#1E3A8A",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    tabText: {
        color: "white",
        fontWeight: "bold",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1F1F1F",
    },
    trendingRecipe: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
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
    recipeGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    recipeCard: {
        backgroundColor: "#F8F9FB",
        borderRadius: 15,
        width: "48%",
        paddingBottom: 10,
        alignItems: "center",
    },
    recipeCardImage: {
        width: "100%",
        height: 120,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    recipeCardTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 5,
    },
    recipeCardTime: {
        fontSize: 12,
        color: "#777",
    },
    loadingIndicator: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recipeCardDetails: {
        fontSize: 12,
        color: "#555", // A softer color for the text
        marginTop: 5,
        fontStyle: "italic", // Optional, gives it a bit of emphasis
    },
    recipeCardCalories: {
        fontSize: 12,
        color: "#777", // Lighter color for a less dominant detail
        fontWeight: "bold", // Make it stand out a bit
        marginTop: 5, // Space between the other text elements
    },
    createDishButton: {
        backgroundColor: "#1E3A8A",
        paddingVertical: 10,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 15,
        marginBottom: 20,
    },
    createDishButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    recipeCuisine: {
        fontSize: 11,
        color: '#555',
    },
    recipeLimitation: {
        fontSize: 11,
        color: '#555',
    },
    recipeCost: {
        fontSize: 11,
        color: '#555',
    },
    recipePrice: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2E8B57', // Price highlighted in green
    },
    iconContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    icon: {
        marginRight: 15,
    },
});

export default DishScreen;
