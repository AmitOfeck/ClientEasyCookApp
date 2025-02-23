import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, StatusBar, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { InputField } from './InputField';

interface IAddress {
  city: string;
  street: string;
  building: number;
}

export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    email: '',
    address: {
      city: '',
      street: '',
      building: 0,
    } as IAddress,
    password: '',
    confirmPassword: '',
  });

  const [profileImage, setProfileImage] = useState<any>(null);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const image = response.assets[0];
        setProfileImage(image);
      }
    });
  };

  const handleSignUp = async () => {
    try {
      const form = new FormData();

      form.append("name", formData.name);
      form.append("userName", formData.userName);
      form.append("email", formData.email);
      form.append("password", formData.password);
      form.append("confirmPassword", formData.confirmPassword);
      form.append("address", JSON.stringify(formData.address));

      if (profileImage) {
        form.append("profileImage", {
          uri: profileImage.uri,
          name: profileImage.fileName || "profile.jpg",
          type: profileImage.type || "image/jpeg",
        });
      }

      const response = await fetch("http://10.0.2.2:3000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful:", data);
      } else {
        console.error("Registration failed:", data);
      }
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
          <InputField
            label="Full Name"
            value={formData.name}
            onChange={(text) => setFormData({ ...formData, name: text })}
          />

          <InputField
            label="User Name"
            value={formData.userName}
            onChange={(text) => setFormData({ ...formData, userName: text })}
          />

          <InputField
            label="Email"
            value={formData.email}
            onChange={(text) => setFormData({ ...formData, email: text })}
            type="email"
          />

          <InputField
            label="City"
            value={formData.address.city}
            onChange={(text) =>
              setFormData({ ...formData, address: { ...formData.address, city: text } })
            }
          />

          <InputField
            label="Street"
            value={formData.address.street}
            onChange={(text) =>
              setFormData({ ...formData, address: { ...formData.address, street: text } })
            }
          />

          <InputField
            label="Building"
            value={formData.address.building.toString()}
            onChange={(text) =>
              setFormData({ ...formData, address: { ...formData.address, building: parseInt(text) || 0 } })
            }
            keyboardType="numeric"
          />

          <InputField
            label="Password"
            value={formData.password}
            onChange={(text) => setFormData({ ...formData, password: text })}
            type="password"
          />

          <InputField
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(text) => setFormData({ ...formData, confirmPassword: text })}
            type="password"
          />
        </View>

        <View style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerButtonText}>Pick Profile Image</Text>
          </TouchableOpacity>

          {profileImage && (
            <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
          )}
        </View>

        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePickerButton: {
    backgroundColor: '#EC888D',
    padding: 10,
    borderRadius: 8,
  },
  imagePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  signUpButton: {
    backgroundColor: '#EC888D',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUp;
