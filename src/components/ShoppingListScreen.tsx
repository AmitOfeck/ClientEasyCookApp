import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import apiClient from '../services/api-client';
import { updateItemQuantity, removeShoppingItem, clearShoppingList, replaceShoppingItem } from '../services/shopping_list_service';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';

type ShoppingItem = {
  name: string;
  unit: string;
  quantity: number;
};

type PreparedDish = {
  dishId: string;
  count: number;
};

type DishDetails = {
  _id: string;
  name: string;
  image: string;
};


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
      console.error('Failed to fetch dish details:', error);
    }
  };

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shopping-list');
      const { items, preparedDishes } = response.data;
      setItems(items);

      const dishesArray = preparedDishes
        ? Object.entries(preparedDishes).map(([dishId, count]) => ({ dishId, count: Number(count) }))
        : [];

      setPreparedDishes(dishesArray);
      await fetchDishDetails(dishesArray);
    } catch (error) {
      console.error('Failed to fetch shopping list:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchShoppingList();
    }, [])
  );


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
      {
        text: 'Yes, clear it',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearShoppingList();
            fetchShoppingList();
          } catch (error) {
            console.error('Failed to clear list:', error);
          }
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
          <Text style={styles.itemName}>{dish?.name || item.dishId}</Text>
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
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => handleDecrementItem(index)} style={styles.circleButton}>
          <Icon name="minus" size={18} color="#1E3A8A" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openEditModal(index)}>
          <Text style={styles.quantityText}>
            {item.quantity} {item.unit}
          </Text>
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 30 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🍽️ Prepared Dishes</Text>

      <FlatList
        data={preparedDishes}
        keyExtractor={(item) => item.dishId}
        renderItem={renderPreparedDish}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No dishes added yet.</Text>}
      />

      <Text style={[styles.header, { marginTop: 20 }]}>🧾 Shopping List</Text>

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchShoppingList} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Your shopping list is empty.</Text>}
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearList}>
              <Text style={styles.clearButtonText}>Clear List</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartButton} onPress={handleGoToCart}>
              <Text style={styles.cartButtonText}>GO TO CART</Text>
            </TouchableOpacity>
          </View>
        }
      />

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
                  style={[styles.unitButton, selectedUnit === unit && styles.unitButtonSelected]}
                  onPress={() => setSelectedUnit(unit)}
                >
                  <Text style={[styles.unitButtonText, selectedUnit === unit && styles.unitButtonTextSelected]}>
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
                  if (isNaN(newQuantity) || newQuantity <= 0) {
                    Alert.alert('Invalid quantity');
                    return;
                  }
                  try {
                    await replaceShoppingItem(item.name, selectedUnit, newQuantity);
                    setEditItemIndex(null);
                    fetchShoppingList();
                  } catch (error) {
                    console.error('Error replacing item:', error);
                  }
                }}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  list: {
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 100,
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    backgroundColor: '#FFE4E1',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '60%',
  },
  clearButtonText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cartButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    minWidth: '60%',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  unitSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  unitButtonSelected: {
    backgroundColor: '#1E3A8A',
  },
  unitButtonText: {
    color: '#1E3A8A',
  },
  unitButtonTextSelected: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelText: {
    color: '#777',
    fontWeight: 'bold',
  },
  saveText: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A0AEC0',
    padding: 10,
    marginBottom: 10,
  },
  dishImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },

itemName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1F1F1F',
  marginBottom: 6,
},

controls: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 10,
},

circleButton: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: '#E6EDF8',
  justifyContent: 'center',
  alignItems: 'center',
},

quantityText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#1E3A8A',
  width: 50,
  textAlign: 'center',
},
  
});
