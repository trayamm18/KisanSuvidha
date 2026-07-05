import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Linking,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminFarmersScreen() {
  const router = useRouter();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadFarmers();
    }, []),
  );

  const loadFarmers = async () => {
    setLoading(true);
    try {
      const snapshot = await firestore()
        .collection("users")
        .where("role", "==", "farmer")
        .get();
      const farmersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFarmers(farmersList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMap = (lat, long) => {
    if (lat && long) {
      // Universal Google Maps URL
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
      Linking.openURL(url);
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  // 🔍 Filter Logic
  const filteredFarmers = farmers.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detectedLocality?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderFarmer = ({ item }) => (
    <View style={styles.card}>
      {/* 1. HEADER: Name & Call */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0).toUpperCase() || "F"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name || "Unknown Farmer"}</Text>
          <TouchableOpacity
            style={styles.phoneRow}
            onPress={() => handleCall(item.phoneNumber)}
          >
            <Ionicons name="call" size={14} color={COLORS.primary} />
            <Text style={styles.phone}>{item.phoneNumber}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FARMER</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. LOCATIONS GRID */}
      <View style={styles.locationGrid}>
        {/* Manual Location */}
        <View style={styles.locItem}>
          <View style={styles.locHeader}>
            <Ionicons name="create-outline" size={14} color={COLORS.subText} />
            <Text style={styles.label}> Manual Entry</Text>
          </View>
          <Text style={styles.value} numberOfLines={1}>
            {item.city ? `${item.city}, ${item.state}` : "Not provided"}
          </Text>
        </View>

        {/* GPS Location */}
        <View style={styles.locItem}>
          <View style={styles.locHeader}>
            <Ionicons
              name="navigate-circle-outline"
              size={14}
              color={COLORS.success}
            />
            <Text style={styles.label}> GPS Detected</Text>
          </View>
          <Text
            style={[styles.value, { color: COLORS.success, fontWeight: "600" }]}
            numberOfLines={1}
          >
            {item.detectedLocality || "Waiting for capture..."}
          </Text>
        </View>
      </View>

      {/* 3. MAP ACTION */}
      {item.location && item.location.latitude ? (
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() =>
            handleOpenMap(item.location.latitude, item.location.longitude)
          }
        >
          <Ionicons
            name="map"
            size={18}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.mapBtnText}>View Exact Location</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.noLocContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={COLORS.subText}
          />
          <Text style={styles.noLocText}>GPS Data Not Available</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Farmer Locations</Text>
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
            placeholder="Search name, city or locality..."
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

        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredFarmers}
            keyExtractor={(item) => item.id}
            renderItem={renderFarmer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadFarmers}
                colors={[COLORS.primary]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons
                  name={searchQuery ? "search-outline" : "earth-outline"}
                  size={50}
                  color={COLORS.subText}
                />
                <Text style={styles.emptyText}>
                  {searchQuery ? "No matches found" : "No Farmers Registered"}
                </Text>
              </View>
            }
          />
        )}
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.white },

  contentContainer: { flex: 1, paddingHorizontal: 20 },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginTop: 15,
    marginBottom: 15,
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

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  // Header Section
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  name: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  phoneRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  phone: {
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: "500",
    fontSize: 13,
  },
  badge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "bold", color: COLORS.subText },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },

  // Location Grid
  locationGrid: { marginBottom: 15 },
  locItem: { marginBottom: 8 },
  locHeader: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  label: { fontSize: 11, color: COLORS.subText, textTransform: "uppercase" },
  value: { fontSize: 14, color: COLORS.text, marginLeft: 16 },

  // Map Button
  mapBtn: {
    backgroundColor: COLORS.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 1,
  },
  mapBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },

  noLocContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  noLocText: {
    color: COLORS.subText,
    fontSize: 12,
    fontStyle: "italic",
    marginLeft: 5,
  },

  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: COLORS.subText, marginTop: 10, fontSize: 16 },
});
