import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../services/api-client";
import {
  updateItemQuantity,
  removeShoppingItem,
  clearShoppingList,
  replaceShoppingItem,
} from "../services/shopping_list_service";
import { StackNavigationProp } from "@react-navigation/stack";
import { CartStackParamList } from "../navigation/CartStackScreen";

const { width } = Dimensions.get("window");
const allowedUnits = ["gram", "kg", "ml", "liter"];

type ShoppingItem = { name: string; unit: string; quantity: number };
type PreparedDish = { dishId: string; count: number };
type DishDetails = { _id: string; name: string; imageUrl?: string; details?: string };
type Navigation = StackNavigationProp<CartStackParamList, "ShoppingList">;

const ShoppingListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const [tab, setTab] = useState<"dishes" | "ingredients">("dishes");
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [preparedDishes, setPreparedDishes] = useState<PreparedDish[]>([]);
  const [dishDetails, setDishDetails] = useState<Record<string, DishDetails>>({});
  const [loading, setLoading] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<string>("0");
  const [selectedUnit, setSelectedUnit] = useState<string>("gram");

  // --- DATA FETCHING ---
  const fetchDishDetails = async (dishes: PreparedDish[]) => {
    try {
      const responses = await Promise.all(
        dishes.map((dish) => apiClient.get(`/dish/${dish.dishId}`))
      );
      const details: Record<string, DishDetails> = {};
      responses.forEach((res) => {
        const dish = res.data;
        details[dish._id] = dish;
      });
      setDishDetails(details);
    } catch (error) {
      console.error("Failed to fetch dish details:", error);
    }
  };

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/shopping-list");
      const { items, preparedDishes } = response.data;
      setItems(items);
      const dishesArray = preparedDishes
        ? Object.entries(preparedDishes).map(([dishId, count]) => ({
            dishId,
            count: Number(count),
          }))
        : [];
      setPreparedDishes(dishesArray);
      await fetchDishDetails(dishesArray);
    } catch (error) {
      console.error("Failed to fetch shopping list:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchShoppingList(); }, []));

  // --- LOGIC ---
  const handleGoToCart = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");
      const response = await apiClient.get(`/cart/bestCart/${userId}`);
      const cartOptions = response.data;
      if (!Array.isArray(cartOptions) || cartOptions.length === 0) {
        Alert.alert("No carts found", "Could not find any cart options for your shopping list.");
        return;
      }
      navigation.navigate("CartOptions", { cartOptions });
    } catch (error) {
      Alert.alert("Error", "Failed to get cart options. Please try again.");
    }
  };

  // Dishes logic
  const handleIncrementDish = async (dishId: string) => {
    await apiClient.post("/shopping-list/add-dishes", { dishIds: [dishId] });
    fetchShoppingList();
  };
  const handleDecrementDish = async (dishId: string) => {
    await apiClient.put("/shopping-list/remove-dish", { dishId });
    fetchShoppingList();
  };

  // Items logic
  const handleIncrementItem = async (index: number) => {
    const item = items[index];
    await updateItemQuantity(item.name, item.unit, 1);
    fetchShoppingList();
  };
  const handleDecrementItem = async (index: number) => {
    const item = items[index];
    if (item.quantity <= 1) return;
    await updateItemQuantity(item.name, item.unit, -1);
    fetchShoppingList();
  };
  const handleRemoveItem = async (index: number) => {
    const item = items[index];
    await removeShoppingItem(item.name);
    fetchShoppingList();
  };

  const handleClearList = () => {
    Alert.alert("Are you sure?", "This will remove all items from your shopping list.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, clear it",
        style: "destructive",
        onPress: async () => {
          await clearShoppingList();
          fetchShoppingList();
        },
      },
    ]);
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setEditedQuantity(item.quantity.toString());
    setSelectedUnit(item.unit);
    setEditItemIndex(index);
  };

  // --- CARDS ---

  // Dishes card
  const renderDishCard = (dish: PreparedDish) => {
    const d = dishDetails[dish.dishId];
    return (
      <View style={styles.cardRecipe} key={dish.dishId}>
        {d?.imageUrl ? (
          <Image source={{ uri: d.imageUrl }} style={styles.cardRecipeImg} />
        ) : (
          <View style={[styles.cardRecipeImg, { backgroundColor: "#eaf3ff", justifyContent: "center", alignItems: "center" }]}>
            <Icon name="food" size={36} color="#bcd7fa" />
          </View>
        )}
        <Text style={styles.cardRecipeTitle} numberOfLines={1}>
          {d?.name || "Unknown Dish"}
        </Text>
        {d?.details && (
          <Text style={styles.cardRecipeDesc} numberOfLines={2}>
            {d.details}
          </Text>
        )}
        <View style={styles.recipeActions}>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => handleDecrementDish(dish.dishId)}
          >
            <Icon name="minus" size={17} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.cardRecipeQty}>{dish.count}</Text>
          <TouchableOpacity
            style={styles.actionIcon}
            onPress={() => handleIncrementDish(dish.dishId)}
          >
            <Icon name="plus" size={17} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Ingredients row – כמו רשימת קניות אמיתית (לא כרטיסייה)
  const renderItemRow = (item: ShoppingItem, index: number) => (
    <View style={styles.ingredientRow} key={`${item.name}-${index}`}>
      <Text style={styles.ingredientName} numberOfLines={1}>{item.name}</Text>
      <View style={styles.ingredientActionWrap}>
        <TouchableOpacity
          style={styles.iconSmall}
          onPress={() => handleDecrementItem(index)}
        >
          <Icon name="minus" size={15} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openEditModal(index)}>
          <Text style={styles.ingredientQty}>
            {item.quantity} {item.unit}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconSmall}
          onPress={() => handleIncrementItem(index)}
        >
          <Icon name="plus" size={15} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconTrashSmall}
          onPress={() => handleRemoveItem(index)}
        >
          <Icon name="trash-can-outline" size={16} color="#e54349" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- LOADING ---
  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // --- MAIN RENDER ---
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#e4f0fd" }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerIconBox}>
          <Icon name="cart-outline" size={26} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>My Shopping List</Text>
          <Text style={styles.headerSubtitle}>
            Manage your saved dishes and ingredients
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "dishes" && styles.tabActive]}
          onPress={() => setTab("dishes")}
        >
          <Text
            style={[styles.tabText, tab === "dishes" && styles.tabTextActive]}
          >
            Dishes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "ingredients" && styles.tabActive]}
          onPress={() => setTab("ingredients")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "ingredients" && styles.tabTextActive,
            ]}
          >
            Ingredients
          </Text>
        </TouchableOpacity>
      </View>

