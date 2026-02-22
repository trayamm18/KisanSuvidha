import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SuvidhakCustomerDetailsScreen() {
  const router = useRouter();
  // Get data passed from the Cart screen
  const { cart, total } = useLocalSearchParams();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerVillage, setCustomerVillage] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const cartItems = cart ? JSON.parse(cart) : [];
  const totalAmount = total ? parseFloat(total) : 0;

  const handleContinue = () => {
    // Validation
    if (!customerName.trim()) {
      Alert.alert("Required", "Please enter customer name");
      return;
    }

    if (customerPhone.length !== 10) {
      Alert.alert("Invalid", "Please enter valid 10-digit phone number");
      return;
    }

    if (!customerVillage.trim()) {
      Alert.alert("Required", "Please enter village/area");
      return;
    }

    // Navigate to payment screen with ALL data
    router.push({
      pathname: "/suvidhak-payment",
      params: {
        cart,
        total,
        customerName: customerName.trim(),
        customerPhone: "+91" + customerPhone,
        customerVillage: customerVillage.trim(),
        customerAddress: customerAddress.trim(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Details</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Order Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.iconCircle}>
              <Feather name="shopping-bag" size={24} color="#1976D2" />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>ORDER TOTAL</Text>
              <Text style={styles.summaryAmount}>
                ₹{totalAmount.toLocaleString()}
              </Text>
              <Text style={styles.summarySub}>
                {cartItems.length} items in cart
              </Text>
            </View>
          </View>

          {/* Customer Form */}
          <Text style={styles.sectionTitle}>CUSTOMER INFORMATION</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Feather
                name="user"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#999"
                value={customerName}
                onChangeText={setCustomerName}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Feather
                name="smartphone"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <Text style={styles.countryCode}>+91</Text>
              <View style={styles.verticalDivider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Village / Area <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Feather
                name="map-pin"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Sehore, Bhopal Rural"
                placeholderTextColor="#999"
                value={customerVillage}
                onChangeText={setCustomerVillage}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address (Optional)</Text>
            <View style={[styles.inputContainer, { alignItems: "flex-start" }]}>
              <Feather
                name="home"
                size={20}
                color="#666"
                style={[styles.inputIcon, { marginTop: 12 }]}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="House no, landmark, etc."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                value={customerAddress}
                onChangeText={setCustomerAddress}
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>Continue to Payment</Text>
            <Feather
              name="arrow-right"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1976D2",
    paddingTop: Platform.OS === "ios" ? 60 : 50,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  placeholder: { width: 40 },

  content: { flex: 1, padding: 20 },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  summaryInfo: { flex: 1 },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  summaryAmount: { fontSize: 22, fontWeight: "800", color: "#1976D2" },
  summarySub: { fontSize: 13, color: "#999" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    marginBottom: 15,
    letterSpacing: 0.5,
  },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  required: { color: "#D32F2F" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
  },
  inputIcon: { marginLeft: 15, marginRight: 10 },

  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#333" },

  phoneInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#333" },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E0E0E0",
    marginRight: 10,
  },

  textArea: { height: 80, textAlignVertical: "top", paddingTop: 12 },

  continueButton: {
    flexDirection: "row",
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 3,
  },
  continueButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
