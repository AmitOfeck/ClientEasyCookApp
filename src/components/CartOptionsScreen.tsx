import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartStackParamList } from '../navigation/CartStackScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchBestCart } from '../services/cart_service';

type NavigationProp = StackNavigationProp<CartStackParamList, 'CartOptions'>;

type CartOption = {
  _id: string;
  superId: string;
  superImage: string;
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
  missingProducts?: string[]; // ← שדה אופציונלי
};

type Props = {
  navigation: NavigationProp;
};

const CartOptionsScreen: React.FC<Props> = ({ navigation }) => {
  const [cartOptions, setCartOptions] = useState<CartOption[]>([]);

  useEffect(() => {
    const getCartOptions = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const response = await fetchBestCart(userId);
        setCartOptions(response.data);
      } catch (error) {
        console.error('Error fetching cart options:', error);
      }
    };

    getCartOptions();
  }, []);

  const renderItem = ({ item }: { item: CartOption }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('CartDetail', {
            products: item.products,
            superId: item.superId,
            totalCost: item.totalCost,
            missingProducts: item.missingProducts || [], // ← נשלח גם אם לא קיים (ברירת מחדל לריק)
          })
        }
      >
        <View style={styles.row}>
          {item?.superImage && (
            <Image source={{ uri: item.superImage }} style={styles.image} />
          )}
          <View style={styles.details}>
            <Text style={styles.superText}>{item.superId.replace(/-/g, ' ')}</Text>
            <Text style={styles.priceText}>Total: ₪{item.totalCost.toFixed(2)}</Text>
            <Text style={styles.deliveryText}>delivery fee:{item?.deliveryPrice}</Text>
            {item.missingProducts && item.missingProducts.length > 0 && (
           <Text style={styles.missingSoftNote}>
           {item.missingProducts.length} missing item{item.missingProducts.length > 1 ? 's' : ''}
           </Text>
          )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Cart Options</Text>
      <FlatList
        data={cartOptions}
        keyExtractor={(item) => item._id}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 10,
  },
  details: {
    flex: 1,
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
  deliveryText: {
    marginTop: 6,
    fontSize: 12,
    color: '#444',
    fontStyle: 'italic' 
  },
  missingSoftNote: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280', 
    fontStyle: 'italic',
  },
});