{/* Cards / List */}
{tab === "dishes" ? (
  preparedDishes.length === 0 ? (
    <View style={styles.emptyStateWrap}>
      <Icon name="emoticon-sad-outline" size={44} color="#2563eb" style={{ marginBottom: 8 }} />
      <Text style={styles.emptyStateText}>No dishes in your shopping list yet.</Text>
      <Text style={styles.emptyStateSubText}>
        Search and add dishes to start building your cart!
      </Text>
    </View>
  ) : (
    <View style={styles.cardWrapper}>
      {preparedDishes.map(renderDishCard)}
    </View>
  )
) : (
  items.length === 0 ? (
    <View style={styles.emptyStateWrap}>
      <Icon name="playlist-remove" size={40} color="#2563eb" style={{ marginBottom: 8 }} />
      <Text style={styles.emptyStateText}>No ingredients in your list yet.</Text>
      <Text style={styles.emptyStateSubText}>
        Add ingredients manually or by adding dishes to fill up your shopping list.
      </Text>
    </View>
  ) : (
    <View style={styles.ingredientList}>
      {items.map((item, idx) => renderItemRow(item, idx))}
    </View>
  )
)}


      {/* Actions */}
      <View style={styles.actionRow}>
  <TouchableOpacity
    style={[styles.modernButton, styles.clearModern]}
    onPress={handleClearList}
    activeOpacity={0.83}
  >
    <Text style={[styles.modernButtonText, styles.clearModernText]}>Clear List</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.modernButton, styles.applyModern]}
    onPress={handleGoToCart}
    activeOpacity={0.83}
  >
    <Text style={[styles.modernButtonText, styles.applyModernText]}>GO TO CART</Text>
  </TouchableOpacity>
