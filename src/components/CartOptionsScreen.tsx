import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBestCart } from '../services/cart_service';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = StackNavigationProp<CartStackParamList, 'CartOptions'>;

type CartOption = {
  _id: string;
  superId: string;
  superImage?: string;
  totalCost: number;
  deliveryPrice: number;
  products: {
    itemId: string;
    name: string;
    unit_info: string;
    image_url: string;
    price: number;
    quantity: number;
  }[];
  missingProducts?: string[];
};

type Props = {
  navigation: NavigationProp;
};

const CartOptionsScreen: React.FC<Props> = ({ navigation }) => {
  const [cartOptions, setCartOptions] = useState<CartOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCartOptions = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          setCartOptions([]);
          setLoading(false);
          return;
        }
        const response = await fetchBestCart(userId);
        setCartOptions(response.data || []);
      } catch (error) {
        setCartOptions([]);
        console.error('Error fetching cart options:', error);
      } finally {
        setLoading(false);
      }
    };

    getCartOptions();
  }, []);

  const renderSuperImage = (superImage?: string) => {
    if (superImage) {
      return (
        <Image
          source={{ uri: superImage }}
          style={styles.image}
        />
      );
    } else {
      // Modern emoji style
      return (
        <View style={styles.emojiBox}>
          <Text style={styles.emojiText}>🏪</Text>
        </View>
      );
    }
  };

  const renderItem = ({ item }: { item: CartOption }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('CartDetail', {
          products: item.products,
          superId: item.superId,
          totalCost: item.totalCost,
          missingProducts: item.missingProducts || [],
        })
      }
    >
      <View style={styles.row}>
        {renderSuperImage(item.superImage)}
        <View style={styles.details}>
          <Text style={styles.superText} numberOfLines={1}>
            {item.superId.replace(/-/g, ' ')}
          </Text>
          <View style={styles.priceRow}>
            <View style={styles.priceSubRow}>
              <Icon name="cart-outline" color="#2563eb" size={15} style={{marginRight:3}} />
              <Text style={styles.priceText}>₪{item.totalCost.toFixed(2)}</Text>
            </View>
            <View style={styles.priceSubRow}>
              <Icon name="truck-delivery-outline" color="#36ad55" size={15} style={{marginRight:3}} />
              <Text style={styles.deliveryText}>₪{item.deliveryPrice}</Text>
            </View>
          </View>
          {item.missingProducts && item.missingProducts.length > 0 && (
            <View style={styles.missingRow}>
              <Icon name="alert-circle-outline" color="#e54349" size={13} />
              <Text style={styles.missingText}>
                {item.missingProducts.length} missing item{item.missingProducts.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- empty state ---
  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }
  if (!cartOptions.length) {
    return (
      <View style={styles.container}>
        <View style={styles.headerWrap}>
          <View style={styles.headerIconBox}>
            <Icon name="cart-outline" size={26} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Cart Options</Text>
            <Text style={styles.headerSubtitle}>
              Review supermarkets for your shopping list and compare prices and delivery!
            </Text>
          </View>
        </View>
        <View style={styles.emptyStateWrap}>
          <Icon name="store-remove-outline" size={42} color="#2563eb" style={{ marginBottom: 9 }} />
          <Text style={styles.emptyText}>No supermarkets found for your list.</Text>
          <Text style={styles.emptySubText}>
            Try changing your shopping list or checking your location.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerIconBox}>
          <Icon name="cart-outline" size={26} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Cart Options</Text>
          <Text style={styles.headerSubtitle}>
            Review supermarkets for your shopping list and compare prices and delivery!
          </Text>
        </View>
      </View>
      {/* List */}
      <FlatList
        data={cartOptions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 22 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CartOptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4f0fd',
    paddingTop: Platform.OS === 'ios' ? 7 : 4,
    paddingHorizontal: 0,
  },
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf3ff',
    borderRadius: 20,
    marginTop: 15,
    marginBottom: 20,
    padding: 13,
    width: '93%',
    alignSelf: 'center',
    minHeight: 62,
    shadowColor: '#2563eb33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 7,
    gap: 12,
  },
  headerIconBox: {
    backgroundColor: '#2563eb',
    width: 45,
    height: 45,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#2563eb',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18.8,
    fontWeight: '800',
    color: '#2563eb',
    marginBottom: 2,
    letterSpacing: 0.05,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#6487b0',
    fontWeight: '500',
    opacity: 0.86,
    marginTop: 1,
    maxWidth: 240,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 15,
    padding: 15,
    marginHorizontal: 13,
    shadowColor: '#2563eb15',
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e6ebf6',
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#eaf3ff',
    resizeMode: 'cover',
  },
  emojiBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#eaf3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 28,
    marginTop: Platform.OS === 'ios' ? 1 : 0,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  superText: {
    fontSize: 16.1,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 3,
    letterSpacing: 0.04,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 2,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  priceSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginRight: 10,
  },
  priceText: {
    fontSize: 14.7,
    color: '#222',
    fontWeight: '700',
  },
  deliveryText: {
    fontSize: 13.9,
    color: '#36ad55',
    fontWeight: '700',
  },
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  missingText: {
    fontSize: 12.8,
    color: '#e54349',
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 58,
  },
  emptyText: {
    color: '#2563eb',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#7a8dad',
    fontSize: 13.5,
    textAlign: 'center',
    maxWidth: 260,
    opacity: 0.86,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e4f0fd',
  },
});
