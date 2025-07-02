import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  StyleSheet,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { launchImageLibrary } from "react-native-image-picker";
import { InputField } from "./InputField";
import { profileEditSchema } from "../utils/profileEditSchema";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (updated: any) => void;
  initialData: {
    name: string;
    userName: string;
    email: string;
    address: { city?: string; street?: string; building?: number };
    profileImage?: { uri: string };
  };
}

const ProfileEditModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const [profileImage, setProfileImage] = useState<any>(
    initialData.profileImage || null
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      name: initialData.name || "",
      userName: initialData.userName || "",
      email: initialData.email || "",
      address: {
        city: initialData.address?.city || "",
        street: initialData.address?.street || "",
        building:
          typeof initialData.address?.building === "number"
            ? initialData.address.building
            : undefined,
      },
    },
    resolver: zodResolver(profileEditSchema),
    mode: "onChange",
  });

  /** ─────────────────────────  IMAGE PICKER  ───────────────────────── */
  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0]);
      }
    });
  };

  /** ─────────────────────────  SUBMIT  ───────────────────────── */
  const onSubmit = (data: any) => {
    if (!isValid) {
      // This should never fire because button is disabled, but double-guard
      Alert.alert("Error", "Please correct the highlighted fields.");
      return;
    }
    onSave({ ...data, profileImage });
  };

  /** ─────────────────────────  RENDER  ───────────────────────── */
  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.modalWrapper}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Edit Profile</Text>

          {/* Global banner if any field invalid */}
          {Object.keys(errors).length > 0 && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                ⚠️ Please fix the highlighted fields
              </Text>
            </View>
          )}

          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <InputField
                label="Full Name"
                value={field.value}
                onChange={field.onChange}
                error={errors.name?.message}
              />
            )}
          />

          {/* Username */}
          <Controller
            control={control}
            name="userName"
            render={({ field }) => (
              <InputField
                label="User Name"
                value={field.value}
                onChange={field.onChange}
                error={errors.userName?.message}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <InputField
                label="Email"
                value={field.value}
                onChange={field.onChange}
                error={errors.email?.message}
                type="email"
              />
            )}
          />

          {/* City */}
          <Controller
            control={control}
            name="address.city"
            render={({ field }) => (
              <InputField
                label="City"
                value={field.value}
                onChange={field.onChange}
                error={errors.address?.city?.message}
              />
            )}
          />

          {/* Street */}
          <Controller
            control={control}
            name="address.street"
            render={({ field }) => (
              <InputField
                label="Street"
                value={field.value}
                onChange={field.onChange}
                error={errors.address?.street?.message}
              />
            )}
          />

          {/* Building */}
          <Controller
            control={control}
            name="address.building"
            render={({ field }) => (
              <InputField
                label="Building"
                value={field.value?.toString() || ""}
                onChange={(text) => field.onChange(text ? parseInt(text) : "")}
                error={errors.address?.building?.message}
                keyboardType="numeric"
              />
            )}
          />

          {/* Image picker & preview */}
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Text style={styles.imagePickerText}>Pick Profile Image</Text>
          </TouchableOpacity>
          {profileImage && (
            <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
          )}

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !isValid && styles.disabledButton,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    container: {
        marginTop: 40,
        backgroundColor: "#fff",
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#000",
        alignSelf: "center",
    },
    imagePickerButton: {
        backgroundColor: "#EC888D",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    imagePickerText: {
        color: "#fff",
        fontWeight: "bold",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: "center",
        marginTop: 10,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    cancelButton: {
        backgroundColor: "#ccc",
        padding: 12,
        borderRadius: 8,
        flex: 0.45,
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "#EC888D",
        padding: 12,
        borderRadius: 8,
        flex: 0.45,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#aaa",
    },
    cancelText: {
        color: "#333",
        fontWeight: "bold",
    },
    saveText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default ProfileEditModal;
