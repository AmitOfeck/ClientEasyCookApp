// SearchPrompt.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  expanded: boolean;
  setExpanded: (val: boolean) => void;
  prompt: string;
  setPrompt: (text: string) => void;
}

const { width } = Dimensions.get("window");

const SearchPrompt: React.FC<Props> = ({
  expanded,
  setExpanded,
  prompt,
  setPrompt,
}) => (
  <View style={styles.card}>
    <TouchableOpacity
      style={styles.cardHeaderRow}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <Text style={styles.cardHeaderText}>Prompt</Text>
      <Icon
        name={expanded ? "chevron-up" : "chevron-down"}
        size={27}
        color="#2563eb"
      />
    </TouchableOpacity>

    {expanded && (
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        placeholder="Enter search prompt..."
        placeholderTextColor="#415c78"
        multiline
        style={styles.promptInput}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: "95%",
    maxWidth: 440,
    backgroundColor: "#f7faff",
    borderRadius: 23,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 8,
    alignSelf: "center",
    // no shadow
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
    marginLeft: 3,
  },
  promptInput: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: "#bfdcff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#2c3e50",
    minHeight: 60,
    textAlignVertical: "top",
  },
});

export default SearchPrompt;
