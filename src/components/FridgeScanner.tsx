// FridgeScanner.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
} from "react-native";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState<FridgeItem["unit"]>("gram");

  const fetchFridge = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/fridge");
      setItems(res.data.items || []);
    } catch {
      Alert.alert("Error", "Failed to load fridge items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) fetchFridge();
  }, [expanded]);

  const handleSelectImages = () => {
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
    } catch {
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
    } catch {
      Alert.alert("Error", "Could not add item");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (idx: number) => {
    const item = items[idx];
    setEditingIndex(idx);
    setEditName(item.name);
    setEditQuantity(String(item.quantity));
    setEditUnit(item.unit);
    setModalVisible(true);
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
      closeModal();
    } catch {
      Alert.alert("Error", "Could not update item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item: FridgeItem) => {
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
            } catch {
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

  const handleClearAll = () => {
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
            } catch {
              Alert.alert("Error", "Could not clear fridge");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingIndex(null);
    setEditName("");
    setEditQuantity("");
    setEditUnit("gram");
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Text style={styles.headerText}>Scan Your Fridge</Text>
        <Icon name={expanded ? "chevron-up" : "chevron-down"} size={27} color="#2563eb" />
      </TouchableOpacity>

      {expanded && (
        <>
          {/* AI Scan */}
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleSelectImages}
            activeOpacity={0.8}
            disabled={scanning || loading}
          >
            <Icon name="camera-image" size={22} color="#2563eb" />
            <Text style={styles.scanButtonText}>Upload / Take Photos</Text>
          </TouchableOpacity>
          <FlatList
            data={selectedImages}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) =>
              item.uri && (
                <Image source={{ uri: item.uri }} style={styles.thumb} />
              )
            }
            style={{ minHeight: 56, marginVertical: 8 }}
          />

          {(loading || scanning) && (
            <View style={styles.spinnerRow}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.spinnerText}>
                {scanning ? "Detecting items..." : "Working..."}
              </Text>
            </View>
          )}

          {!loading && !scanning && (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Your Fridge Items</Text>
                <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
                  <Icon name="delete-outline" size={20} color="#e54349" />
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {items.length === 0 && (
                <Text style={styles.emptyText}>
                  No items yet. Scan your fridge or add manually!
                </Text>
              )}

              {items.map((item, idx) => (
                <View key={idx} style={styles.itemCard}>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.detail}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => openEdit(idx)} style={styles.iconBtn}>
                    <Icon name="pencil" size={20} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    style={[styles.iconBtn, styles.deleteBtn]}
                  >
                    <Icon name="delete" size={20} color="#e54349" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Manual Add */}
              <View style={styles.addRow}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Name"
                  style={styles.input}
                />
                <TextInput
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  placeholder="Qty"
                  keyboardType="numeric"
                  style={[styles.input, styles.qtyInput]}
                />
                <View style={styles.unitsRow}>
                  {ALLOWED_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitBtn,
                        editUnit === u && styles.unitBtnActive,
                      ]}
                      onPress={() => setEditUnit(u)}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          editUnit === u && styles.unitTextActive,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={handleAddItem} style={styles.addBtn}>
                  <Icon name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Edit Modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
          >
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.backdrop} />
            </TouchableWithoutFeedback>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Item</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Name"
                  style={styles.modalInput}
                />
                <TextInput
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  placeholder="Qty"
                  keyboardType="numeric"
                  style={[styles.modalInput, styles.qtyInput]}
                />
                <View style={styles.unitsRow}>
                  {ALLOWED_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitBtn,
                        editUnit === u && styles.unitBtnActive,
                      ]}
                      onPress={() => setEditUnit(u)}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          editUnit === u && styles.unitTextActive,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={handleSaveEdit} style={styles.saveBtn}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "98%",
    maxWidth: 450,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#2563eb22",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#eaf3ff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    color: "#2563eb",
    fontWeight: "800",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edf3ff",
    borderRadius: 15,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: "#dbeafe",
  },
  scanButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#2563eb",
  },
  thumb: {
    width: 55,
    height: 55,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e0eefd",
  },
  spinnerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  spinnerText: {
    marginLeft: 6,
    color: "#2563eb",
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2563eb",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f4cccc",
    backgroundColor: "#fff0f0",
  },
  clearText: {
    marginLeft: 4,
    color: "#e54349",
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    color: "#6c7792",
    marginVertical: 6,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7faff",
    borderRadius: 17,
    padding: 14,
    marginVertical: 6,
    elevation: 2,
  },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    textTransform: "capitalize",
  },
  detail: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "500",
    color: "#4b6584",
    opacity: 0.7,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#edf3ff",
    borderWidth: 1,
    borderColor: "#e4f0fd",
  },
  deleteBtn: {
    backgroundColor: "#fff0f0",
    borderColor: "#f4cccc",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5faff",
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0eefd",
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdcff",
    padding: 8,
    marginHorizontal: 4,
    fontWeight: "700",
  },
  qtyInput: { width: 50, textAlign: "center" },
  unitsRow: {
    flexDirection: "row",
    marginHorizontal: 4,
  },
  unitBtn: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
    backgroundColor: "#f7faff",
  },
  unitBtnActive: {
    backgroundColor: "#2563eb",
  },
  unitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  unitTextActive: {
    color: "#fff",
  },
  addBtn: {
    marginLeft: 6,
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 12,
    elevation: 2,
  },

  // Modal styles
  backdrop: {
    flex: 1,
    backgroundColor: "#00000066",
  },
  modalContainer: {
    position: "absolute",
    top: "25%",
    left: "5%",
    right: "5%",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    color: "#2563eb",
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    padding: 10,
    fontWeight: "700",
    marginVertical: 6,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e54349",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelText: {
    color: "#e54349",
    fontWeight: "700",
  },
});

export default FridgeScanner;
