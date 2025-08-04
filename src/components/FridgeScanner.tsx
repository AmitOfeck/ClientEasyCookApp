import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  launchImageLibrary,
  launchCamera,
  Asset,
  ImageLibraryOptions,
  CameraOptions,
} from "react-native-image-picker";
import apiClient from "../services/api-client";

type FridgeItem = { name: string; unit: string; quantity: number };
const ALLOWED_UNITS = ["gram", "kg", "ml", "liter"] as const;
const SCREEN_WIDTH = Dimensions.get("window").width;

interface Props {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  useFridgeItems: boolean;
  setUseFridgeItems: (val: boolean) => void;
}

const FridgeScanner: React.FC<Props> = ({
  expanded,
  setExpanded,
  useFridgeItems,
  setUseFridgeItems,
}) => {
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState<FridgeItem["unit"]>("gram");

  // When expanded, fetch the current fridge items
  useEffect(() => {
    if (expanded) fetchFridge();
  }, [expanded]);

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

  // Prompt user to choose between library or camera
  const openPickerOptions = () => {
    Alert.alert(
      "Add Photos",
      "Choose images from library or take a new photo",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Library", onPress: selectImages },
        { text: "Camera", onPress: takePhoto },
      ]
    );
  };

  // Launch image library allowing multiple selection
  const selectImages = () => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      selectionLimit: 0, // 0 = unlimited
    };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", "Could not open image picker");
        return;
      }
      if (response.assets?.length) {
        await scanFridge(response.assets);
      }
    });
  };

  // Launch camera to take a photo
  const takePhoto = () => {
    const options: CameraOptions = { mediaType: "photo", saveToPhotos: true };
    launchCamera(options, async (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", "Could not open camera");
        return;
      }
      if (response.assets?.[0]) {
        await scanFridge(response.assets);
      }
    });
  };

  // Send images to backend for AI scanning
  const scanFridge = async (images: Asset[]) => {
    try {
      setScanning(true);
      const formData = new FormData();
      images.forEach((img, i) =>
        formData.append("images", {
          uri: img.uri!,
          name: img.fileName || `fridge-${i}.jpg`,
          type: img.type || "image/jpeg",
        } as any)
      );
      const res = await apiClient.post("/fridge/ai-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setItems(res.data.items || []);
    } catch {
      Alert.alert("Error", "Failed to scan fridge");
    } finally {
      setScanning(false);
    }
  };

  // Add a new manual item
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

  // Open modal to edit an existing item
  const openEdit = (idx: number) => {
    const it = items[idx];
    setEditingIndex(idx);
    setEditName(it.name);
    setEditQuantity(String(it.quantity));
    setEditUnit(it.unit);
    setModalVisible(true);
  };

  // Save edited item
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

  // Delete an item
  const handleDeleteItem = (item: FridgeItem) => {
    Alert.alert(
      "Delete Item",
      `Remove "${item.name}"?`,
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

  // Clear all items
  const handleClearAll = () => {
    Alert.alert(
      "Clear All Items",
      "This will remove every item in your fridge. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, clear",
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

  // Close the edit modal and reset state
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
        style={styles.cardHeaderRow}
        onPress={() => setExpanded(!expanded)}
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
        <>
          {/* Toggle: use fridge items or not */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Use fridge items</Text>
            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                useFridgeItems ? styles.toggleOn : styles.toggleOff,
              ]}
              onPress={() => setUseFridgeItems(!useFridgeItems)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  useFridgeItems ? styles.thumbOn : styles.thumbOff,
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* Upload / Camera */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={openPickerOptions}
            disabled={scanning || loading}
            activeOpacity={0.85}
          >
            <Icon name="camera-plus" size={20} color="#2563eb" />
            <Text style={styles.selectButtonText}>
              Upload Images / Take Photo
            </Text>
          </TouchableOpacity>

          {/* Loading spinner */}
          {(loading || scanning) && (
            <View style={styles.spinnerRow}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.spinnerText}>
                {scanning ? "Scanning..." : "Processing..."}
              </Text>
            </View>
          )}

          {/* Items list & manual add */}
          {!loading && !scanning && (
            <>
              {/* List header */}
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Your Fridge Items</Text>
                <TouchableOpacity
                  style={styles.clearAllBtn}
                  onPress={handleClearAll}
                >
                  <Icon name="delete-outline" size={18} color="#e54349" />
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              {/* Empty state */}
              {items.length === 0 ? (
                <Text style={styles.emptyText}>
                  No items yet. Add via upload or manually!
                </Text>
              ) : (
                items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQty}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => openEdit(idx)}
                      style={styles.iconBtn}
                    >
                      <Icon name="pencil-outline" size={18} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item)}
                      style={[styles.iconBtn, styles.iconDelete]}
                    >
                      <Icon
                        name="trash-can-outline"
                        size={18}
                        color="#e54349"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Manual add row */}
              <View style={styles.addRow}>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Name"
                  style={styles.input}
                  placeholderTextColor="#415c78"
                />
                <TextInput
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  placeholder="Qty"
                  keyboardType="numeric"
                  style={[styles.input, styles.qtyInput]}
                  placeholderTextColor="#415c78"
                />
                <View style={styles.unitsRow}>
                  {ALLOWED_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitBtn,
                        editUnit === u && styles.unitBtnSelected,
                      ]}
                      onPress={() => setEditUnit(u)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.unitBtnText,
                          editUnit === u && styles.unitBtnTextSelected,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={handleAddItem} style={styles.addBtn}>
                  <Icon name="plus" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Edit modal */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
          >
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Item</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Name"
                  style={styles.modalInput}
                  placeholderTextColor="#415c78"
                />
                <TextInput
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  style={[styles.modalInput, styles.qtyInputModal]}
                  placeholderTextColor="#415c78"
                />
                <View style={styles.unitsRowCentered}>
                  {ALLOWED_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitBtn,
                        editUnit === u && styles.unitBtnSelected,
                      ]}
                      onPress={() => setEditUnit(u)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.unitBtnText,
                          editUnit === u && styles.unitBtnTextSelected,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                    <Text style={styles.saveText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
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
    width: "95%",
    maxWidth: 440,
    backgroundColor: "#f7faff",
    borderRadius: 23,
    paddingVertical: 10,
    paddingHorizontal: 16,
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
  },
  cardHeaderText: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "bold",
  },

  // Toggle switch row
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  toggleLabel: {
    fontSize: 15,
    color: "#415c78",
    fontWeight: "600",
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: "#2563eb" },
  toggleOff: { backgroundColor: "#d1d5db" },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  thumbOn: { alignSelf: "flex-end" },
  thumbOff: { alignSelf: "flex-start" },

  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3ff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  selectButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
  },

  spinnerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  spinnerText: {
    marginLeft: 6,
    color: "#2563eb",
    fontWeight: "600",
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f4cccc",
  },
  clearAllText: {
    marginLeft: 4,
    color: "#e54349",
    fontWeight: "700",
  },

  emptyText: {
    textAlign: "center",
    color: "#415c78",
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.8,
    marginVertical: 12,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
    }),
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    textTransform: "capitalize",
  },
  itemQty: {
    marginTop: 2,
    fontSize: 13,
    color: "#415c78",
  },

  iconBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: "#edf3ff",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  iconDelete: {
    backgroundColor: "#fff0f0",
    borderColor: "#f4cccc",
  },

  addRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7faff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff",
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdcff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  qtyInput: {
    width: 50,
    textAlign: "center",
  },

  unitsRow: {
    flexDirection: "row",
    marginRight: 6,
  },
  unitsRowCentered: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginVertical: 12,
  },
  unitBtn: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: "#f7faff",
  },
  unitBtnSelected: {
    backgroundColor: "#2563eb",
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  unitBtnTextSelected: {
    color: "#fff",
  },

  addBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 12,
  },

  // Edit modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000040",
  },
  modalContainer: {
    position: "absolute",
    top: "25%",
    left: SCREEN_WIDTH * 0.05,
    right: SCREEN_WIDTH * 0.05,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 8 },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#f0f6ff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    marginBottom: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
  },
  qtyInputModal: {
    width: 100,
    textAlign: "center",
    alignSelf: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e54349",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginLeft: 16,
  },
  cancelText: {
    color: "#e54349",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default FridgeScanner;
