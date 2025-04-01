import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { fetchBestCart } from '../services/cart_service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartOptionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [supermarkets, setSupermarkets] = useState<
    { superId: string; totalCost: number; products: any[] }[]
  >([]);

  useEffect(() => {
    const getBestCart = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const response = await fetchBestCart(userId);
        const cart = response.data;
        console.log('Cart from server:', cart);

        setSupermarkets([
          {
            superId: cart.superId,
            totalCost: cart.totalCost,
            products: cart.products,
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };

    getBestCart();
  }, []);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => {
      console.log("Selected super:", item.superId);
      // בהמשך תוכל להוסיף ניווט למסך פירוט עגלה
    }}>
      <Text style={styles.superText}>{item.superId.replace(/-/g, ' ')}</Text>
      <Text style={styles.priceText}>Total: ₪{item.totalCost.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Nearby Supermarkets</Text>
      <FlatList
        data={supermarkets}
        keyExtractor={(item) => item.superId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </View>
  );
};

export default CartOptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#1E3A8A',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  superText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  priceText: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
  },
});
