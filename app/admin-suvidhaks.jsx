import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getAllSuvidhaks } from "../utils/database";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminSuvidhaksScreen() {
  const router = useRouter();
  const [suvidhaks, setSuvidhaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadSuvidhaks();
    }, []),
  );

  const loadSuvidhaks = async () => {
    setLoading(true);
    const result = await getAllSuvidhaks();
    if (result.success) {
      setSuvidhaks(result.data);
    } else {
      Alert.alert("Error", "Failed to load suvidhaks");
    }
    setLoading(false);
  };

  // ✅ DELETE FUNCTION
  const handleDelete = (id, name) => {
    Alert.alert(
      "Remove Suvidhak?",
      `Are you sure you want to remove "${name}" from the team?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await firestore().collection("users").doc(id).delete();
              Alert.alert("Success", "Suvidhak removed successfully.");
              loadSuvidhaks();
            } catch (error) {
              console.error(error);
              Alert.alert(
                "Error",
                "Could not delete. Check internet connection.",
              );
            }
          },
        },
      ],
    );
  };

  // ✅ CALL FUNCTION
  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // ✅ FILTER LOGIC
  const filteredSuvidhaks = suvidhaks.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.area?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Team</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.subText}
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or area..."
            placeholderTextColor={COLORS.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.subText} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadSuvidhaks}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/admin-add-suvidhak")}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addButtonText}>Add New Suvidhak</Text>
          </TouchableOpacity>

          {/* List Header */}
          <View style={styles.listHeaderRow}>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Found ${filteredSuvidhaks.length} Results`
                : `Active Members (${suvidhaks.length})`}
            </Text>
            <Ionicons name="people-outline" size={20} color={COLORS.subText} />
          </View>

          {filteredSuvidhaks.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={
                    searchQuery ? "search-outline" : "person-remove-outline"
                  }
                  size={40}
                  color={COLORS.subText}
                />
              </View>
              <Text style={styles.emptyText}>
                {searchQuery ? "No matches found" : "No Team Members Found"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? "Try a different name or area."
                  : "Add a Suvidhak to start assigning orders."}
              </Text>
            </View>
          ) : (
            filteredSuvidhaks.map((suvidhak) => (
              <View key={suvidhak.id} style={styles.card}>
                <View style={styles.cardContent}>
                  {/* Avatar with Initials */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {suvidhak.name?.charAt(0).toUpperCase()}
                    </Text>
                    {/* Online Indicator Dot */}
                    <View style={styles.onlineDot} />
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.name}>{suvidhak.name}</Text>

                    {/* Clickable Phone */}
                    <TouchableOpacity
                      style={styles.row}
                      onPress={() => handleCall(suvidhak.phoneNumber)}
                    >
                      <Ionicons name="call" size={14} color={COLORS.primary} />
                      <Text
                        style={[
                          styles.detailText,
                          { color: COLORS.primary, fontWeight: "500" },
                        ]}
                      >
                        {suvidhak.phoneNumber}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.row}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={COLORS.subText}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { color: COLORS.success, fontWeight: "600" },
                        ]}
                      >
                        {suvidhak.area}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions Footer */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      Alert.alert(
                        "Coming Soon",
                        "Performance Analytics Dashboard",
                      )
                    }
                  >
                    <Text style={styles.actionBtnText}>Analytics</Text>
                  </TouchableOpacity>

                  <View style={styles.verticalDivider} />

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(suvidhak.id, suvidhak.name)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={COLORS.error}
                    />
                    <Text style={styles.deleteBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.white },

  contentContainer: { flex: 1, paddingHorizontal: 20 },

  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginTop: 15,
    marginBottom: 20,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text, height: "100%" },

  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },

  addButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },

  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    position: "relative",
  },
  avatarText: { fontSize: 22, fontWeight: "bold", color: COLORS.primary },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  info: { flex: 1 },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  row: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  detailText: { fontSize: 13, color: COLORS.subText, marginLeft: 6 },

  cardActions: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    flexDirection: "row",
  },
  actionBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  actionBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  verticalDivider: {
    width: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 10,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: "600",
    marginLeft: 5,
  },

  emptyState: { alignItems: "center", marginTop: 40 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  emptyText: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.subText,
    marginTop: 5,
    textAlign: "center",
  },
});
