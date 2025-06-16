import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { CartStackParamList } from "../navigation/CartStackScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchBestCart } from "../services/cart_service";

const { width } = Dimensions.get("window");

type NavigationProp = StackNavigationProp<CartStackParamList, "CartOptions">;

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

const CartOptionsScreen: React.FC<{ navigation: NavigationProp; route: any }> = ({
  navigation,
  route,
}) => {
  const [cartOptions, setCartOptions] = useState<CartOption[]>(route.params?.cartOptions || []);
  const [loading, setLoading] = useState(cartOptions.length === 0);

  useEffect(() => {
    if (cartOptions.length === 0) {
      (async () => {
        setLoading(true);
        try {
          const userId = await AsyncStorage.getItem("userId");
          if (!userId) return;
          const response = await fetchBestCart(userId);
          setCartOptions(response.data);
        } catch (err) {
          // Handle error (could show an error message)
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  // --- SUPERMARKET CARD ---
  const renderItem = ({ item }: { item: CartOption }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() =>
        navigation.navigate("CartDetail", {
          products: item.products,
          superId: item.superId,
          totalCost: item.totalCost,
          missingProducts: item.missingProducts || [],
        })
      }
    >
      <View style={styles.row}>
        {item?.superImage ? (
          <Image source={{ uri: item.superImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 36 }}>🏪</Text>
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.superText}>{item.superId.replace(/-/g, " ")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 1 }}>
            <Text style={styles.priceText}>Total: ₪{item.totalCost.toFixed(2)}</Text>
            <Text style={styles.deliveryText}>
              {"  "}
              <Icon name="truck-fast-outline" size={15} color="#7b9fe7" />
              {"  "}Delivery: ₪{item.deliveryPrice}
            </Text>
          </View>
          {item.missingProducts && item.missingProducts.length > 0 && (
            <View style={styles.missingBox}>
              <Icon name="alert-circle-outline" size={16} color="#ffb300" />
              <Text style={styles.missingText}>
                {item.missingProducts.length} missing item
                {item.missingProducts.length > 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- LOADER ---
  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        {/* Animated spinning cart icon */}
        <Icon
          name="cart-outline"
          size={52}
          color="#2563eb"
          style={{ marginBottom: 9, transform: [{ rotate: "22deg" }] }}
        />
        <ActivityIndicator size="large" color="#2563eb" style={{ marginBottom: 16 }} />
        <Text style={styles.loadingMainText}>
          We're finding the best deals for you...
        </Text>
        <Text style={styles.loadingSubText}>
          This might take a few seconds. Please wait while we check the best supermarket options nearby!
        </Text>
      </View>
    );
  }

  // --- MAIN ---
  return (
    <View style={styles.container}>
      {/* Header – like all app screens */}
      <View style={styles.headerWrap}>
        <View style={styles.headerIconBox}>
          <Icon name="cart-outline" size={27} color="#fff" />
        </View>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.headerTitle}>Cart Options</Text>
          <Text style={styles.headerSubtitle}>
            Choose your preferred supermarket and see your best cart!
          </Text>
        </View>
      </View>

      <FlatList
        data={cartOptions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 13 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="store-off" size={42} color="#7a8dad" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>No cart options found</Text>
            <Text style={styles.emptySubText}>Try adding more items to your list</Text>
          </View>
        }
      />
    </View>
  );
};

export default CartOptionsScreen;

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e4f0fd",
    paddingTop: 24,
    paddingHorizontal: 0,
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 23,
    marginTop: 9,
    marginBottom: 17,
    padding: 13,
    width: width * 0.97,
    alignSelf: "center",
    minHeight: 59,
    shadowColor: "#2563eb33",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 11,
    elevation: 6,
  },
  headerIconBox: {
    backgroundColor: "#2563eb",
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#3b82f6",
    shadowOpacity: 0.14,
    shadowRadius: 7,
    elevation: 4,
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
    opacity: 0.8,
    marginLeft: 1,
    marginTop: 1,
    textAlign: "left",
    maxWidth: 260,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 13,
    marginBottom: 13,
    padding: 13,
    shadowColor: "#2563eb12",
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eaf3ff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 10,
    backgroundColor: "#eaf3ff",
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eaf3ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  details: {
    flex: 1,
    minHeight: 54,
    justifyContent: "center",
  },
  superText: {
    fontSize: 15.9,
    fontWeight: "800",
    color: "#2363eb",
    marginBottom: 2,
  },
  priceText: {
    fontSize: 14.4,
    color: "#2563eb",
    fontWeight: "bold",
    marginRight: 3,
  },
  deliveryText: {
    fontSize: 12.4,
    color: "#7b9fe7",
    marginLeft: 5,
  },
  missingBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    backgroundColor: "#fffbe9",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
  },
  missingText: {
    color: "#eaa100",
    fontWeight: "bold",
    fontSize: 12.8,
    marginLeft: 4,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e4f0fd",
    paddingHorizontal: 32,
  },
  loadingMainText: {
    fontSize: 17,
    color: "#2563eb",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  loadingSubText: {
    fontSize: 13.5,
    color: "#7b9fe7",
    opacity: 0.93,
    textAlign: "center",
    marginBottom: 2,
    marginTop: 1,
    lineHeight: 19,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    width: "100%",
  },
  emptyText: {
    fontSize: 16.2,
    fontWeight: "600",
    color: "#2563eb",
    marginBottom: 3,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 13.3,
    color: "#8fa0b7",
    opacity: 0.8,
    textAlign: "center",
    maxWidth: 250,
  },
});
