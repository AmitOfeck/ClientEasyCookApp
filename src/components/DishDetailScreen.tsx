import React, { useState, useEffect } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Image, Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getDishById,
    healthifyDish,
    cheapifyDish
} from "../services/dish_service";
import { addDishesToShoppingList } from "../services/shopping_list_service";
import dishImage from '../assets/dish.png';
import type { IDish } from "../services/intefaces/dish"; 
import { getFullImageUrl } from "../utils/getFullImageUrl";
import RecipeSteps from "../components/RecipeSteps"; 


// --- Pill (טיפוס פרופס) ---
type PillProps = {
    icon: string;
    color: string;
    text: string;
};
const Pill: React.FC<PillProps> = ({ icon, color, text }) => (
    <View style={[styles.pill, { backgroundColor: color + "22" }]}>
        <Icon name={icon} size={17} color={color} style={{ marginRight: 4 }} />
        <Text style={[styles.pillText, { color }]}>{text}</Text>
    </View>
);

const tabOptions = [
    { key: "details", label: "Details", icon: "information-outline" },
    { key: "ingredients", label: "Ingredients", icon: "food-apple-outline" },
    { key: "recipe", label: "Recipe", icon: "chef-hat" },
];

// --- Component ---
const DishDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
    const { dishId } = route.params;
    const [dish, setDish] = useState<IDish | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<"details" | "ingredients" | "recipe">("details");

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
            setDish(response.data);
        } catch (error) {
            Alert.alert("Error", "Failed to make dish healthier.");
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

    const handleAddToShoppingList = async () => {
        if (!dish) return;
        try {
            const accessToken = await AsyncStorage.getItem("accessToken");
            if (!accessToken) {
                Alert.alert("Error", "Authentication token missing.");
                return;
            }
            const { request } = addDishesToShoppingList([dish._id], accessToken);
            await request;
            Alert.alert("Success", "Dish added to your shopping list!");
        } catch (error) {
            console.error("Failed to add to shopping list:", error);
            Alert.alert("Error", "Could not add dish to shopping list.");
        }
    };

    if (loading) {
        return <View style={styles.centered}><Text>Loading...</Text></View>;
    }
    if (!dish) {
        return <View style={styles.centered}><Text>Dish not found</Text></View>;
    }
    const isOriginal = dish.variantType === 'original';

    // --- MAIN ---
    return (
        <View style={styles.bg}>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* תמונה */}
                <Image
                    source={dish.imageUrl ? { uri: getFullImageUrl(dish.imageUrl) } : dishImage}
                    style={styles.dishImage}
                />
                {/* שם מנה */}
                <Text style={styles.dishName}>{dish.name}</Text>

                {/* כרטיסיות TAB */}
                <View style={styles.tabsBar}>
                    {tabOptions.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabBtn,
                                activeTab === tab.key && styles.tabBtnActive
                            ]}
                            onPress={() => setActiveTab(tab.key as any)}
                        >
                            <Icon name={tab.icon} size={19} color={activeTab === tab.key ? "#2363eb" : "#b6bcd2"} />
                            <Text style={[
                                styles.tabBtnText,
                                activeTab === tab.key && { color: "#2363eb" }
                            ]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- תוכן הטאב --- */}
                <View style={styles.card}>
                    {activeTab === "details" && (
                        <View>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                                <Pill icon="cash" color="#2dc44a" text={`₪${dish.price} (est.)`} />
                                <Pill icon="fire" color="#ff9800" text={`${dish.dishCalories || "-"} kcal`} />
                                <Pill icon="food-variant" color="#2363eb" text={dish.cuisine} />
                                <Pill icon="flag-outline" color="#f98607" text={dish.level} />
                                <Pill icon="leaf" color="#67b136" text={dish.limitation} />
                            </View>
                            <Text style={styles.cardTitle}>Description</Text>
                            <Text style={styles.descText}>{dish.details}</Text>
                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.statLine}>Ingredients Cost: <Text style={styles.statVal}>₪{dish.ingredientsCost}</Text></Text>
                                <Text style={styles.statLine}>Average Dish Cost: <Text style={styles.statVal}>₪{dish.averageDishCost}</Text></Text>
                                <Text style={styles.statLine}>Variant: <Text style={styles.statVal}>{dish.variantType}</Text></Text>
                            </View>
                        </View>
                    )}
                    {activeTab === "ingredients" && (
                        <View>
                            <Text style={styles.cardTitle}>Ingredients</Text>
                            {dish.ingredients && dish.ingredients.length > 0 ? (
  dish.ingredients.map((ing: any, idx: number) => (
    <View key={idx} style={styles.ingredientRow}>
      <Icon name="circle-small" size={22} color="#ffd567" />
      <Text style={styles.ingredientText}>
        {/* תציג מידע בצורה ברורה */}
        {ing.name}
        {ing.quantity ? ` – ${ing.quantity}` : ""}
        {ing.unit ? ` ${ing.unit}` : ""}
        {ing.cost ? ` (₪${ing.cost})` : ""}
      </Text>
    </View>
  ))
) : (
  <Text style={styles.emptyText}>No ingredients listed.</Text>
)}
                        </View>
                    )}
                    {activeTab === "recipe" && (
                        <View>
                            <Text style={styles.cardTitle}>Recipe</Text>
                           <RecipeSteps text={dish.recipe || ""} />
                        </View>
                    )}
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={handleAddToShoppingList}
                    activeOpacity={0.85}
                >
                    <Icon name="cart-plus" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.addToCartButtonText}>Add to Shopping List</Text>
                </TouchableOpacity>

                {/* כפתורים שדרוג */}
                <View style={styles.variantsBar}>
                    <TouchableOpacity
                        style={[
                            styles.variantBtn,
                            (!isOriginal || processing) && styles.variantBtnDisabled
                        ]}
                        disabled={!isOriginal || processing}
                        onPress={onHealthify}
                    >
                        <Icon name="leaf" size={18} color="#4ba548" style={{ marginRight: 8 }} />
                        <Text style={styles.variantBtnText}>Healthier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.variantBtn,
                            (!isOriginal || processing) && styles.variantBtnDisabled
                        ]}
                        disabled={!isOriginal || processing}
                        onPress={onCheapify}
                    >
                        <Icon name="currency-ils" size={18} color="#26A9E0" style={{ marginRight: 8 }} />
                        <Text style={styles.variantBtnText}>Cheaper</Text>
                    </TouchableOpacity>
                </View>
                {!isOriginal && (
                    <Text style={styles.disabledMessageText}>
                        This recipe has already been modified and cannot be changed again.
                    </Text>
                )}
            </ScrollView>
        </View>
    );
};

