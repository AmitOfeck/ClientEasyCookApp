import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../services/api-client';
import { updateItemQuantity, removeShoppingItem, clearShoppingList, replaceShoppingItem, } from '../services/shopping_list_service';

type ShoppingItem = {
  name: string;
  unit: string;
  quantity: number;
};

const ShoppingListScreen: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<string>('0');
  const [selectedUnit, setSelectedUnit] = useState<string>('gram');
  const allowedUnits = ['gram', 'kg', 'ml', 'liter'];

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shopping-list');
      setItems(response.data.items);
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

  const handleIncrement = async (index: number) => {
    const item = items[index];
    try {
      await updateItemQuantity(item.name, item.unit, 1);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to increment quantity:', error);
    }
  };

  const handleDecrement = async (index: number) => {
    const item = items[index];
    if (item.quantity <= 1) return;
    try {
      await updateItemQuantity(item.name, item.unit, -1);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to decrement quantity:', error);
    }
  };

  const handleRemove = async (index: number) => {
    const item = items[index];
    try {
      await removeShoppingItem(item.name);
      fetchShoppingList();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearList = () => {
    Alert.alert(
      'Are you sure?',
      'This will remove all items from your shopping list.',
      [
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
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShoppingList();
  };

  const openEditModal = (index: number) => {
    const item = items[index];
    setEditedQuantity(item.quantity.toString());
    setSelectedUnit(item.unit);
    setEditItemIndex(index);
  };

  const renderItem = ({ item, index }: { item: ShoppingItem; index: number }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => handleDecrement(index)} style={styles.circleButton}>
          <Icon name="minus" size={18} color="#1E3A8A" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openEditModal(index)}>
          <Text style={styles.quantityText}>
            {item.quantity} {item.unit}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleIncrement(index)} style={styles.circleButton}>
          <Icon name="plus" size={18} color="#1E3A8A" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleRemove(index)} style={styles.removeButton}>
          <Icon name="trash-can-outline" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧾 Shopping List</Text>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListFooterComponent={
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClearList}>
                <Text style={styles.clearButtonText}>Clear List</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cartButton}>
                <Text style={styles.cartButtonText}>GO TO CART</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

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
                    styles.unitButton,
                    selectedUnit === unit && styles.unitButtonSelected,
                  ]}
                  onPress={() => setSelectedUnit(unit)}
                >
                  <Text
                    style={[
                      styles.unitButtonText,
                      selectedUnit === unit && styles.unitButtonTextSelected,
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

                  if (isNaN(newQuantity) || newQuantity === item.quantity) {
                    setEditItemIndex(null);
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
    marginBottom: 20,
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
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F1F1F',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
    width: 80,
    textAlign: 'center',
  },
  circleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6EDF8',
    justifyContent: 'center',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
});
