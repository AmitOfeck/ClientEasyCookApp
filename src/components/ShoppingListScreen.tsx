import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, Alert, Image, LayoutAnimation, UIManager, Platform, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import apiClient from '../services/api-client';
import { updateItemQuantity, removeShoppingItem, clearShoppingList, replaceShoppingItem } from '../services/shopping_list_service';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';

type ShoppingItem = { name: string; unit: string; quantity: number };
type PreparedDish = { dishId: string; count: number };
type DishDetails = { _id: string; name: string; image: string };
type Navigation = StackNavigationProp<CartStackParamList, 'ShoppingList'>;

const allowedUnits = ['gram', 'kg', 'ml', 'liter'];

const ShoppingListScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [preparedDishes, setPreparedDishes] = useState<PreparedDish[]>([]);
  const [dishDetails, setDishDetails] = useState<Record<string, DishDetails>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<string>('0');
  const [selectedUnit, setSelectedUnit] = useState<string>('gram');
  const [showDishes, setShowDishes] = useState(true);
  const [showItems, setShowItems] = useState(true);

  const fetchDishDetails = async (dishes: PreparedDish[]) => {
    try {
      const responses = await Promise.all(dishes.map((dish) => apiClient.get(`/dish/${dish.dishId}`)));
      const details: Record<string, DishDetails> = {};
      responses.forEach((res) => { const dish = res.data; details[dish._id] = dish; });
      setDishDetails(details);
    } catch (error) {
      console.error('Failed to fetch dish details:', error);
    }
  };

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shopping-list');
      const { items, preparedDishes } = response.data;
      setItems(items);
      const dishesArray = preparedDishes ? Object.entries(preparedDishes).map(([dishId, count]) => ({ dishId, count: Number(count) })) : [];
      setPreparedDishes(dishesArray);
      await fetchDishDetails(dishesArray);
    } catch (error) {
      console.error('Failed to fetch shopping list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchShoppingList(); }, []));

  const handleGoToCart = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found');
      const response = await apiClient.get(`/cart/bestCart/${userId}`);
      const cartOptions = response.data;
      if (!Array.isArray(cartOptions) || cartOptions.length === 0) {
        Alert.alert('No carts found', 'Could not find any cart options for your shopping list.');
        return;
      }
      navigation.navigate('CartOptions', { cartOptions });
    } catch (error) {
      console.error('Failed to fetch cart options from Wolt:', error);
      Alert.alert('Error', 'Failed to get cart options. Please try again.');
    }
  };

  const handleIncrementDish = async (dishId: string) => {
    try {
      await apiClient.post('/shopping-list/add-dishes', { dishIds: [dishId] });
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to increment dish count:', error);
    }
  };

  const handleDecrementDish = async (dishId: string) => {
    try {
      await apiClient.put('/shopping-list/remove-dish', { dishId });
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to decrement dish count:', error);
    }
  };

  const handleIncrementItem = async (index: number) => {
    const item = items[index];
    try {
      await updateItemQuantity(item.name, item.unit, 1);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to increment quantity:', error);
    }
  };

  const handleDecrementItem = async (index: number) => {
    const item = items[index];
    if (item.quantity <= 1) return;
    try {
      await updateItemQuantity(item.name, item.unit, -1);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to decrement quantity:', error);
    }
  };

  const handleRemoveItem = async (index: number) => {
    const item = items[index];
    try {
      await removeShoppingItem(item.name);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearList = () => {
    Alert.alert('Are you sure?', 'This will remove all items from your shopping list.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, clear it', style: 'destructive', onPress: async () => {
        try {
          await clearShoppingList();
          fetchShoppingList();
        } catch (error) {
          console.error('Failed to clear list:', error);
        }
      } }
    ]);
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setEditedQuantity(item.quantity.toString());
    setSelectedUnit(item.unit);
    setEditItemIndex(index);
  };

  const renderPreparedDish = ({ item }: { item: PreparedDish }) => {
    const dish = dishDetails[item.dishId];
    return (
      <View style={styles.dishCard}>
  {dish?.image ? (
    <Image source={{ uri: dish.image }} style={styles.dishImage} />
  ) : (
    <View style={[styles.dishImage, styles.placeholder]}>
      <Icon name="food" size={24} color="#888" />
    </View>
  )}

  <View style={styles.dishInfo}>
    <View style={styles.dishTitleRow}>
      <Text style={styles.itemName}>{dish?.name || item.dishId}</Text>
    </View>
    <View style={styles.controls}>
      <TouchableOpacity onPress={() => handleDecrementDish(item.dishId)} style={styles.circleButton}>
        <Icon name="minus" size={18} color="#1E3A8A" />
      </TouchableOpacity>
      <Text style={styles.quantityText}>{item.count}</Text>
      <TouchableOpacity onPress={() => handleIncrementDish(item.dishId)} style={styles.circleButton}>
        <Icon name="plus" size={18} color="#1E3A8A" />
      </TouchableOpacity>
    </View>
  </View>
</View>

    );
  };

  const renderItem = ({ item, index }: { item: ShoppingItem; index: number }) => (
    <View style={styles.itemCard}>
  <View style={styles.itemLeft}>
    <Text style={styles.itemName}>{item.name}</Text>
  </View>
  <View style={styles.itemControls}>
    <TouchableOpacity onPress={() => handleDecrementItem(index)} style={styles.circleButton}>
      <Icon name="minus" size={18} color="#1E3A8A" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => openEditModal(index)}>
      <Text style={styles.quantityText}>{item.quantity} {item.unit}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleIncrementItem(index)} style={styles.circleButton}>
      <Icon name="plus" size={18} color="#1E3A8A" />
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeButton}>
      <Icon name="trash-can-outline" size={20} color="red" />
    </TouchableOpacity>
  </View>
