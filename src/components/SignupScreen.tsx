import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { InputField } from './InputField';

// הגדרת הממשק לכתובת
interface IAddress {
  city: string;
  street: string;
  building: number;
}

export const SignUp = () => {
  //const navigation = useNavigation();
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

  const handleSignUp = async () => {
    try {
      const form = new FormData();

      form.append("name", formData.name);
      form.append("userName", formData.userName);
      form.append("email", formData.email);
      form.append("password", formData.password);
      form.append("confirmPassword", formData.confirmPassword);
      form.append("address", JSON.stringify(formData.address));

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

  const handleTermsPress = () => {
    //Linking.openURL('https://yourapp.com/terms');
  };

  const handlePrivacyPress = () => {
    //Linking.openURL('https://yourapp.com/privacy');
  };

  const handleLoginPress = () => {
    //navigation.navigate('Login');
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
              setFormData({
                ...formData,
                address: { ...formData.address, city: text }
              })
            }
            type="text"
            keyboardType="default"
          />

          <InputField
            label="Street"
            value={formData.address.street}
            onChange={(text) =>
              setFormData({
                ...formData,
                address: { ...formData.address, street: text }
              })
            }
            type="text"
            keyboardType="default"
          />

          <InputField
            label="Building"
            value={formData.address.building.toString()}
            onChange={(text) => setFormData({ ...formData, address: { ...formData.address, building: parseInt(text) || 0 } })}
            type="number"
            keyboardType="numeric"
          />

          <InputField
            label="Password"
            value={formData.password}
            onChange={(text) => setFormData({ ...formData, password: text })}
            type="password"
            icon="https://cdn.builder.io/api/v1/image/assets/f3ec27c98b354cc2a57aa125506b44a1/a7f010f1d11c588e2b2a6e60c03e8f48cf0d74c750e117fdfe71b60e4bf999cc"
          />

          <InputField
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(text) => setFormData({ ...formData, confirmPassword: text })}
            type="password"
            icon="https://cdn.builder.io/api/v1/image/assets/f3ec27c98b354cc2a57aa125506b44a1/a7f010f1d11c588e2b2a6e60c03e8f48cf0d74c750e117fdfe71b60e4bf999cc"
          />
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to{' '}
            <Text style={styles.termsLink} onPress={handleTermsPress}>
              Terms of Use
            </Text>
            {' '}and{' '}
            <Text style={styles.termsLink} onPress={handlePrivacyPress}>
              Privacy Policy
            </Text>
          </Text>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink} onPress={handleLoginPress}>
                Log In
              </Text>
            </Text>
          </View>
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
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  termsText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#32201C',
    fontWeight: '600',
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
  loginContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    color: '#EC888D',
    fontWeight: '600',
  },
});

export default SignUp;
