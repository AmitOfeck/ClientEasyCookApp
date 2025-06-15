import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import dishPlaceholder from "../assets/dish.png";
import { getFullImageUrl } from "../utils/getFullImageUrl";

type Props = {
  dish: any;
  onInfoPress: () => void;
  onAddPress: () => void;
};

export const DishCard: React.FC<Props> = ({ dish, onInfoPress, onAddPress }) => (
  <View style={styles.card}>
    <Image
      source={
        dish.imageUrl
          ? { uri: getFullImageUrl(dish.imageUrl) }
          : dishPlaceholder
      }
      style={styles.image}
      resizeMode="cover"
    />
    <View style={styles.info}>
      <View style={styles.rowSpaceBetween}>
        <Text style={styles.title}>{dish.name}</Text>
        <Text style={styles.price}>₪{dish.price}</Text>
      </View>
      <Text style={styles.details} numberOfLines={2}>{dish.details || "No details available"}</Text>
      <View style={styles.tagRow}>
        <Text style={[styles.tag, { backgroundColor: "#e8f2ff" }]}>{dish.level}</Text>
        <Text style={[styles.tag, { backgroundColor: "#fce3d8" }]}>{dish.cuisine}</Text>
        <Text style={[styles.tag, { backgroundColor: "#f3efd8" }]}>{dish.limitation.replace("_", " ")}</Text>
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.calories}>🔥 {dish.dishCalories} kcal</Text>
        <View style={styles.iconActions}>
          <TouchableOpacity onPress={onInfoPress} style={styles.iconBtn}>
            <Icon name="information-outline" size={22} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onAddPress} style={styles.iconBtn}>
            <Icon name="clipboard-list-outline" size={22} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    width: "98%",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: 22,
    marginBottom: 18,
    alignItems: "center",
    padding: 10,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius: 20,
    elevation: 7,
    alignSelf: "center",
    gap: 7,
  },
  image: {
    width: 85,
    height: 85,
    borderRadius: 16,
    marginRight: 11,
    backgroundColor: "#e4f0fd",
    borderWidth: 1,
    borderColor: "#eaf3ff",
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
    gap: 3,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15.7,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.07,
    flex: 1,
    marginRight: 5,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#18bb53",
    marginLeft: 4,
  },
  details: {
    fontSize: 12.3,
    color: "#7b88a2",
    marginTop: 1,
    marginBottom: 1,
    fontWeight: "500",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
    marginBottom: 4,
  },
  tag: {
    fontSize: 11.5,
    color: "#395782",
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 3,
    opacity: 0.82,
    overflow: "hidden",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calories: {
    fontSize: 11,
    color: "#ffba33",
    fontWeight: "600",
  },
  iconActions: {
    flexDirection: "row",
    gap: 9,
  },
  iconBtn: {
    backgroundColor: "#e4f0fd",
    borderRadius: 50,
    padding: 7,
    marginLeft: 2,
    shadowColor: "#bcd7f8",
    shadowOpacity: 0.09,
    shadowRadius: 5,
    elevation: 2,
  },
});
