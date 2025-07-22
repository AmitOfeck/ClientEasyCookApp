import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const CUISINES = [
  { label: "Italian", value: "ITALIAN", emoji: "🍝" },
  { label: "Chinese", value: "CHINESE", emoji: "🥡" },
  { label: "Indian", value: "INDIAN", emoji: "🍛" },
  { label: "Mexican", value: "MEXICAN", emoji: "🌮" },
];
const LIMITATIONS = [
  { label: "Vegetarian", value: "VEGETARIAN", emoji: "🥗" },
  { label: "Vegan", value: "VEGAN", emoji: "🥕" },
  { label: "Gluten Free", value: "GLUTEN_FREE", emoji: "🌾" },
];
const LEVELS = [
  { label: "Easy", value: "EASY", emoji: "🟢" },
  { label: "Medium", value: "MEDIUM", emoji: "🟠" },
  { label: "Hard", value: "HARD", emoji: "🔴" },
];

const MIN_PRICE = 0, MAX_PRICE = 500;

// ------------- PROPS TYPES -------------
interface Props {
  expanded: boolean;
  setExpanded: (x: boolean | ((prev: boolean) => boolean)) => void;
  selectedCuisine: string;
  setSelectedCuisine: (x: string) => void;
  selectedLimitation: string;
  setSelectedLimitation: (x: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (x: string) => void;
  priceRange: number[];
  setPriceRange: (x: number[]) => void;
}

// ----------- COMPONENT -------------
const SearchFilters: React.FC<Props> = ({
  expanded,
  setExpanded,
  selectedCuisine,
  setSelectedCuisine,
  selectedLimitation,
  setSelectedLimitation,
  selectedDifficulty,
  setSelectedDifficulty,
  priceRange,
  setPriceRange,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeaderRow}
        onPress={() => setExpanded((x) => !x)}
        activeOpacity={0.8}
      >
        <Text style={styles.cardHeaderText}>Search Filters</Text>
        <Icon
          name={expanded ? "chevron-up" : "chevron-down"}
          size={27}
          color="#2563eb"
        />
      </TouchableOpacity>

      {expanded && (
        <View>
          {/* Price Range */}
          <Text style={styles.filterLabel}>Price Range</Text>
          <View style={styles.sliderContainer}>
            <MultiSlider
              values={priceRange}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={1}
              sliderLength={300}
              onValuesChange={setPriceRange}
              selectedStyle={{ backgroundColor: "#2563eb" }}
              markerStyle={styles.sliderMarker}
              pressedMarkerStyle={styles.sliderMarkerActive}
              trackStyle={{ height: 5, borderRadius: 3 }}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>₪{priceRange[0]}</Text>
              <Text style={styles.sliderLabel}>₪{priceRange[1]}</Text>
            </View>
          </View>
          {/* Cuisine */}
          <Text style={styles.filterLabel}>Cuisine</Text>
          <View style={styles.gridCompact}>
            {CUISINES.map(({ label, value, emoji }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.gridMiniButton,
                  selectedCuisine === value && styles.gridMiniButtonSelected,
                ]}
                onPress={() =>
                  setSelectedCuisine(selectedCuisine === value ? "" : value)
                }
                activeOpacity={0.85}
              >
                <Text style={styles.emojiSmall}>{emoji}</Text>
                <Text
                  style={[
                    styles.gridMiniButtonText,
                    selectedCuisine === value && styles.gridMiniButtonTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Limitations */}
          <Text style={styles.filterLabel}>Dietary Limitations</Text>
          <View style={styles.gridCompact}>
            {LIMITATIONS.map(({ label, value, emoji }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.gridMiniButton,
                  selectedLimitation === value && styles.gridMiniButtonSelected,
                ]}
                onPress={() =>
                  setSelectedLimitation(selectedLimitation === value ? "" : value)
                }
                activeOpacity={0.85}
              >
                <Text style={styles.emojiSmall}>{emoji}</Text>
                <Text
                  style={[
                    styles.gridMiniButtonText,
                    selectedLimitation === value && styles.gridMiniButtonTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Difficulty */}
          <Text style={styles.filterLabel}>Difficulty Level</Text>
          <View style={styles.gridCompact}>
            {LEVELS.map(({ label, value, emoji }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.gridMiniButton,
                  selectedDifficulty === value && styles.gridMiniButtonSelected,
                ]}
                onPress={() =>
                  setSelectedDifficulty(selectedDifficulty === value ? "" : value)
                }
                activeOpacity={0.85}
              >
                <Text style={styles.emojiSmall}>{emoji}</Text>
                <Text
                  style={[
                    styles.gridMiniButtonText,
                    selectedDifficulty === value && styles.gridMiniButtonTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* אין כפתור search כאן! */}
        </View>
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
    marginBottom: 2,
  },
  cardHeaderText: {
    fontSize: 18,
    color: "#2563eb",
    fontWeight: "bold",
    marginLeft: 3,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#415c78",
    marginTop: 7,
    marginBottom: 1,
    opacity: 0.82,
    alignSelf: "flex-start",
  },
  sliderContainer: {
    alignItems: "center",
    width: "99%",
    marginVertical: 6,
  },
  sliderMarker: {
    backgroundColor: "#2563eb",
    height: 23,
    width: 23,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#2563eb",
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  sliderMarkerActive: {
    backgroundColor: "#1e3a8a",
    borderColor: "#a3bffa",
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "92%",
    marginTop: 5,
    marginBottom: 2,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    opacity: 0.75,
    backgroundColor: "#eaf3ff",
    paddingHorizontal: 11,
    paddingVertical: 2,
    borderRadius: 13,
  },
  gridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
    marginVertical: 2,
    gap: 6,
  },
  gridMiniButton: {
    flexBasis: "28%",
    minWidth: 95,
    backgroundColor: "#eaf3ff",
    paddingVertical: 10,
    borderRadius: 12,
    margin: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.1,
    borderColor: "#eaf3ff",
    elevation: 2,
    flexShrink: 1,
  },
  gridMiniButtonSelected: {
    backgroundColor: "#f6f8ff",
    borderColor: "#2563eb",
    shadowColor: "#2563eb44",
    shadowOpacity: 0.11,
    shadowRadius: 8,
  },
  emojiSmall: {
    fontSize: 20,
    marginBottom: 1,
  },
  gridMiniButtonText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 13,
    marginTop: 0,
  },
  gridMiniButtonTextSelected: {
    color: "#e54349",
  },
});

export default SearchFilters;
