import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { getProfile, updateProfile, IProfile } from '../services/profile_service';
import ProfileEditModal from './ProfileEditModal';
import { getFullImageUrl } from '../utils/getFullImageUrl';
import defaultProfileImage from '../assets/profile.jpg';

export const ProfileScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false); 

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
    setUpdating(true); 
    
    const formData = new FormData();
    formData.append('name', updatedData.name);
    formData.append('userName', updatedData.userName);
    formData.append('email', updatedData.email);

    if (updatedData.address) {
      formData.append('address', JSON.stringify(updatedData.address));
    }

    if (updatedData.profileImage) {
      console.log('[profile] Sending new image:', updatedData.profileImage.uri?.substring(0, 50));
      formData.append('profileImage', {
        uri: updatedData.profileImage.uri,
        type: updatedData.profileImage.type || 'image/jpeg',
        name: updatedData.profileImage.fileName || 'profile.jpg',
      } as any);
    } else {
      console.log('[profile] No image change detected');
    }

    const { request, abort } = updateProfile(formData);

    try {
      const response = await request;
      console.log('[profile] Update successful:', response.data);
      
      await fetchProfile();
      
      setEditModalVisible(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message ||
        err?.response?.data?.errors?.join('\n') ||
        'Could not update your profile.';
      console.error('[profile] update error:', err?.response?.data || err.message);
      
    
      Alert.alert(
        'Update failed', 
        serverMsg,
        [
          { 
            text: 'Try Again', 
            onPress: () => {
              
            }
          },
          {
            text: 'Cancel',
            onPress: () => setEditModalVisible(false),
            style: 'cancel'
          }
        ]
      );
    } finally {
      setUpdating(false); 
    }
    
    return () => abort();
  };

  /* ───────────  RENDER HELPERS  ─────────── */
  const renderCards = () => {
    if (!profile?.dishes?.length) return null;

    return profile.dishes.map((item, i) => (
      <TouchableOpacity
        key={i}
        style={styles.card}
        onPress={() => navigation.navigate('DishDetail', { dishId: item._id })}
        activeOpacity={0.7}
      >
        <Image source={{ uri: getFullImageUrl(item.imageUrl) }} style={styles.cardImage} />
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{item.details}</Text>
      </TouchableOpacity>
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
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity onPress={fetchProfile} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
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

  return (
    <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
      {/* Updating overlay */}
      {updating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.updatingText}>Updating profile...</Text>
        </View>
      )}
      
      {/* top section */}
      <View style={styles.profileContainer}>
        {profile.profileImage ? (
          <Image source={{ uri: getFullImageUrl(profile.profileImage) }} style={styles.avatar} />
        ) : (
          <Image source={defaultProfileImage} style={styles.avatar} />
        )}
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.userName}</Text>
        <Text style={styles.bio}>
          {profile.bio ?? 'My passion is cooking new recipes with my friends.'}
        </Text>

        <TouchableOpacity 
          style={[styles.editButton, updating && styles.editButtonDisabled]} 
          onPress={handleEditProfile}
          disabled={updating}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Recipes title */}
      <Text style={styles.recipesTitle}>Recipes ({profile.dishes.length})</Text>

      {/* list of recipes */}
      {profile.dishes.length > 0 ? (
        <View style={styles.cardWrapper}>{renderCards()}</View>
      ) : (
        <View style={styles.noRecipesContainer}>
          <Text style={styles.noRecipesText}>No recipes found.</Text>
        </View>
      )}

      {/* modal */}
      <ProfileEditModal
        visible={editModalVisible}
        onClose={() => !updating && setEditModalVisible(false)}
        onSave={handleSaveProfile}
        initialData={{
          name: profile.name,
          userName: profile.userName,
          email: profile.email,
          address: profile.addresses?.[0],
          profileImage: profile.profileImage ? { uri: getFullImageUrl(profile.profileImage) } : undefined,
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#e4f0fd",
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
  editButtonDisabled: {
    opacity: 0.5,
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
  recipesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#000",
  },
  noRecipesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noRecipesText: {
    fontSize: 16,
    color: "#555",
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: "#B91C1C",
    marginBottom: 10,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#1E3A8A",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  updatingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  updatingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});

export default ProfileScreen;