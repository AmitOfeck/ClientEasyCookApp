import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';
import { Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type Props = StackScreenProps<CartStackParamList, 'CartDetail'>;

const CartDetailScreen: React.FC<Props> = ({ route }) => {
  const { products, superId, totalCost } = route.params;
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (pendingItemId) {
        setAddedItems((prev) => ({ ...prev, [pendingItemId]: true }));
        setPendingItemId(null);
      }
    }, [pendingItemId])
  );

  const openWoltLink = (productName: string, itemId: string) => {
    console.log(`Opening Wolt link for item: ${productName}, ID: ${itemId}`);
    const woltUrl = `https://wolt.com/he/isr/wolt/venue/${superId}/itemid-${itemId}`;
    setPendingItemId(itemId);
    Linking.openURL(woltUrl);
  };

  const renderItem = ({ item }: { item: typeof products[0] }) => {
    const isAdded = addedItems[item.itemId];
    return (
      <View style={styles.itemRow}>
        <Text style={styles.itemText}>🧾 Product ID: {item.itemId}</Text>
        <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemText}>Price: ₪{item.price.toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => openWoltLink(item.itemId, item.itemId)}
          style={[styles.woltButton, { backgroundColor: isAdded ? '#4CAF50' : '#2196F3' }]}
          disabled={isAdded}
        >
          <Text style={styles.buttonText}>{isAdded ? 'נוסף' : 'הוסף לוולט'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 {superId.replace(/-/g, ' ')}</Text>
      <Text style={styles.totalText}>Total: ₪{totalCost.toFixed(2)}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.itemId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default CartDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemRow: {
    padding: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  woltButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
