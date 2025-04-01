import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockCarts = [
  {
    shoppingListId: '67e99907a238f5b5f1df858d',
    superId: 'super-yuda-yehuda-hamacabi',
    totalCost: 90.87,
  },
  {
    shoppingListId: '1234567890',
    superId: 'shufersal-ramat-hasharon',
    totalCost: 85.4,
  },
];

const CartOptionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => {
      // נעבור בהמשך למסך CartDetailScreen
      console.log("Selected super:", item.superId);
    }}>
      <Text style={styles.superText}>{item.superId.replace(/-/g, ' ')}</Text>
      <Text style={styles.priceText}>Total: ₪{item.totalCost.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Nearby Supermarkets</Text>
      <FlatList
        data={mockCarts}
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
