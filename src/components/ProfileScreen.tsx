import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getProfile, updateProfile, IProfile } from "../services/profile_service";
import ProfileEditModal from "./ProfileEditModal";
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { getFullImageUrl } from "../utils/getFullImageUrl";

export const ProfileScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [activeTab, setActiveTab] = useState<"recipe" | "favorites">("recipe");
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const fetchProfile = async () => {
    const { request, abort } = getProfile();
    try {
      const res = await request;
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    return () => abort();
  };
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  console.log(profile)

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (updatedData: {
    name: string;
    userName: string;
    email: string;
    address: { city?: string; street?: string; building?: number };
    profileImage?: { uri: string; type: string; fileName: string };
  }) => {
    const formData = new FormData();
    formData.append("name", updatedData.name);
    formData.append("userName", updatedData.userName);
    formData.append("email", updatedData.email);

    if (updatedData.address) {
      formData.append("address", JSON.stringify(updatedData.address));
    }

    if (
      updatedData.profileImage?.uri &&
      !updatedData.profileImage.uri.startsWith("http")
    ) {
      formData.append(
        "profileImage",
        {
          uri: updatedData.profileImage.uri,
          type: updatedData.profileImage.type || "image/jpeg",
          name: updatedData.profileImage.fileName || "profile.jpg",
        } as any
      );
    }

    const { request, abort } = updateProfile(formData);

    try {
      await request;
      fetchProfile();
      setEditModalVisible(false);
      navigation.navigate("Profile");
    } catch (err: any) {
      // <<< מציגים עכשיו גם את הודעת השגיאה שמגיעה מהשרת >>>
      const serverMsg =
        err.response?.data?.message || "Could not update your profile.";
      console.error("Update profile error:", serverMsg);
      Alert.alert("Update Failed", serverMsg);
      setEditModalVisible(false);
    }

    return () => abort();
  };


  const renderCards = () => {
    const data = activeTab === "recipe" ? profile?.dishes : profile?.favoriteDishes;

    if (!data || data.length === 0) {
      return (
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Text>No items found.</Text>
        </View>
      );
    }

    return data.map((item: any, index: number) => (
      <View key={index} style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.details}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardMetaText}>⭐ 1</Text>
          <Text style={styles.cardMetaText}>⏱ 10mins</Text>
        </View>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: profile?.profileImage
              ? `http://10.0.2.2:3000${profile.profileImage}`
              : "https://via.placeholder.com/150", // fallback image
          }}
          style={styles.avatar}
        /><Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.name}</Text>
        <Text style={styles.bio}>My passion is cooking new recipes with my friends.</Text>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.recipeCount}>{profile.dishes.length} recipes</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "recipe" && styles.tabActive]}
          onPress={() => setActiveTab("recipe")}
        >
          <Text style={[styles.tabText, activeTab === "recipe" && styles.tabTextActive]}>
            Recipe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "favorites" && styles.tabActive]}
          onPress={() => setActiveTab("favorites")}
        >
          <Text style={[styles.tabText, activeTab === "favorites" && styles.tabTextActive]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={styles.cardWrapper}>{renderCards()}</View>

      {/* Edit Modal */}
      <ProfileEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveProfile}
        initialData={{
          name: profile.name,
          userName: profile.userName,
          email: profile?.email,
          address: profile.addresses?.[0],
          profileImage: profile.profileImage? { uri: `http://10.0.2.2:3000${profile.profileImage}`} : undefined,
        }}
      />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontSize: 14,
    color: "#1E3A8A",
  },
  bio: {
    fontSize: 14,
    color: "#555",
    marginVertical: 10,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#BFD8FF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 5,
  },
  editButtonText: {
    color: "#1E3A8A",
    fontWeight: "600",
  },
  recipeCount: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#1E3A8A",
  },
  tabText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  tabTextActive: {
    color: "#1E3A8A",
    fontWeight: "bold",
  },
  cardWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
  },
  cardImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#555",
    marginBottom: 5,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMetaText: {
    fontSize: 12,
    color: "#777",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
});

export default ProfileScreen;
