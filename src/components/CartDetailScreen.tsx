import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Dimensions,
  StyleSheet
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { CartStackParamList } from '../navigation/CartStackScreen';
import { createCart } from '../services/cart_service';   // <-- NEW
const { width } = Dimensions.get('window');

// transparent png please 🙂
const woltLogo = require('../assets/woltLogo.png');
const groceryPlaceholder = require('../assets/grocery.png');

type Props = StackScreenProps<CartStackParamList, 'CartDetail'>;

const CartDetailScreen: React.FC<Props> = ({ route }) => {
  /* ───────── props from route ───────── */
  const {
    products = [],
    superId = 'Unknown Store',
    totalCost = 0,
    missingProducts = [],
    superImage,
    deliveryPrice = 0,
  } = route.params ?? {};

  /* ───────── state ───────── */
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const [saving, setSaving]       = useState(false);   // create-cart spinner
  const [serverError, setError]   = useState<string | null>(null);

  /* ───────── mark item as added after returning from Wolt ───────── */
  useFocusEffect(
    useCallback(() => {
      if (pendingItemId) {
        setAddedItems((prev) => ({ ...prev, [pendingItemId]: true }));
        setPendingItemId(null);
      }
    }, [pendingItemId])
  );

  /* ───────── open Wolt for item ───────── */
  const handleWoltPress = (itemId: string) => {
    setAddedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    if (!addedItems[itemId]) {
      const url = `https://wolt.com/he/isr/wolt/venue/${superId}/itemid-${itemId}`;
      Linking.openURL(url);
    }
  };



  /* ───────── render product row ───────── */
  const renderItem = ({ item }: { item: typeof products[0] }) => {
    const isAdded   = addedItems[item.itemId];
    const isMissing =
      missingProducts.includes(item.name) ||
      missingProducts.includes(item.itemId);

    return (
      <View
        style={[
          styles.productCard,
          isMissing && styles.productCardMissing,
        ]}
      >
        <Image 
          source={item.image_url ? { uri: item.image_url } : groceryPlaceholder} 
          style={styles.productImg} 
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.detailsRow}>
            <Text style={styles.quantityText}>x{item.quantity}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.priceText}>₪{item.price.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleWoltPress(item.itemId)}
          style={[
            styles.woltButton,
            isAdded ? styles.woltButtonAdded : styles.woltButtonDefault,
          ]}
          activeOpacity={0.88}
        >
          <Image source={woltLogo} style={styles.woltLogo} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    );
  };

  /* ───────── header ───────── */
  const ListHeader = () => (
    <View>
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

      <Text style={styles.totalText}>
        Total: ₪{totalCost.toFixed(2)}
        <Text style={styles.deliveryText}>
          {' '}
          (including ₪{deliveryPrice.toFixed(2)} delivery)
        </Text>
      </Text>

      <Text style={styles.sectionTitle}>Products in Cart:</Text>
    </View>
  );

  /* ───────── footer (missing items + create-cart button) ───────── */
  const ListFooter = () => (
    <View style={{ marginTop: 12 }}>
      {missingProducts.length > 0 && (
        <>
          <View style={styles.missingBox}>
            <Text style={styles.missingIcon}>⚠️</Text>
            <Text style={styles.missingTextMain}>
              {missingProducts.length} missing item
              {missingProducts.length > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.missingContainer}>
            {missingProducts.map((m, i) => (
              <View key={i} style={styles.missingBadge}>
                <Text style={styles.missingText}>{m}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* server error text */}
      {serverError && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 6 }}>
          {serverError}
        </Text>
      )}

     
    </View>
  );

  /* ───────── render ───────── */
  return (
    <View style={styles.screenBg}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.itemId}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 50 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CartDetailScreen;


// ========== STYLES ==========
const styles = StyleSheet.create({
  screenBg: {
    flex: 1,
    backgroundColor: "#e4f0fd",
  },
  contentContainer: {
    padding: 17,
    paddingTop: 38,
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
  // --- Product Card ---
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 19,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginBottom: 8,
    shadowColor: "#2563eb0f",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f2f3fa",
    minHeight: 60,
  },
  productCardMissing: {
    backgroundColor: "#fffbe7",
    borderColor: "#ffe39a",
  },
  productImg: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e3e8ef",
    backgroundColor: "#f3f7fc",
    marginRight: 12,
    shadowColor: "#b1c7e6",
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15.2,
    fontWeight: "600",
    color: "#2c3f62",
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  quantityText: {
    fontSize: 13.2,
    color: "#7e8592",
    fontWeight: "600",
  },
  dot: {
    fontSize: 13,
    marginHorizontal: 4,
    color: "#bbc5d1",
    fontWeight: "800",
  },
  priceText: {
    fontSize: 13.2,
    color: "#13a442",
    fontWeight: "700",
  },
  // --- Wolt Button ---
  woltButton: {
    marginLeft: 12,
    borderRadius: 22,
    width: 68,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    flexDirection: "row",
    alignSelf: "center",
  },
  woltButtonDefault: {
    backgroundColor: "#fff",
    borderColor: "#26A9E0",
  },
  woltButtonAdded: {
    backgroundColor: "#b9d7e6", // צבע עדין, קצת כהה מהקודם
    borderColor: "#26A9E0",
  },
  woltLogo: {
    width: 44,
    height: 23,
  },
  // --- Missing Section ---
  missingBox: {
    backgroundColor: "#fffbe8",
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginTop: 10,
  },
  missingIcon: {
    fontSize: 20,
    marginRight: 7,
    color: "#eaa100",
  },
  missingTextMain: {
    fontWeight: "700",
    color: "#eaa100",
    fontSize: 15.5,
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
});
