import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Image, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary, Asset } from "react-native-image-picker";
import apiClient from "../services/api-client";

type DetectedItem = { name: string; unit: string; quantity: number };

const FridgeScanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);

  const handleSelectImages = async () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 3,
      },
      async (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert("Error", "Could not open image picker");
          return;
        }
        if (!response.assets) return;
        setSelectedImages(response.assets);
        await handleScanFridge(response.assets);
      }
    );
  };

  const handleScanFridge = async (images: Asset[]) => {
    if (!images.length) return;
    try {
      setLoading(true);
      const formData = new FormData();
      images.forEach((img, i) => {
        formData.append("images", {
          uri: img.uri!,
          name: img.fileName || `fridge-${i}.jpg`,
          type: img.type || "image/jpeg",
        } as any);
      });

      const res = await apiClient.post("/fridge/ai-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDetectedItems(res.data?.items || []);
    } catch (e) {
      Alert.alert("Error", "Failed to scan fridge.");
      setDetectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header with toggle */}
      <TouchableOpacity
        style={styles.cardHeaderRow}
        onPress={() => setExpanded((x) => !x)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardHeaderText}>Scan Your Fridge</Text>
        <Icon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={27}
          color="#2563eb"
        />
      </TouchableOpacity>

      {expanded && (
        <View>
          {/* Pick images button */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectImages}
            activeOpacity={0.82}
            disabled={loading}
          >
            <Icon name="camera-image" size={22} color="#2563eb" />
            <Text style={styles.selectButtonText}>Upload/Take Photos</Text>
          </TouchableOpacity>

          {/* Selected images thumbnails */}
          <FlatList
            data={selectedImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => idx + ""}
            renderItem={({ item }) =>
              item.uri ? (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.imageThumb}
                  resizeMode="cover"
                />
              ) : null
            }
            contentContainerStyle={{ marginVertical: 9 }}
            style={{ minHeight: 56 }}
          />

          {/* Loading spinner */}
          {loading && (
            <View style={{ alignItems: "center", marginTop: 7 }}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={{ color: "#2563eb", fontWeight: "bold" }}>
                Detecting items...
              </Text>
            </View>
          )}

          {/* Detected Items */}
          {!loading && detectedItems.length > 0 && (
            <View style={{ marginTop: 7 }}>
              <Text style={styles.detectedTitle}>Detected in fridge:</Text>
              {detectedItems.map((item, idx) => (
                <View style={styles.itemRow} key={idx}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetail}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (כמו מקודם)
  card: {
    width: "95%",
    maxWidth: 440,
    backgroundColor: "#f7faff",
    borderRadius: 23,
    paddingVertical: 9,
    paddingHorizontal: 17,
    marginVertical: 8,
    shadowColor: "#2563eb22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 15,
    elevation: 7,
    alignSelf: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    marginBottom: 2,
  },
  cardHeaderText: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "bold",
    marginLeft: 3,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 13,
    paddingVertical: 9,
    paddingHorizontal: 19,
    marginVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#d2e6fd",
    shadowColor: "#2563eb18",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  selectButtonText: {
    color: "#2563eb",
    fontWeight: "700",
    marginLeft: 7,
    fontSize: 15.1,
  },
  imageThumb: {
    width: 48,
    height: 48,
    borderRadius: 9,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#e0eefd",
    backgroundColor: "#eaf3ff",
  },
  detectedTitle: {
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 5,
    marginBottom: 1,
    fontSize: 14.5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 1,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  itemName: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 13.9,
    flex: 1,
  },
  itemDetail: {
    color: "#839ab6",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 7,
    minWidth: 52,
    textAlign: "right",
  },
});

export default FridgeScanner;
