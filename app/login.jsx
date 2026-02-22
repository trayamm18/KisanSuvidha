import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, StatusBar,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from "react-native";
import { auth } from '../config/firebase'; // Keeping your original import

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ YOUR ORIGINAL LOGIC - UNTOUCHED
  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      // Send OTP via Firebase using your auth pattern
      const confirmation = await auth().signInWithPhoneNumber('+91' + phoneNumber);
      
      // ✅ FIX: Store confirmation (keeping global as fallback for compatibility)
      global.confirmationResult = confirmation;
      // Store flag in AsyncStorage (confirmation object itself can't be serialized)
      await AsyncStorage.setItem('firebase_confirmation', 'pending');
      
      router.push({
        pathname: '/otp',
        params: { phoneNumber }
      });
    } catch (error) {
      console.error("OTP Error:", error);
      let errorMessage = "Failed to send OTP. Please try again.";
      if (error.code === 'auth/invalid-phone-number') errorMessage = "Invalid phone number format";
      else if (error.code === 'auth/too-many-requests') errorMessage = "Too many attempts. Please try again later.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Top Visual Section */}
        <View style={styles.brandingSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={42} color="#2E7D32" />
          </View>
          <Text style={styles.title}>Kisan Suvidha</Text>
          <Text style={styles.subtitle}>किसानों की प्रगति का डिजिटल साथी</Text>
        </View>

        {/* Input Card Section */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Login to your account</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              placeholder="00000 00000"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!loading}
              placeholderTextColor="#A0A0A0"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, (phoneNumber.length !== 10 || loading) && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={phoneNumber.length !== 10 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.buttonText}>Send OTP Verification</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.terms}>
            Secure Login • Terms & Privacy Policy Apply
          </Text>
         
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9F8" },
  content: { flex: 1, padding: 30, justifyContent: 'center' },
  brandingSection: { alignItems: 'center', marginBottom: 50 },
  iconCircle: { 
    width: 85, height: 85, borderRadius: 42, backgroundColor: '#fff', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
  },
  title: { fontSize: 34, fontWeight: "900", color: "#1B5E20", letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 8, textAlign: 'center', fontWeight: '500' },
  
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  cardLabel: { fontSize: 13, fontWeight: '800', color: '#888', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F2",
    borderRadius: 15,
    paddingHorizontal: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  countryCode: { fontSize: 18, fontWeight: "700", color: "#2E7D32" },
  divider: { width: 1, height: 24, backgroundColor: '#CCC', marginHorizontal: 15 },
  input: { flex: 1, fontSize: 18, paddingVertical: 18, fontWeight: '600', color: '#333' },
  
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: '#2E7D32',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  buttonDisabled: { backgroundColor: "#A5D6A7", elevation: 0 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "bold", marginRight: 10 },
  
  footer: { marginTop: 40, alignItems: 'center' },
  terms: { color: "#999", fontSize: 12, fontWeight: '500' },
  testBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 15 },
  testText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' }
});