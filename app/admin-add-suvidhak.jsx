import { Ionicons } from "@expo/vector-icons"; // ✅ Icons
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
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
import { saveUser } from "../utils/database";

import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminAddSuvidhakScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSuvidhak = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Required", "Please enter suvidhak name");
      return;
    }
    if (phoneNumber.length !== 10) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number",
      );
      return;
    }
    if (!area.trim()) {
      Alert.alert("Required", "Please enter assigned area");
      return;
    }

    setLoading(true);

    try {
      const tempUid = `user_${phoneNumber}`;

      const userData = {
        uid: tempUid,
        phoneNumber: "+91" + phoneNumber,
        role: "suvidhak",
        name: name.trim(),
        area: area.trim(),
      };

      const result = await saveUser(userData);

      if (result.success) {
        Alert.alert("Success", `Suvidhak assigned successfully!`, [
          { text: "Done", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Failed to add suvidhak. Please try again.");
      }
    } catch (error) {
      console.error("Error adding suvidhak:", error);
      Alert.alert("System Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Suvidhak</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            {/* NAME INPUT */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Rajesh Kumar"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* PHONE INPUT */}
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputContainer, { paddingLeft: 0 }]}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!loading}
              />
            </View>

            {/* AREA INPUT */}
            <Text style={styles.label}>Assigned Area</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: Bhopal North, Indore"
                placeholderTextColor="#9CA3AF"
                value={area}
                onChangeText={setArea}
                editable={!loading}
              />
            </View>

            {/* INFO BOX */}
            <View style={styles.infoBox}>
              <View style={styles.infoIconCircle}>
                <Ionicons
                  name="information"
                  size={20}
                  color={COLORS.infoText}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Access Details</Text>
                <Text style={styles.infoText}>
                  The Suvidhak can login using this phone number. All orders
                  from{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    "{area || "this area"}"
                  </Text>{" "}
                  will be assigned to them.
                </Text>
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAddSuvidhak}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Confirm Suvidhak</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 60,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  content: { flex: 1, padding: 20 },
  formSection: { marginTop: 10 },

  // Inputs
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: "100%",
  },

  // Phone Specific
  countryCodeContainer: {
    backgroundColor: "#E0E0E0",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  countryCodeText: { fontSize: 15, fontWeight: "600", color: COLORS.text },

  // Info Box
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.infoBg,
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.2)",
  },
  infoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.infoText,
    marginBottom: 4,
  },
  infoText: { fontSize: 13, color: "#374151", lineHeight: 18 },

  // Button
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: { backgroundColor: "#A5D6A7" },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
