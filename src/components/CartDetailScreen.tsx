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

// השתמש בלוגו PNG שקוף!
const woltLogo = require("../assets/woltLogo.png");

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
    setAddedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    if (!addedItems[itemId]) {
      const woltUrl = `https://wolt.com/he/isr/wolt/venue/${superId}/itemid-${itemId}`;
      Linking.openURL(woltUrl);
    }
  };

  // === Product Row ===
  const renderItem = ({ item }: { item: typeof products[0] }) => {
    const isAdded = addedItems[item.itemId];
    const isMissing = missingProducts.includes(item.name) || missingProducts.includes(item.itemId);

    return (
      <View style={[
        styles.itemRow,
        isMissing && styles.itemRowMissing,
      ]}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.itemDetails}>
            <Text style={styles.subText}>x{item.quantity}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.priceText}>₪{item.price.toFixed(2)}</Text>
          </View>
        </View>
        <TouchableOpacity
              onPress={() => handleWoltPress(item.itemId)}
              style={[
                styles.woltButton,
                isAdded ? styles.woltButtonActive : styles.woltButtonDefault,
              ]}
              activeOpacity={0.85}
              >
              <Image
              source={woltLogo}
              style={styles.woltLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
      </View>
    )
  };

  // === HEADER ===
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
        <Text style={styles.deliveryText}> (including ₪{deliveryPrice.toFixed(2)} delivery)</Text>
      </Text>
      <Text style={styles.sectionTitle}>Products in Cart:</Text>
    </View>
  );

  // === FOOTER ===
  const ListFooter = () =>
    missingProducts.length > 0 ? (
      <View style={{ marginTop: 8 }}>
        <View style={styles.missingBox}>
          <Text style={styles.missingIcon}>⚠️</Text>
          <Text style={styles.missingTextMain}>
            {missingProducts.length} missing item{missingProducts.length > 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.missingContainer}>
          {missingProducts.map((item, index) => (
            <View key={index} style={styles.missingBadge}>
              <Text style={styles.missingText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    ) : null;

  return (
    <View style={styles.screenBg}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.itemId}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 50 },
        ]}
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
  // --- Product Row ---
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f2f3fa',
    alignItems: "center",
    minHeight: 62,
    shadowColor: "#2563eb08",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  itemRowMissing: {
    backgroundColor: "#fffbe7",
    borderColor: "#ffe39a",
  },
  image: {
    width: 44,
    height: 44,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: "#eaf3ff",
    marginRight: 9,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15.3,
    fontWeight: '700',
    color: '#2363eb',
    marginBottom: 2,
    lineHeight: 18,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    gap: 6,
  },
  subText: {
    fontSize: 12.3,
    color: '#6e7e97',
    fontWeight: "600",
  },
  priceText: {
    fontSize: 12.3,
    color: "#15955c",
    fontWeight: "700",
  },
  dot: {
    fontSize: 15,
    color: "#dadada",
    marginHorizontal: 4,
    marginBottom: 2,
  },
  // --- Wolt Button ---
  woltButton: {
    marginTop: 12,
    borderRadius: 26,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    flexDirection: "row",
    alignSelf: "flex-start",
  },
  woltButtonActive: {
    backgroundColor:"#c7e3ee", 
    borderColor: "#26A9E0",
    },
  woltButtonDefault: {
    backgroundColor: "#fff",          
    borderColor: "#26A9E0",            
  },
  woltLogo: {
    width: 37,  
    height: 16,
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
