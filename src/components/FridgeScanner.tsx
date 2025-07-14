import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Image, Alert, TextInput,} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { launchImageLibrary, Asset } from "react-native-image-picker";
import apiClient from "../services/api-client";

type FridgeItem = { name: string; unit: string; quantity: number };

const ALLOWED_UNITS = ["gram", "kg", "ml", "liter"] as const;

const FridgeScanner: React.FC<{ expanded: boolean; setExpanded: (val: boolean) => void }> = ({
  expanded,
  setExpanded,
}) => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState<FridgeItem["unit"]>("gram");

  const fetchFridge = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/fridge");
      setItems(res.data.items || []);
    } catch (e) {
      Alert.alert("Error", "Failed to load fridge items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) fetchFridge();
  }, [expanded]);

  const handleSelectImages = async () => {
    launchImageLibrary(
      { mediaType: "photo", selectionLimit: 3 },
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
      setScanning(true);
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
      setItems(res.data?.items || []);
      setSelectedImages([]);
      Alert.alert("Success", "Fridge analyzed successfully!");
    } catch (e: any) {
      Alert.alert("Error", "Failed to scan fridge (AI).");
    } finally {
      setScanning(false);
    }
  };

  const handleAddItem = async () => {
    if (!editName.trim() || !editQuantity.trim()) {
      Alert.alert("Please enter a name and quantity");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: editName.trim(),
        unit: editUnit,
        quantity: Number(editQuantity),
      };
      const res = await apiClient.post("/fridge/item", payload);
      setItems(res.data.items || []);
      setEditName("");
      setEditQuantity("");
      setEditUnit("gram");
    } catch (e) {
      Alert.alert("Error", "Could not add item");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (idx: number) => {
    setEditingIndex(idx);
    setEditName(items[idx].name);
    setEditQuantity(String(items[idx].quantity));
    setEditUnit(items[idx].unit);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null) return;
    try {
      setLoading(true);
      const original = items[editingIndex];
      const payload = {
        originalName: original.name,
        originalUnit: original.unit,
        item: {
          name: editName.trim(),
          unit: editUnit,
          quantity: Number(editQuantity),
        },
      };
      const res = await apiClient.put("/fridge/item", payload);
      setItems(res.data.items || []);
      setEditingIndex(null);
      setEditName("");
      setEditQuantity("");
      setEditUnit("gram");
    } catch (e) {
      Alert.alert("Error", "Could not update item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item: FridgeItem) => {
    Alert.alert(
      "Delete",
      `Remove ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await apiClient.delete("/fridge/item", {
                data: { name: item.name, unit: item.unit },
              });
              setItems(res.data.items || []);
            } catch (e: any) {
              Alert.alert("Error", "Could not delete item");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      "Clear Fridge",
      "Are you sure you want to remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await apiClient.put("/fridge/clear");
              setItems(res.data.items || []);
            } catch (e) {
              Alert.alert("Error", "Could not clear fridge");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };


  return (
    <View style={styles.card}>
      {/* Header with toggle */}
      <TouchableOpacity
        style={styles.cardHeaderRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardHeaderText}>Scan Your Fridge</Text>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={27} color="#2563eb" />
      </TouchableOpacity>

      {expanded && (
        <>
          {/* --- AI Scan Button --- */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handleSelectImages}
            activeOpacity={0.82}
            disabled={scanning || loading}
          >
            <Icon name="camera-image" size={22} color="#2563eb" />
            <Text style={styles.selectButtonText}>Upload/Take Photos</Text>
          </TouchableOpacity>
          {/* --- Thumbnails (selected images) --- */}
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

          {/* --- Loading spinner --- */}
          {(loading || scanning) && (
            <View style={{ alignItems: "center", marginTop: 7 }}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={{ color: "#2563eb", fontWeight: "bold" }}>
                {scanning ? "Detecting items..." : "Working..."}
              </Text>
            </View>
          )}

          {/* --- Items List --- */}
          {!loading && !scanning && (
            <>
              <View style={styles.editWrap}>
                <Text style={styles.detectedTitle}>Detected/Your Fridge:</Text>
                <TouchableOpacity style={styles.clearAllBtn} onPress={handleClearAll}>
                  <Icon name="delete-outline" color="#e54349" size={19} />
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {items.length === 0 && (
                <Text style={{ color: "#6c7792", fontSize: 14, marginVertical: 6 }}>
                  No items yet. Scan your fridge or add manually!
                </Text>
              )}
              {items.map((item, idx) =>
                editingIndex === idx ? (
                  <View style={styles.editRow} key={idx}>
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      style={styles.input}
                      placeholder="Name"
                    />
                    <TextInput
                      value={editQuantity}
                      onChangeText={setEditQuantity}
                      style={styles.inputSmall}
                      placeholder="Qty"
                      keyboardType="numeric"
                    />
                    <View style={styles.unitWrap}>
                      {ALLOWED_UNITS.map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitBtn,
                            editUnit === unit && styles.unitBtnSelected,
                          ]}
                          onPress={() => setEditUnit(unit)}
                        >
                          <Text
                            style={[
                              styles.unitBtnText,
                              editUnit === unit && styles.unitBtnTextSelected,
                            ]}
                          >
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity onPress={handleSaveEdit} style={styles.saveBtn}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEditingIndex(null)}
                      style={styles.cancelBtn}
                    >
                      <Icon name="close" color="#e54349" size={20} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.itemRow} key={idx}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetail}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editIcon}
                      onPress={() => openEdit(idx)}
                    >
                      <Icon name="pencil" size={19} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteIcon}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Icon name="delete" size={19} color="#e54349" />
                    </TouchableOpacity>
                  </View>
                )
              )}

              {/* --- Add Manually --- */}
              <View style={styles.addRow}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  style={styles.input}
                  placeholder="Name"
                />
                <TextInput
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  style={styles.inputSmall}
                  placeholder="Qty"
                  keyboardType="numeric"
                />
                <View style={styles.unitWrap}>
                  {ALLOWED_UNITS.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitBtn,
                        editUnit === unit && styles.unitBtnSelected,
                      ]}
                      onPress={() => setEditUnit(unit)}
                    >
                      <Text
                        style={[
                          styles.unitBtnText,
                          editUnit === unit && styles.unitBtnTextSelected,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={handleAddItem} style={styles.addBtn}>
                  <Icon name="plus" color="#fff" size={19} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginVertical: 2,
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: "#e4f0fd",
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
  editIcon: {
    marginLeft: 5,
    padding: 2,
  },
  deleteIcon: {
    marginLeft: 3,
    padding: 2,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
    paddingVertical: 7,
    gap: 5,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    marginBottom: 1,
    gap: 4,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#e4f0fd",
  },
  editWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 7,
    marginBottom: 0,
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8b2b4",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  clearAllText: {
    color: "#e54349",
    fontWeight: "700",
    fontSize: 13.2,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c5dbfc",
    borderRadius: 9,
    padding: 6,
    fontSize: 14,
    marginHorizontal: 4,
    minWidth: 78,
    textAlign: "left",
    backgroundColor: "#fff",
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: "#c5dbfc",
    borderRadius: 9,
    padding: 6,
    fontSize: 14,
    marginHorizontal: 4,
    width: 50,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  unitWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginLeft: 3,
  },
  unitBtn: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginHorizontal: 1,
    backgroundColor: "#eaf3ff",
  },
  unitBtnSelected: {
    backgroundColor: "#2563eb",
  },
  unitBtnText: {
    color: "#2563eb",
    fontSize: 13.2,
    fontWeight: "600",
  },
  unitBtnTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveBtn: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14.2,
  },
  cancelBtn: {
    marginLeft: 2,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e54349",
  },
  addBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 9,
    padding: 8,
    marginLeft: 8,
  },
});

export default FridgeScanner;
