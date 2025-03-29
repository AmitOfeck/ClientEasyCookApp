import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../services/api-client';

type ShoppingItem = {
  name: string;
  unit: string;
  quantity: number;
};

const ShoppingListScreen: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/shopping-list');
      setItems(response.data.items);
    } catch (error) {
      console.error('❌ Failed to fetch shopping list:', error);
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

  const handleIncrement = (index: number) => {
    const updated = [...items];
    updated[index].quantity += 1;
    setItems(updated);
    // TODO: add real update to server
  };

  const handleDecrement = (index: number) => {
    const updated = [...items];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      setItems(updated);
      // TODO: add real update to server
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShoppingList();
  };

  const renderItem = ({ item, index }: { item: ShoppingItem; index: number }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => handleDecrement(index)} style={styles.circleButton}>
          <Icon name="minus" size={18} color="#1E3A8A" />
        </TouchableOpacity>

        <Text style={styles.quantityText}>
          {item.quantity} {item.unit}
        </Text>

        <TouchableOpacity onPress={() => handleIncrement(index)} style={styles.circleButton}>
          <Icon name="plus" size={18} color="#1E3A8A" />
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
        />
      )}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>GO TO CART</Text>
      </TouchableOpacity>
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
    paddingBottom: 120,
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
    gap: 12,
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
  button: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    width: '70%',
    position: 'absolute',
    bottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
