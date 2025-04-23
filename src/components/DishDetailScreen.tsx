import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Image, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getDishById } from "../services/dish_service";
import { Cuisine, Level, Limitation, IDish } from "../services/intefaces/dish";
import dishImage from '../assets/dish.png';

const DishDetailScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { dishId } = route.params; // Dish ID passed via navigation

    const [dish, setDish] = useState<IDish | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch dish details on component mount
    useEffect(() => {
        const fetchDishDetails = async () => {
            try {
                const { request, abort } = getDishById(dishId);
                const response = await request;
                const fetchedDish: IDish = response.data;
                setDish(fetchedDish);
            } catch (error) {
                console.error("Failed to fetch dish details:", error);
                Alert.alert("Error", "Failed to fetch dish details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDishDetails();
    }, [dishId]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!dish) {
        return (
            <View style={styles.centered}>
                <Text>Dish not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{dish.name}</Text>

                {/* Dish Image */}
                <Image source={{ uri: dish.imageUrl }} style={styles.dishImage} />

                <View style={styles.detailSection}>
                    <Text style={styles.label}>Cuisine:</Text>
                    <Text style={styles.detail}>{dish.cuisine}</Text>

                    <Text style={styles.label}>Difficulty Level:</Text>
                    <Text style={styles.detail}>{dish.level}</Text>

                    <Text style={styles.label}>Limitation:</Text>
                    <Text style={styles.detail}>{dish.limitation}</Text>

                    <Text style={styles.label}>Price:</Text>
                    <Text style={styles.detail}>${dish.price}</Text>

                    <Text style={styles.label}>Calories:</Text>
                    <Text style={styles.detail}>{dish.dishCalories} kcal</Text>

                    <Text style={styles.label}>Ingredients Cost:</Text>
                    <Text style={styles.detail}>${dish.ingredientsCost}</Text>

                    <Text style={styles.label}>Average Dish Cost:</Text>
                    <Text style={styles.detail}>${dish.averageDishCost}</Text>

                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.detail}>{dish.details}</Text>
                </View>
            </ScrollView>
        </View>
    );
};

// Styles for DishDetailScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    scrollViewContent: {
        paddingBottom: 80, // Extra space for scroll
    },
    backButton: {
        position: "absolute",
        top: Platform.OS === "ios" ? 40 : 20, // Adjust position based on platform (iOS/Android)
        left: 20,
        padding: 12, // Round button padding
        backgroundColor: "#1E3A8A", // Button color
        borderRadius: 30, // Round shape
        zIndex: 1, // Ensure it's on top
    },
    headerText: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: Platform.OS === "ios" ? 80 : 60, // Adjust margin-top for back button
        marginBottom: 20,
    },
    dishImage: {
        width: "100%",
        height: 250,
        resizeMode: "cover",
        borderRadius: 10,
        marginBottom: 20,
    },
    noImageText: {
        textAlign: "center",
        fontSize: 16,
        color: "#555",
        marginBottom: 20,
    },
    detailSection: {
        marginTop: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    detail: {
        fontSize: 16,
        marginBottom: 15,
        color: "#333",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default DishDetailScreen;
