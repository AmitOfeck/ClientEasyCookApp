import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, StatusBar } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { launchImageLibrary } from "react-native-image-picker";
import { InputField } from "./InputField";
import { signUpSchema } from "../utils/validations";
import { login, register, saveTokens } from "../services/auth_service";

export const SignUp = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const [profileImage, setProfileImage] = useState<any>(null);

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
      console.log("Registration successful", response.data);
      const loginResponse = await login({ email: formData.email, password: formData.password }).request;
      saveTokens(loginResponse.data);
      console.log("LogIn successful", loginResponse.data);
      // todo: navigate to home screen
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Sign Up</Text>
        </View>

        <View style={styles.formContainer}>
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
        </View>

        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerButton}>Pick Profile Image</Text>
          </TouchableOpacity>
          {profileImage && <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />}
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.signUpButton, !isValid && styles.disabledButton]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  titleContainer: { paddingHorizontal: 16, paddingVertical: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#000000" },
  formContainer: { paddingHorizontal: 16 },
  imagePickerContainer: { alignItems: "center", marginVertical: 20 },
  imagePickerButton: { backgroundColor: "#EC888D", padding: 10, borderRadius: 8 },
  disabledButton: { backgroundColor: "#CCCCCC" },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginTop: 10 },
  footerContainer: { paddingHorizontal: 16, paddingVertical: 24 },
  signUpButton: { backgroundColor: "#EC888D", borderRadius: 8, height: 48, justifyContent: "center", alignItems: "center" },
  signUpButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});

export default SignUp;