</View>
  );

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#1E3A8A" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
      <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowDishes(!showDishes); }}>
        <Text style={styles.header}>🍽️ Prepared Dishes {showDishes ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showDishes && (
        <FlatList data={preparedDishes} keyExtractor={(item) => item.dishId} renderItem={renderPreparedDish} scrollEnabled={false} />
      )}

      <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowItems(!showItems); }}>
        <Text style={[styles.header, { marginTop: 20 }]}>🧾 Shopping List {showItems ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showItems && (
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearList}>
          <Text style={styles.clearButtonText}>Clear List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={handleGoToCart}>
          <Text style={styles.cartButtonText}>GO TO CART</Text>
        </TouchableOpacity>
      </View>

      {editItemIndex !== null && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Quantity</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" value={editedQuantity} onChangeText={setEditedQuantity} />
            <View style={styles.unitSelector}>
              {allowedUnits.map((unit) => (
                <TouchableOpacity key={unit} style={[styles.unitButton, selectedUnit === unit && styles.unitButtonSelected]} onPress={() => setSelectedUnit(unit)}>
                  <Text style={[styles.unitButtonText, selectedUnit === unit && styles.unitButtonTextSelected]}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditItemIndex(null)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                const item = items[editItemIndex];
                const newQuantity = parseFloat(editedQuantity);
                if (isNaN(newQuantity) || newQuantity <= 0) return Alert.alert('Invalid quantity');
                try {
                  await replaceShoppingItem(item.name, selectedUnit, newQuantity);
                  setEditItemIndex(null);
                  fetchShoppingList();
                } catch (error) {
                  console.error('Error replacing item:', error);
                }
              }}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
    marginBottom: 10,
  },
  dishImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  dishTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  circleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    minWidth: 50,
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  itemLeft: {
    flex: 1,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 10,
  },
  clearButton: {
    backgroundColor: '#F87171',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  clearButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cartButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  cartButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  unitButtonSelected: {
    backgroundColor: '#1E3A8A',
  },
  unitButtonText: {
    color: '#1E3A8A',
    fontSize: 14,
  },
  unitButtonTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
  },
  saveText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

