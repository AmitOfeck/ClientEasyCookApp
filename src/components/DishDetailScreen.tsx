import React, { useState, useEffect } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    Platform, ScrollView, Image, Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
    getDishById,
    healthifyDish,
    cheapifyDish
} from "../services/dish_service";
import { Cuisine, Level, Limitation, IDish } from "../services/intefaces/dish";
import dishImage from '../assets/dish.png';

const DishDetailScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { dishId } = route.params;
    const [dish, setDish] = useState<IDish | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchDishDetails = async () => {
            try {
                const { request } = getDishById(dishId);
                const response = await request;
                setDish(response.data);
            } catch (error) {
                Alert.alert("Error", "Failed to fetch dish details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDishDetails();
    }, [dishId]);

    const onHealthify = async () => {
        if (!dish) return;
        setProcessing(true);
        try {
            const { request } = healthifyDish(dish._id);
                       const response = await request;
                      console.log('Healthify response:', response.status, response.data);
                       setDish(response.data);
        } catch (error: any) {
            console.error('Healthify error:', 
                             error.response?.status, 
                             error.response?.data ?? error.message
                           );
                           Alert.alert("Error", `Failed to make dish healthier (${error.response?.status})`);
        } finally {
            setProcessing(false);
        }
    };

    const onCheapify = async () => {
        if (!dish) return;
        setProcessing(true);
        try {
            const { request } = cheapifyDish(dish._id);
            const response = await request;
            setDish(response.data);
        } catch {
            Alert.alert("Error", "Failed to make dish cheaper.");
        } finally {
            setProcessing(false);
        }
    };

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

    const isOriginal = dish.variantType === 'original';

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{dish.name}</Text>
                <Image
                    source={dish.imageUrl ? { uri: dish.imageUrl } : dishImage}
                    style={styles.dishImage}
                />
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
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            (!isOriginal || processing) && styles.disabledButton
                        ]}
                        disabled={!isOriginal || processing}
                        onPress={onHealthify}
                    >
                        <Text style={styles.buttonText}>
                            {processing && dish.variantType === 'original' ? '...' : 'Make Healthy'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            (!isOriginal || processing) && styles.disabledButton
                        ]}
                        disabled={!isOriginal || processing}
                        onPress={onCheapify}
                    >
                        <Text style={styles.buttonText}>
                            {processing && dish.variantType === 'original' ? '...' : 'Make Cheap'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    scrollViewContent: { paddingBottom: 80 },
    backButton: {
        position: "absolute",
        top: Platform.OS === "ios" ? 40 : 20,
        left: 20,
        padding: 12,
        backgroundColor: "#1E3A8A",
        borderRadius: 30,
        zIndex: 1,
    },
    headerText: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: Platform.OS === "ios" ? 80 : 60,
        marginBottom: 20,
    },
    dishImage: { width: "100%", height: 250, resizeMode: "cover", borderRadius: 10, marginBottom: 20 },
    detailSection: { marginTop: 20 },
    label: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
    detail: { fontSize: 16, marginBottom: 15, color: "#333" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    buttonContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 12,
        backgroundColor: "#1E3A8A",
        borderRadius: 8,
        alignItems: "center",
    },
    disabledButton: { backgroundColor: "#ccc" },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default DishDetailScreen;
