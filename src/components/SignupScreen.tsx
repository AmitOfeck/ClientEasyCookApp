import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, StatusBar, Dimensions } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { launchImageLibrary } from "react-native-image-picker";
import { InputField } from "./InputField";
import { signUpSchema } from "../utils/validations";
import { login, register, saveTokens } from "../services/auth_service";
import { NavigationProp } from '@react-navigation/native';

const { width } = Dimensions.get("window");

export const SignUp = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const [profileImage, setProfileImage] = useState<any>(null);

  // Collapsible states
  const [openSection, setOpenSection] = useState<string | null>("personal");

  const pickImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0]);
      }
    });
  };

  const onSubmit = async (formData: any) => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "address") {
          form.append(key, JSON.stringify(value));
        } else {
          form.append(key, value);
        }
      });

      if (profileImage) {
        form.append("profileImage", {
          uri: profileImage.uri,
          name: profileImage.fileName || "profile.jpg",
          type: profileImage.type || "image/jpeg",
        });
      }

      const response = await register(form).request;
      const loginResponse = await login({ email: formData.email, password: formData.password }).request;
      saveTokens(loginResponse.data);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* HEADER כמו ב־Login */}
        <View style={styles.header}>
          <View style={styles.headerLogoRow}>
            <Image source={require("../assets/easycook-logo.png")} style={styles.logoImg} resizeMode="contain" />
            <Image source={require("../assets/basket.png")} style={styles.basketImg} resizeMode="contain" />
          </View>
          <Text style={styles.slogan}>Create your free account</Text>
        </View>
        <View style={styles.illustrationContainer}>
          <Image source={require("../assets/rider.png")} style={styles.illustration} resizeMode="contain" />
        </View>
        <View style={styles.card}>
          <Text style={styles.formTitle}>Sign Up</Text>
          {/* Profile Image - ריבוע, בלי טקסט, אייקון בלבד */}
          <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
            ) : (
              <Image source={require("../assets/camera.png")} style={styles.cameraIcon} />
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Choose a profile image</Text>

          {/* --- Collapsible Sections --- */}
          {/* Personal */}
          <CollapsibleSection
            title="Personal Details"
            open={openSection === "personal"}
            onPress={() => setOpenSection(openSection === "personal" ? null : "personal")}
          >
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <InputField label="Full Name" value={field.value} onChange={field.onChange} error={errors.name?.message} />
              )}
            />
            <Controller
              control={control}
              name="userName"
              render={({ field }) => (
                <InputField label="User Name" value={field.value} onChange={field.onChange} error={errors.userName?.message} />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <InputField label="Email" value={field.value} onChange={field.onChange} error={errors.email?.message} type="email" />
              )}
            />
          </CollapsibleSection>
          {/* Address */}
          <CollapsibleSection
            title="Address"
            open={openSection === "address"}
            onPress={() => setOpenSection(openSection === "address" ? null : "address")}
          >
            <Controller
              control={control}
              name="address.city"
              render={({ field }) => (
                <InputField label="City" value={field.value || ""} onChange={field.onChange} error={errors.address?.city?.message} />
              )}
            />
            <Controller
              control={control}
              name="address.street"
              render={({ field }) => (
                <InputField label="Street" value={field.value || ""} onChange={field.onChange} error={errors.address?.street?.message} />
              )}
            />
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
          </CollapsibleSection>
          {/* Password */}
          <CollapsibleSection
            title="Password"
            open={openSection === "password"}
            onPress={() => setOpenSection(openSection === "password" ? null : "password")}
          >
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <InputField label="Password" value={field.value} onChange={field.onChange} error={errors.password?.message} type="password" />
              )}
            />
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <InputField
                  label="Confirm Password"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.confirmPassword?.message}
                  type="password"
                />
              )}
            />
          </CollapsibleSection>
          {/* --- Button --- */}
          <TouchableOpacity
            style={[styles.signUpButton, !isValid && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type CollapsibleSectionProps = {
  title: string;
  open: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  open,
  onPress,
  children,
}) => (
  <View style={styles.section}>
    <TouchableOpacity style={styles.sectionHeader} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionArrow}>{open ? "▼" : "▲"}</Text>
    </TouchableOpacity>
    {open && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e4f0fd" },
  scrollView: { flexGrow: 1, alignItems: "center", paddingBottom: 32 },
  header: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 6,
    width: "100%",
    justifyContent: "center",
    position: "relative",
  },  headerLogoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 2,
  },
  logoImg: {
    width: 168,
    height: 49,
  },
  basketImg: {
    width: 54,
    height: 54,
    shadowColor: '#2563eb66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  slogan: { fontSize: 17, color: "#2563eb", fontWeight: '500', marginBottom: 9, opacity: 0.8, textAlign: 'center' },
  illustrationContainer: { width: width * 0.38, height: width * 0.31, alignItems: 'center', justifyContent: 'center', marginBottom: -23, marginTop: -10 },
  illustration: { width: '97%', height: '100%' },
  card: {
    width: "93%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 36,
    padding: 26,
    marginVertical: 15,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.13,
    shadowRadius: 36,
    elevation: 13,
    alignItems: "center",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 11,
    letterSpacing: 0.22,
    textAlign: "center",
    opacity: 0.87,
  },
  imageBox: {
    width: 74,
    height: 74,
    borderRadius: 18,
    borderWidth: 1.6,
    borderColor: '#bcd7f8',
    backgroundColor: '#f7fafd',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 7,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: 74,
    height: 74,
    borderRadius: 18,
  },
  cameraIcon: {
    width: 32,
    height: 32,
    opacity: 0.49,
  },
  avatarHint: {
    fontSize: 12,
    color: "#64748b",
    opacity: 0.7,
    marginBottom: 8,
    marginTop: 2,
    textAlign: "center",
  },
  section: {
    width: '100%',
    marginBottom: 11,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e7ecf3',
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "700",
    letterSpacing: 0.12,
    opacity: 0.84,
  },
  sectionArrow: {
    fontSize: 16,
    color: "#bcd7f8",
    fontWeight: "bold",
    marginRight: 4,
    marginLeft: 7,
    opacity: 0.95,
  },
  sectionContent: { paddingTop: 5 },
  signUpButton: {
    backgroundColor: "#e8f2ff",
    borderRadius: 20,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2186eb",
    marginTop: 13,
    marginBottom: 5,
    width: "100%",
    shadowColor: "#2563eb22",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },
  signUpButtonText: {
    color: "#2186eb",
    fontSize: 17.5,
    fontWeight: "700",
    letterSpacing: 0.13,
    textAlign: "center",
  },
  disabledButton: { opacity: 0.55 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18, marginBottom: 14 },
  footerText: { color: "#64748b", fontSize: 15, marginRight: 4, opacity: 0.7 },
  footerLink: { color: "#2563eb", fontWeight: "700", fontSize: 15.2, textDecorationLine: "underline", opacity: 0.9 }
});

export default SignUp;
