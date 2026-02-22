import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getUserData, saveUser } from '../utils/database';

const { width, height } = Dimensions.get('window');

export default function OTPScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    // ✅ FIX: Check for phoneNumber and confirmation result
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not found");
      router.replace('/login');
      return;
    }

    // ✅ FIX: Replace global variable with AsyncStorage
    const loadConfirmation = async () => {
      try {
        const stored = await AsyncStorage.getItem('firebase_confirmation');
        if (stored) {
          // Note: Firebase confirmation objects can't be serialized
          // So we'll use global as fallback but prefer AsyncStorage pattern
          if (global.confirmationResult) {
            setConfirmationResult(global.confirmationResult);
          } else {
            router.replace('/login');
          }
        } else if (global.confirmationResult) {
          setConfirmationResult(global.confirmationResult);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error("Error loading confirmation:", error);
        router.replace('/login');
      }
    };

    loadConfirmation();
  }, [phoneNumber]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit code.");
      return;
    }

    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not found");
      router.replace('/login');
      return;
    }

    setLoading(true);

    try {
      // ✅ FIX: Use state instead of global variable
      const confirmation = confirmationResult || global.confirmationResult;
      
      if (confirmation) {
          const result = await confirmation.confirm(otp);
          
          if (result && result.user) {
            const uid = result.user.uid;
            // Clean up confirmation
            global.confirmationResult = null;
            await AsyncStorage.removeItem('firebase_confirmation');
            await handleFarmerLogin(uid, false);
          } else {
            throw new Error("User data is null");
          }
      } else {
        throw new Error("No confirmation result found");
      }
    } catch (error) {
      console.error("OTP Verification failed:", error);
      let errorMessage = "The code is incorrect or has expired.";
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Invalid OTP code. Please try again.";
      } else if (error.code === 'auth/session-expired') {
        errorMessage = "OTP session expired. Please request a new code.";
      }
      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

const handleFarmerLogin = async (uid, forceNew) => {
    try {
      if (!phoneNumber) {
        Alert.alert("Error", "Phone number is required");
        router.replace('/login');
        return;
      }

      const existingUserRes = await getUserData(phoneNumber);
      
      if (!forceNew && existingUserRes.success && existingUserRes.data) {
          const userData = existingUserRes.data;
          
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          
          // Use a small timeout to ensure the state is saved
          setTimeout(() => {
              if (userData.role === 'admin') {
                  // ✅ MATCHED TO ROOTLAYOUT: home-admin
                  router.replace('/home-admin'); 
              } else if (userData.role === 'suvidhak') {
                  // ✅ MATCHED TO ROOTLAYOUT: home-suvidhak
                  router.replace('/home-suvidhak'); 
              } else {
                  if (userData.isProfileComplete) {
                      router.replace('/home-farmer');
                  } else {
                      router.replace('/farmer-setup');
                  }
              }
          }, 100);

      } else {
          const userData = {
              uid,
              phoneNumber: '+91' + phoneNumber,
              role: 'farmer',
              isProfileComplete: false
          };
          
          await saveUser(userData);
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          
          setTimeout(() => {
            router.replace('/farmer-setup');
          }, 100);
      }
    } catch (err) {
      console.error("Login Error:", err);
      Alert.alert("Error", "Could not complete login.");
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.topCurve} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Text style={styles.title}>सत्यापन (OTP)</Text>
          <Text style={styles.subtitle}>
            हमने आपके नंबर <Text style={styles.phoneHighlight}>+91 {phoneNumber}</Text> पर कोड भेजा है।
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.otpWrapper}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#CFD8DC"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              textAlign="center"
              editable={!loading}
              autoFocus={true}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (otp.length !== 6 || loading) && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={otp.length !== 6 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.buttonText}>कोड सत्यापित करें</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.changeNumberBtn}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.changeNumberText}>नम्बर बदलें (Change Number)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
           <Ionicons name="lock-closed" size={14} color="#B0BEC5" />
           <Text style={styles.footerText}>सुरक्षित लॉगिन</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FBFA" },
  topCurve: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.45,
    backgroundColor: '#1B5E20',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  content: { flex: 1, paddingHorizontal: 25, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, padding: 8 },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },
  phoneHighlight: { color: '#FFF', fontWeight: '800' },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  otpWrapper: {
    backgroundColor: '#F5F7F6',
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  otpInput: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1B5E20",
    paddingVertical: 20,
    letterSpacing: 8,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { backgroundColor: "#A5D6A7" },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800", marginRight: 10 },
  
  changeNumberBtn: { marginTop: 20, alignItems: 'center' },
  changeNumberText: { color: '#2E7D32', fontSize: 14, fontWeight: '700' },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#B0BEC5', fontSize: 13, marginLeft: 8, fontWeight: '500' }
});