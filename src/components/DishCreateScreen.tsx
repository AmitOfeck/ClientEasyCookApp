import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RNPickerSelect from "react-native-picker-select"; // Import Picker
import { createDish } from "../services/dish_service";
import { Cuisine, Level, Limitation } from "../services/intefaces/dish";

const DishCreateScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [dishName, setDishName] = useState("");
    const [dishPrice, setDishPrice] = useState("");
    const [dishCuisine, setDishCuisine] = useState<string | null>(null); // Updated to handle null
    const [dishLimitation, setDishLimitation] = useState<string | null>(null); // Updated to handle null
    const [dishDifficulty, setDishDifficulty] = useState<string | null>(null); // Updated to handle null
    const [dishDescription, setDishDescription] = useState("");
    const [dishCalories, setDishCalories] = useState("");
    const [ingredientsCost, setIngredientsCost] = useState("");
    const [averageDishCost, setAverageDishCost] = useState("");
    const [recipe, setRecipe] = useState("");

    // Validation function for required fields
    const validateFields = () => {
        if (
            !dishName ||
            !dishPrice ||
            !dishCuisine ||
            !dishLimitation ||
            !dishDifficulty ||
            !dishDescription ||
            !dishCalories ||
            !ingredientsCost || 
            !averageDishCost ||
            !recipe
        ) {
            Alert.alert("Validation Error", "All fields are required!");
            return false;
        }
        return true;
    };

    const handleCreateDish = async () => {
        if (!validateFields()) return;
    
        const price = parseFloat(dishPrice);
        const calories = parseFloat(dishCalories);
        const iCost = parseFloat(ingredientsCost);
        const aCost = parseFloat(averageDishCost);
    
        if (isNaN(price)) {
            Alert.alert("Validation Error", "Please enter a valid numeric price.");
            return;
        }

        if (isNaN(calories)) {
            Alert.alert("Validation Error", "Please enter a valid numeric calories.");
            return;
        }
        if (isNaN(iCost)) {
            Alert.alert("Validation Error", "Please enter a valid numeric Cost.");
            return;
        }
        if (isNaN(aCost)) {
            Alert.alert("Validation Error", "Please enter a valid numeric Cost.");
            return;
        }
    
        try {
            const dishData = {
                name: dishName,
                price: price,
                cuisine: dishCuisine as Cuisine,
                limitation: dishLimitation as Limitation,
                level: dishDifficulty as Level,
                details: dishDescription,
                recipe: recipe,
                dishCalories: calories, 
                ingredientsCost: iCost,
                averageDishCost: aCost,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
    
            const { request, abort } = createDish(dishData);
            const response = await request;
    
            console.log("Dish created successfully:", response.data);
            Alert.alert("Success", "Dish created successfully!");
            navigation.navigate("Dish");
            // navigation.goBack();
        } catch (error) {
            console.error("Failed to create dish:", error);
            Alert.alert("Error", "Failed to create the dish. Please try again.");
        }
    };
    

    // Options for dropdowns
    const cuisineOptions = Object.values(Cuisine).map((cuisine) => ({
        label: cuisine,
        value: cuisine,
    }));

    const limitationOptions = Object.values(Limitation).map((limitation) => ({
        label: limitation,
        value: limitation,
    }));

    const difficultyOptions = Object.values(Level).map((level) => ({
        label: level,
        value: level,
    }));

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 80 }]}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerText}>Create New Dish</Text>

            <TextInput
                style={styles.input}
                placeholder="Dish Name"
                value={dishName}
                onChangeText={setDishName}
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={dishPrice}
                onChangeText={setDishPrice}
            />

            <TextInput
                style={styles.input}
                placeholder="Recipe"
                value={recipe}
                onChangeText={setRecipe}
            />

            {/* Cuisine Dropdown */}
            <RNPickerSelect
                style={pickerSelectStyles}
                placeholder={{ label: "Select Cuisine", value: null }}
                value={dishCuisine}
                onValueChange={setDishCuisine}
                items={cuisineOptions}
            />

            {/* Dietary Limitation Dropdown */}
            <RNPickerSelect
                style={pickerSelectStyles}
                placeholder={{ label: "Select Dietary Limitation", value: null }}
                value={dishLimitation}
                onValueChange={setDishLimitation}
                items={limitationOptions}
            />

            {/* Difficulty Level Dropdown */}
            <RNPickerSelect
                style={pickerSelectStyles}
                placeholder={{ label: "Select Difficulty Level", value: null }}
                value={dishDifficulty}
                onValueChange={setDishDifficulty}
                items={difficultyOptions}
            />

            <TextInput
                style={styles.input}
                placeholder="Dish Calories"
                keyboardType="numeric"
                value={dishCalories}
                onChangeText={setDishCalories}
            />

            <TextInput
                style={styles.input}
                placeholder="Ingredients Cost"
                keyboardType="numeric"
                value={ingredientsCost}
                onChangeText={setIngredientsCost}
            />

            <TextInput
                style={styles.input}
                placeholder="Average Dish Cost"
                keyboardType="numeric"
                value={averageDishCost}
                onChangeText={setAverageDishCost}
            />

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={dishDescription}
                onChangeText={setDishDescription}
                multiline={true}
                numberOfLines={4} // Adjust based on needs
                textAlignVertical="top" // Ensures text starts at the top
            />


            <TouchableOpacity style={styles.createButton} onPress={handleCreateDish}>
                <Text style={styles.createButtonText}>Create Dish</Text>
            </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// Styles for Picker and other components
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        height: 50,
        paddingLeft: 10,
        borderWidth: 2, // Increased border width for better visibility
        borderColor: "#000", // Black border
        marginBottom: 15,
        borderRadius: 5,
        backgroundColor: "white",
        color: "#000", // Black text color
    },
    inputAndroid: {
        height: 50,
        paddingLeft: 10,
        borderWidth: 2,
        borderColor: "#000",
        marginBottom: 15,
        borderRadius: 5,
        backgroundColor: "white",
        color: "#000", // Black text color
    },
    placeholder: {
        color: "#555", // Dark gray placeholder for contrast
    },
});


// DishCreateScreen styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    scrollViewContent: {
        padding: 20,
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
        fontSize: 24,
        fontWeight: "bold",
        marginTop: Platform.OS === "ios" ? 80 : 60, // Adjust margin-top for back button
        marginBottom: 20,
        textAlign: "center", // Center header text
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 10,
        borderRadius: 5,
    },
    createButton: {
        backgroundColor: "#1E3A8A",
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: "center",
        marginTop: 20,
    },
    createButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    textArea: {
        height: 120, // Set height for textarea effect
        borderWidth: 1, // Ensure border is visible
        borderColor: "#000", // Set border color to black
        padding: 10, // Add padding inside textarea
        borderRadius: 5, // Match input styling
        backgroundColor: "white", // Ensure contrast
    },
});

export default DishCreateScreen;
