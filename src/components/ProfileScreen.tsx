import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,          // ← keep the import; styles live elsewhere
} from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { getProfile, updateProfile, IProfile } from '../services/profile_service';
import ProfileEditModal from './ProfileEditModal';
import { getFullImageUrl } from '../utils/getFullImageUrl';

export const ProfileScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [activeTab, setActiveTab]               = useState<'recipe' | 'favorites'>('recipe');
  const [profile,   setProfile]                 = useState<IProfile | null>(null);
  const [loading,   setLoading]                 = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [errorMsg,  setErrorMsg]                = useState<string | null>(null);   // ⬅️ tracks fetch-error

  /* ───────────  FETCH PROFILE  ─────────── */
  const fetchProfile = async () => {
    setLoading(true);
    const { request, abort } = getProfile();

    try {
      const res = await request;
      setProfile(res.data);
      setErrorMsg(null);
    } catch (err: any) {
      console.error('[profile] fetch error:', err?.response?.data ?? err.message);
      setErrorMsg(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
    return () => abort();
  };

  useFocusEffect(useCallback(() => { fetchProfile(); }, []));

  /* ───────────  EDIT  ─────────── */
  const handleEditProfile = () => setEditModalVisible(true);

  const handleSaveProfile = async (updatedData: {
    name: string;
    userName: string;
    email: string;
    address: { city?: string; street?: string; building?: number };
    profileImage?: { uri: string; type: string; fileName: string };
  }) => {
    const formData = new FormData();
    formData.append('name',     updatedData.name);
    formData.append('userName', updatedData.userName);
    formData.append('email',    updatedData.email);

    if (updatedData.address) {
      formData.append('address', JSON.stringify(updatedData.address));
    }

    if (updatedData.profileImage?.uri && !updatedData.profileImage.uri.startsWith('http')) {
      formData.append('profileImage', {
        uri:  updatedData.profileImage.uri,
        type: updatedData.profileImage.type  || 'image/jpeg',
        name: updatedData.profileImage.fileName || 'profile.jpg',
      } as any);
    }

    const { request, abort } = updateProfile(formData);

    try {
      await request;
      await fetchProfile();                       // refresh UI
      setEditModalVisible(false);
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message ||
                        err?.response?.data?.errors?.join('\n') ||
                        'Could not update your profile.';
      console.error('[profile] update error:', serverMsg);
      Alert.alert('Update failed', serverMsg);    // שגיאה אינדיקטיבית
      setEditModalVisible(false);
    }
    return () => abort();
  };

  /* ───────────  RENDER HELPERS  ─────────── */
  const renderCards = () => {
    const data = activeTab === 'recipe' ? profile?.dishes : profile?.favoriteDishes;

    if (!data?.length) {
      return (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text>No items found.</Text>
        </View>
      );
    }

    return data.map((item, i) => (
      <View key={i} style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardTitle}    numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{item.details}</Text>
      </View>
    ));
  };

  /* ───────────  MAIN RENDER  ─────────── */
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.loaderContainer}>
        <Text>{errorMsg}</Text>
        <TouchableOpacity onPress={fetchProfile} style={{ marginTop: 14 }}>
          <Text style={{ color: '#1E3A8A', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  /* ───────────  CONTENT  ─────────── */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* top section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: getFullImageUrl(profile.profileImage) }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.userName}</Text>
        <Text style={styles.bio}>
          {profile.bio ?? 'My passion is cooking new recipes with my friends.'}
        </Text>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <Text style={styles.recipeCount}>{profile.dishes.length} recipes</Text>
      </View>

      {/* tabs */}
      <View style={styles.tabContainer}>
        {(['recipe', 'favorites'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === t && styles.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text
              style={[styles.tabText, activeTab === t && styles.tabTextActive]}
            >
              {t === 'recipe' ? 'Recipes' : 'Favorites'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* list */}
      <View style={styles.cardWrapper}>{renderCards()}</View>

      {/* modal */}
      <ProfileEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveProfile}
        initialData={{
          name:         profile.name,
          userName:     profile.userName,
          email:        profile.email,
          address:      profile.addresses?.[0],
          profileImage: profile.profileImage
            ? { uri: getFullImageUrl(profile.profileImage) }
            : undefined,
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