</View>

      {/* Edit Modal */}
      {editItemIndex !== null && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Quantity</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={editedQuantity}
              onChangeText={setEditedQuantity}
            />
            <View style={styles.unitSelector}>
              {allowedUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitBtn,
                    selectedUnit === unit && styles.unitBtnSelected,
                  ]}
                  onPress={() => setSelectedUnit(unit)}
                >
                  <Text
                    style={[
                      styles.unitBtnText,
                      selectedUnit === unit && styles.unitBtnTextSelected,
                    ]}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditItemIndex(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  const item = items[editItemIndex];
                  const newQuantity = parseFloat(editedQuantity);
                  if (isNaN(newQuantity) || newQuantity <= 0)
                    return Alert.alert("Invalid quantity");
                  await replaceShoppingItem(item.name, selectedUnit, newQuantity);
                  setEditItemIndex(null);
                  fetchShoppingList();
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ShoppingListScreen;

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 22,
    marginTop: 13,
    marginBottom: 17,
    padding: 13,
    width: "95%",
    alignSelf: "center",
    minHeight: 68,
    shadowColor: "#2563eb33",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 11,
    elevation: 7,
  },
  headerIconBox: {
    backgroundColor: "#2563eb",
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    shadowColor: "#2563eb",
    shadowOpacity: 0.13,
    shadowRadius: 8,
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
  // --- Tabs like profile ---
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e8ef",
    marginHorizontal: 13,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 30,
    marginHorizontal: 2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    backgroundColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 15.5,
    color: "#8E8E93",
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  // --- Dishes grid (cards) ---
  cardWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // רווח שווה בין הכרטיסים
    width: "100%",
    paddingHorizontal: 12, // שחק עם המספר עד שזה יושב מדויק
  },
  cardRecipe: {
    width: "47%", // שים לב שזה מחושב רספונסיבי
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 11, // היה 15, תנסה אפילו 8-10
    marginHorizontal: 2, // היה 5-8, תוריד ל-2-4
    alignItems: "center",
    padding: 12,
    elevation: 5,
    shadowColor: "#2563eb11",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardRecipeImg: {
    width: "100%",
    height: 90,
    borderRadius: 10,
    marginBottom: 7,
    backgroundColor: "#eaf3ff",
    resizeMode: "cover",
  },
  cardRecipeTitle: {
    fontSize: 14.7,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 2,
    marginTop: 2,
  },
  cardRecipeDesc: {
    fontSize: 12.1,
    color: "#6e7e97",
    marginBottom: 7,
    textAlign: "center",
    minHeight: 28,
  },
  recipeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4,
  },
  cardRecipeQty: {
    fontSize: 16,
    color: "#222",
    fontWeight: "700",
    minWidth: 26,
    textAlign: "center",
    marginHorizontal: 4,
  },
  actionIcon: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 12,
    width: 27,
    height: 27,
    backgroundColor: "#f6f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 1,
    shadowColor: "#2563eb12",
    shadowOpacity: 0.10,
    shadowRadius: 5,
    elevation: 1,
  },
  // --- Ingredient list (not cards) ---
  ingredientList: {
    backgroundColor: "#fff",
    borderRadius: 13,
    marginHorizontal: 10,
    marginBottom: 25,
    shadowColor: "#2563eb0a",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    paddingVertical: 8,
    paddingHorizontal: 3,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f5",
    minHeight: 46,
    paddingHorizontal: 6,
  },
  ingredientName: {
    flex: 1,
    fontSize: 14,
    color: "#304760",
    fontWeight: "600",
    marginRight: 4,
  },
  ingredientActionWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  ingredientQty: {
    fontSize: 13.8,
    color: "#2563eb",
    fontWeight: "bold",
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#eaf3ff",
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 40,
    textAlign: "center",
  },
  iconSmall: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 10,
    width: 22,
    height: 22,
    backgroundColor: "#f7fafd",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 1,
  },
  iconTrashSmall: {
    borderWidth: 1,
    borderColor: "#e54349",
    borderRadius: 10,
    width: 22,
    height: 22,
    backgroundColor: "#fff7f8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
  },
  // --- ACTIONS ---
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: width < 400 ? 7 : 14,
    marginTop: width < 400 ? 8 : 14,
    marginBottom: width < 400 ? 5 : 12,
    paddingHorizontal: width < 400 ? 2 : 8,
  },
  clearBtn: {
    backgroundColor: "#e54349",
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#ffbbbb33",
    shadowOpacity: 0.10,
    elevation: 2,
  },
  clearBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.04,
  },
  cartBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#2563eb44",
    shadowOpacity: 0.13,
    elevation: 3,
  },
  cartBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.04,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    backgroundColor: "#e4f0fd",
  },
  // --- Modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  modalContent: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 17,
    padding: 25,
    alignItems: "center",
    shadowColor: "#2563eb55",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#c5dbfc",
    borderRadius: 11,
    padding: 10,
    fontSize: 17,
    marginBottom: 13,
    minWidth: 65,
    textAlign: "center",
  },
  unitSelector: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 13,
    gap: 7,
  },
  unitBtn: {
    borderWidth: 1.2,
    borderColor: "#2563eb",
    borderRadius: 19,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: "#eaf3ff",
  },
  unitBtnSelected: {
    backgroundColor: "#2563eb",
  },
  unitBtnText: {
    color: "#2563eb",
    fontSize: 14.2,
    fontWeight: "600",
  },
  unitBtnTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 35,
    marginTop: 13,
  },
  cancelText: {
    color: "#6B7280",
    fontSize: 16,
  },
  saveText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 16,
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
  // --- קירוב מרווח כרטיסי מנות ---
  gridWrapRecipe: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: width < 400 ? 4 : 7, 
    width: "100%",
    paddingHorizontal: width < 400 ? 1 : 7, 
  },
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 38,
    width: '100%',
  },
  emptyStateText: {
    fontSize: 16.2,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 13.3,
    color: '#8fa0b7',
    opacity: 0.85,
    textAlign: 'center',
    maxWidth: 260,
  },
});
