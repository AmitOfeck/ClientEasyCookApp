import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBestCart } from '../services/cart_service';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<CartStackParamList, 'CartOptions'>;

const CartOptionsScreen: React.FC<Props> = ({ route, navigation }) => {
  const initialCartOptions = route.params?.cartOptions;
  const [cartOptions, setCartOptions] = useState(initialCartOptions || []);
  const [loading, setLoading] = useState(!initialCartOptions || initialCartOptions.length === 0);

  useEffect(() => {
    if (!initialCartOptions || initialCartOptions.length === 0) {
      const getCartOptions = async () => {
        setLoading(true);
        try {
          const userId = await AsyncStorage.getItem('userId');
          if (!userId) return;
          const response = await fetchBestCart(userId);
          setCartOptions(response.data);
        } catch (error) {
          console.error('Error fetching cart options:', error);
        } finally {
          setLoading(false);
        }
      };
      getCartOptions();
    }
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.89}
      onPress={() =>
        navigation.navigate('CartDetail', {
          products: item.products,
          superId: item.superId,
          totalCost: item.totalCost,
          missingProducts: item.missingProducts || [],
        })
      }
    >
      <View style={styles.cardRow}>
        {/* תמונה או אימוג'י */}
        {item.superImage ? (
          <Image source={{ uri: item.superImage }} style={styles.marketImg} />
        ) : (
          <View style={styles.marketImgEmoji}><Text style={{ fontSize: 36 }}>🏪</Text></View>
        )}

        <View style={styles.cardBody}>
          <Text style={styles.marketTitle} numberOfLines={1}>
            {item.superId.replace(/-/g, ' ')}
          </Text>
          <Text style={styles.marketSubtitle}>
            The best prices from this supermarket
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Text style={styles.priceTotal}>₪{item.totalCost.toFixed(2)}</Text>
            <Text style={styles.deliveryText}>Delivery: ₪{item.deliveryPrice}</Text>
          </View>
          {item.missingProducts && item.missingProducts.length > 0 && (
            <Text style={styles.missingText}>
              {item.missingProducts.length} missing item{item.missingProducts.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loaderText}>Finding the best supermarkets for you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerIconBox}>
          <Text style={{ fontSize: 26 }}>🛒</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Supermarket Options</Text>
          <Text style={styles.headerSubtitle}>
            Choose your favorite supermarket and review your cart
          </Text>
        </View>
      </View>

      {/* רשימת סופרים */}
      {cartOptions.length === 0 ? (
        <View style={styles.emptyStateWrap}>
          <Text style={styles.emptyStateText}>No supermarkets found.</Text>
          <Text style={styles.emptyStateSubText}>
            We couldn't find any cart options for your list. Try updating your list and searching again!
          </Text>
        </View>
      ) : (
        <FlatList
          data={cartOptions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default CartOptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    paddingHorizontal: width < 400 ? 8 : 18,
    paddingTop: width < 400 ? 14 : 28,
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 22,
    marginTop: 8,
    marginBottom: 15,
    padding: 12,
    width: "99%",
    alignSelf: "center",
    minHeight: 61,
    shadowColor: "#2563eb33",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 11,
    elevation: 7,
  },
  headerIconBox: {
    backgroundColor: "#2563eb",
    width: 44,
    height: 44,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    shadowColor: "#2563eb",
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 17.2,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: "#6487b0",
    fontWeight: "500",
    opacity: 0.85,
    marginLeft: 1,
    marginTop: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: width < 400 ? 13 : 16,
    marginBottom: width < 400 ? 10 : 15,
    shadowColor: "#2563eb0a",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f3fa",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  marketImg: {
    width: 54,
    height: 54,
    borderRadius: 11,
    backgroundColor: "#eaf3ff",
    marginRight: 13,
    resizeMode: "cover",
  },
  marketImgEmoji: {
    width: 54,
    height: 54,
    borderRadius: 11,
    backgroundColor: "#f6f8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  marketTitle: {
    fontSize: 15.7,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 1,
    textTransform: "capitalize",
  },
  marketSubtitle: {
    fontSize: 12.3,
    color: "#415c78",
    fontWeight: "500",
    opacity: 0.78,
    marginBottom: 1,
    marginLeft: 2,
  },
  priceTotal: {
    fontSize: 15.5,
    color: "#36ad55",
    fontWeight: "700",
    marginRight: 12,
  },
  deliveryText: {
    fontSize: 12.3,
    color: "#2563eb",
    fontWeight: "600",
    backgroundColor: "#eaf3ff",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  missingText: {
    marginTop: 6,
    fontSize: 12,
    color: "#e54349",
    fontWeight: "600",
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 110,
    backgroundColor: "#f5f7fb",
  },
  loaderText: {
    marginTop: 18,
    fontSize: 16.5,
    color: "#2563eb",
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.92,
  },
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    width: '100%',
  },
  emptyStateText: {
    fontSize: 16.2,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 13.3,
    color: '#8fa0b7',
    opacity: 0.85,
    textAlign: 'center',
    maxWidth: 260,
  },
});
