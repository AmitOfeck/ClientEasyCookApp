import React from "react";
import { View, Text, StyleSheet } from "react-native";

type RecipeStepsProps = {
  text: string;
};

const RecipeSteps: React.FC<RecipeStepsProps> = ({ text }) => {
  const steps = React.useMemo(() => {
    if (!text) return [];
    const s = text.replace(/\r/g, " ").trim();

    let parts = s
      .split(/\s*\d+\s*[\.\)]\s+/g)
      .map(t => t.trim())
      .filter(Boolean);

    if (parts.length <= 1) {
      parts = s
        .split(/\.\s+/g)
        .map(t => t.replace(/\.+$/, "").trim())
        .filter(Boolean);
    }
    return parts;
  }, [text]);

  if (!steps.length) {
    return <Text style={styles.emptyText}>No recipe found.</Text>;
  }

  return (
    <View style={{ marginTop: 6 }}>
      {steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepNum}>
            <Text style={styles.stepNumText}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

export default RecipeSteps;

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#eaf3ff",
    borderWidth: 1,
    borderColor: "#d7e6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2, 
  },
  stepNumText: {
    color: "#2363eb",
    fontWeight: "800",
    fontSize: 13.5,
  },
  stepText: {
    flex: 1,
    color: "#2c3f62",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    paddingTop: 3, 
  },
  emptyText: {
    fontSize: 14,
    color: "#bbb",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 7,
  },
});
