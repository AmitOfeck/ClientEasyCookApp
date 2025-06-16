import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';
import { Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get("window");

type Props = StackScreenProps<CartStackParamList, 'CartDetail'>;

const CartDetailScreen: React.FC<Props> = ({ route }) => {
  const {
    products = [],
    superId = 'Unknown Store',
    totalCost = 0,
    missingProducts = [],
    superImage,
    deliveryPrice = 0,
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

  const handleWoltPress = (itemId: string) => {
    // toggle: add/remove item
    setAddedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    // אם זו פעם ראשונה שסימן, פתח את וולט
    if (!addedItems[itemId]) {
      const woltUrl = `https://wolt.com/he/isr/wolt/venue/${superId}/itemid-${itemId}`;
      Linking.openURL(woltUrl);
    }
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
            onPress={() => handleWoltPress(item.itemId)}
            style={[
              styles.woltButton,
              { backgroundColor: isAdded ? '#36ad55' : '#2563eb' }
            ]}
          >
            <Text style={styles.buttonText}>
              {isAdded ? 'Added to Wolt (Undo)' : 'Add to Wolt cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  };

  const ListHeader = () => (
    <View>
      {/* Header with image/emoji and store info */}
      <View style={styles.headerWrap}>
        <View style={styles.headerImgBox}>
          {superImage ? (
            <Image source={{ uri: superImage }} style={styles.superImg} />
          ) : (
            <Text style={{ fontSize: 37, marginRight: 2 }}>🏪</Text>
          )}
        </View>
        <View>
          <Text style={styles.headerTitle}>{superId.replace(/-/g, ' ')}</Text>
          <Text style={styles.headerSubtitle}>
            Review your cart and complete your purchase!
          </Text>
        </View>
      </View>
      {/* Price Summary */}
      <Text style={styles.totalText}>
        Total: ₪{totalCost.toFixed(2)}{" "}
        <Text style={styles.deliveryText}>
          (including ₪{deliveryPrice.toFixed(2)} delivery)
        </Text>
      </Text>
      <Text style={styles.sectionTitle}>🧾 Products in Cart:</Text>
    </View>
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
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: 50 }, // More padding for safe area/navbar
      ]}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default CartDetailScreen;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingTop: 42,
    backgroundColor: "#F0F4F8",
    minHeight: 700,
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    backgroundColor: "#eaf3ff",
    borderRadius: 21,
    padding: 11,
    shadowColor: "#2563eb11",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 3,
    width: "100%",
    alignSelf: "center",
    minHeight: 60,
  },
  headerImgBox: {
    backgroundColor: "#eaf3ff",
    width: 54,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
    shadowColor: "#2563eb44",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },
  superImg: {
    width: 50,
    height: 50,
    borderRadius: 13,
    resizeMode: "cover",
  },
  headerTitle: {
    fontSize: 18.5,
    fontWeight: "bold",
    color: "#2363eb",
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 13.5,
    color: "#6a7dbb",
    fontWeight: "500",
    opacity: 0.82,
  },
  totalText: {
    fontSize: 16.3,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 11,
    textAlign: "center",
  },
  deliveryText: {
    fontWeight: "600",
    fontSize: 13.5,
    color: "#415c78",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2363eb",
    marginBottom: 9,
    marginTop: 9,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 13,
    marginBottom: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#f2f3fa',
    shadowColor: '#2563eb0a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    alignItems: "center",
  },
  image: {
    width: 62,
    height: 62,
    borderRadius: 11,
    resizeMode: 'cover',
    backgroundColor: "#eaf3ff"
  },
  itemInfo: {
    flex: 1,
    marginLeft: 13,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15.8,
    fontWeight: '700',
    color: '#2363eb',
    marginBottom: 3,
  },
  subText: {
    fontSize: 12.4,
    color: '#537399',
    marginBottom: 1,
    fontWeight: "500"
  },
  missingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 50,
    paddingTop: 7,
  },
  missingBadge: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 19,
    marginRight: 8,
    marginBottom: 8,
  },
  missingText: {
    color: '#B91C1C',
    fontWeight: '500',
    fontSize: 13.4,
  },
  woltButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 7,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14.2,
  },
});
