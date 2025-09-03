import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,               // keep the import – your styles object already exists
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { launchImageLibrary } from 'react-native-image-picker';
import { InputField } from './InputField';
import { signUpSchema } from '../utils/validations';
import { login, register, saveTokens } from '../services/auth_service';
import { NavigationProp } from '@react-navigation/native';
import { z } from 'zod';

export type SignUpFormData = z.infer<typeof signUpSchema>;

const { width, height } = Dimensions.get('window');

export const SignUp = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const [profileImage, setProfileImage] = useState<any>(null);
  const [openSection, setOpenSection] = useState<string | null>('personal');
  const [serverError, setServerError] = useState<string | null>(null);  // ⬅️ holds server-side message
  const [loading, setLoading]   = useState(false);

  /* ────────── image picker ───────── */
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets?.length) setProfileImage(response.assets[0]);
    });
  };

  /* ────────── submit ───────── */
  const onSubmit = async (formData: SignUpFormData) => {
    setServerError(null);
    setLoading(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'address' && value && typeof value === 'object') {
          const address = { ...value, building: value.building ? Number(value.building) : undefined };

          if (Object.values(address).some(v => v !== undefined && v !== "")) {
            form.append(key, JSON.stringify(address));
          }
        } else {
          form.append(key, value);
        }
      });

      if (profileImage) {
        form.append('profileImage', {
          uri:  profileImage.uri,
          name: profileImage.fileName || 'profile.jpg',
          type: profileImage.type || 'image/jpeg',
        } as any);
      }

      /* register → then immediate login */
      await register(form).request;
      const loginRes = await login({
        email:    formData.email,
        password: formData.password,
      }).request;

      saveTokens(loginRes.data);
      navigation.navigate('Home');
    } catch (err: any) {
      /* show server-side validation or generic failure */
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.join('\n') ||
        'Registration failed – please try again.';
      console.error('[signup] error:', msg);
      setServerError(msg);
      Alert.alert('Sign-up error', msg);          // שגיאה אינדיקטיבית
    } finally {
      setLoading(false);
    }
  };

  /* ────────── UI ───────── */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* סל קניות – תמיד באותו מקום כמו ב־Login */}
        <View style={styles.basketWrapper}>
          <Image
            source={require("../assets/basket.png")}
            style={styles.basket}
            resizeMode="contain"
          />
        </View>
        {/* כותרת, לוגו, וסלוגן */}
        <View style={styles.header}>
          <Image
            source={require("../assets/easycook-logo.png")}
            style={styles.titleImage}
            resizeMode="contain"
          />
          <Text style={styles.signupFree}>Create your free account</Text>
        </View>
        {/* שליח */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../assets/rider.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>Sign Up</Text>
          {/* Profile Image Picker */}
          <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
            {profileImage ? (
              <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
            ) : (
              <Image source={require("../assets/camera.png")} style={styles.cameraIcon} />
            )}
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Choose a profile image</Text>
          {/* Collapsible Sections */}
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
                <InputField label="Building" value={field.value || ""} onChange={field.onChange} error={errors.address?.building?.message} />
              )}
            />
          </CollapsibleSection>
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

/* --------------- collapsible section helper (unchanged) --------------- */
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
      <Text style={styles.sectionArrow}>{open ? '▼' : '▲'}</Text>
    </TouchableOpacity>
    {open && <View style={styles.sectionContent}>{children}</View>}
  </View>
);



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e4f0fd" },
  scrollView: {
    flexGrow: 1,
    backgroundColor: "#e4f0fd",
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 40 : 32,
    minHeight: height,
    overflow: 'visible',
  },
  basketWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 0 : 0,
    right: 0,
    width: width,
    alignItems: 'flex-end',
    zIndex: 10,
    pointerEvents: 'none',
  },
  basket: {
    width: width * 0.35,
    height: width * 0.26,
    marginRight: -width * 0.09,
    marginTop: 0,
    opacity: 0.97,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 4,
  },
  titleImage: {
    width: width * 0.72,
    height: width * 0.16,
    marginBottom: 8,
    alignSelf: 'center',
  },
  signupFree: {
    fontSize: width < 370 ? 15 : 19,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 12,
    marginTop: -4,
    textAlign: 'center',
    opacity: 0.88,
    letterSpacing: 0.04,
  },
  illustrationContainer: {
    width: width * 0.39,
    height: width * 0.31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -24,
    marginTop: -8,
  },
  illustration: {
    width: '98%',
    height: '100%',
  },
  card: {
    width: width * 0.92,
    maxWidth: 410,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 36,
    padding: 30,
    paddingTop: 40,
    marginVertical: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 34,
    elevation: 10,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#4b5d78',      
    marginBottom: 15,
    letterSpacing: 0.15,
    textAlign: 'center',
    opacity: 0.82,    
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
