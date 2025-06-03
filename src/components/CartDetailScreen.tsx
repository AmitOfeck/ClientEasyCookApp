import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';
import { Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type Props = StackScreenProps<CartStackParamList, 'CartDetail'>;

const CartDetailScreen: React.FC<Props> = ({ route }) => {
  const {
    products = [],
    superId = 'Unknown Store',
    totalCost = 0,
    missingProducts = [],
  } = route.params ?? {};
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
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.subText}>🧮 Quantity: {item.quantity}</Text>
          <Text style={styles.subText}>💸 Price: ₪{item.price.toFixed(2)}</Text>
          <TouchableOpacity
            onPress={() => openWoltLink(item.itemId, item.itemId)}
            style={[styles.woltButton, { backgroundColor: isAdded ? '#4CAF50' : '#2196F3' }]}
            disabled={isAdded}
          >
            <Text style={styles.buttonText}>{isAdded ? 'נוסף' : 'הוסף לוולט'}</Text>
          </TouchableOpacity>
        </View>
      </View>
  )};

  const ListHeader = () => (
    <>
      <Text style={styles.header}>🛒 {superId.replace(/-/g, ' ')}</Text>
      <Text style={styles.totalText}>Total Cost: ₪{totalCost.toFixed(2)}</Text>
      <Text style={styles.sectionTitle}>🧾 Products in Cart:</Text>
    </>
  );

  const ListFooter = () =>
    missingProducts.length > 0 ? (
      <>
        <Text style={styles.sectionTitle}>❗ Missing Products:</Text>
        <View style={styles.missingContainer}>
          {missingProducts.map((item, index) => (
            <View key={index} style={styles.missingBadge}>
              <Text style={styles.missingText}>{item}</Text>
            </View>
          ))}
        </View>
      </>
    ) : null;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.itemId}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

export default CartDetailScreen;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#F0F4F8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 10,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    color: '#555',
  },
  missingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  missingBadge: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  missingText: {
    color: '#B91C1C',
    fontWeight: '500',
    fontSize: 13,
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