export default DishDetailScreen;

// --- כל ה-styles שלך כאן ---
const styles = StyleSheet.create({
    // ... (העתק את החלק שלך, לא צריך לשנות)
    // ראה קוד קודם שלך, אין כאן שינוי מהותי
    // (כמובן השאר כאן את הstyles הנוכחיים שלך)
    bg: { flex: 1, backgroundColor: "#e4f0fd" },
    scrollContent: { padding: 19, paddingBottom: 70 },
    backButton: {
        position: "absolute", top: Platform.OS === "ios" ? 44 : 22, left: 17, zIndex: 1,
        backgroundColor: "#fff", padding: 7, borderRadius: 30, elevation: 5, shadowOpacity: 0.12,
    },
    dishImage: {
        width: "100%", height: 202, borderRadius: 18,
        marginTop: 16, marginBottom: 13, backgroundColor: "#f6f8ff"
    },
    dishName: { fontSize: 23, fontWeight: "700", color: "#2363eb", marginBottom: 13, textAlign: "center" },
    tabsBar: {
        flexDirection: "row",
        borderRadius: 14,
        backgroundColor: "#eaf3ff",
        alignSelf: "center",
        marginBottom: 13,
        marginTop: 0,
        shadowColor: "#2563eb12",
        shadowOpacity: 0.04,
        elevation: 1,
        padding: 3,
    },
    tabBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 13,
        paddingVertical: 7,
        borderRadius: 11,
        marginHorizontal: 2,
        backgroundColor: "transparent"
    },
    tabBtnActive: { backgroundColor: "#fff", elevation: 2 },
    tabBtnText: {
        marginLeft: 7,
        fontWeight: "700",
        color: "#b6bcd2",
        fontSize: 14.3,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 17,
        padding: 18,
        shadowColor: "#2563eb20",
        shadowOpacity: 0.08,
        elevation: 3,
        marginBottom: 16,
        minHeight: 80,
    },
    pill: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#e4f0fd",
        borderRadius: 13,
        paddingHorizontal: 9, paddingVertical: 4, marginBottom: 5, marginRight: 6,
        marginTop: 1,
        borderWidth: 1, borderColor: "#eaf3ff"
    },
    pillText: { fontWeight: "700", fontSize: 13.7 },
    cardTitle: {
        fontWeight: "700", fontSize: 16, color: "#2363eb",
        marginTop: 12, marginBottom: 8,
        letterSpacing: 0.02
    },
    descText: { fontSize: 14.8, color: "#415c78", marginBottom: 4, marginLeft: 1 },
    statLine: { fontSize: 13.4, color: "#6e7e97", marginTop: 2, fontWeight: "600" },
    statVal: { fontWeight: "700", color: "#2363eb" },
    ingredientRow: {
        flexDirection: "row", alignItems: "center",
        marginVertical: 2,
    },
    ingredientText: { fontSize: 14.2, color: "#333", marginLeft: 2, fontWeight: "600" },
    emptyText: { fontSize: 14, color: "#bbb", fontStyle: "italic", textAlign: "center", marginTop: 7 },
    recipeText: { fontSize: 15, color: "#222", marginTop: 5 },
    variantsBar: {
        flexDirection: "row", justifyContent: "center", gap: 9,
        marginBottom: 8,
    },
    variantBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f9ff",
        borderRadius: 13,
        paddingVertical: 8,
        paddingHorizontal: 22,
        marginHorizontal: 6,
        marginBottom: 0,
        shadowColor: "#2563eb16",
        shadowOpacity: 0.09,
        elevation: 1,
    },
    variantBtnDisabled: {
        opacity: 0.5
    },
    variantBtnText: {
        fontWeight: "700",
        color: "#2363eb",
        fontSize: 15.5,
    },
    disabledMessageText: {
        marginTop: 8,
        fontSize: 12.5,
        color: '#777',
        textAlign: 'center',
        marginBottom: 10,
    },
    addToCartButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2363eb",
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: "#2363eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    addToCartButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: 0.5,
    },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
