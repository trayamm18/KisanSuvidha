import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getOrdersBySuvidhak } from "../utils/database";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function SuvidhakHistoryScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams(); // 'delivery' or 'sale'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(filter || "all");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      const user = JSON.parse(userDataStr);

      // ✅ FIX 1: Removed 'all' parameter. Calling with just UID fetches EVERYTHING.
      const result = await getOrdersBySuvidhak(user.uid);

      if (result.success) {
        // ✅ FIX 2: Adjusted filter to ensure 'self_sale' always shows up
        const history = result.data.filter(
          (o) =>
            o.type === "self_sale" ||
            o.status === "delivered" ||
            o.status === "completed",
        );
        setOrders(history);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredList = () => {
    // ✅ FIX 3: Robust filtering based on your database 'type' fields
    if (activeTab === "delivery")
      return orders.filter((o) => o.type !== "self_sale");
    if (activeTab === "sale")
      return orders.filter((o) => o.type === "self_sale");
    return orders;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {/* Handle potential missing timestamp gracefully */}
        <Text style={styles.date}>
          {item.createdAt?.seconds
            ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
            : "Just now"}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                item.type === "self_sale" ? "#DCFCE7" : "#E0F2FE",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: item.type === "self_sale" ? "#16A34A" : "#0284C7" },
            ]}
          >
            {item.type === "self_sale" ? "Self Sale" : "Delivery"}
          </Text>
        </View>
      </View>

      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.amount}>
        ₹{(parseFloat(item.totalAmount) || 0).toLocaleString()}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.itemsText}>
        {/* ✅ FIXED LINE BELOW: Checks for 'cash' or 'Cash' case-insensitively */}
        {item.products ? item.products.length : 0} Items •{" "}
        {item.paymentMethod?.toLowerCase() === "cash" ? "💵 Cash" : "📱 UPI"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "delivery" && styles.activeTab]}
          onPress={() => setActiveTab("delivery")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "delivery" && styles.activeTabText,
            ]}
          >
            Deliveries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sale" && styles.activeTab]}
          onPress={() => setActiveTab("sale")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sale" && styles.activeTabText,
            ]}
          >
            Sales
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={getFilteredList()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="document-text-outline"
                size={50}
                color={COLORS.subText}
              />
              <Text style={styles.emptyText}>No history found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },

  tabs: { flexDirection: "row", padding: 15, gap: 10 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.subText, fontWeight: "600" },
  activeTabText: { color: COLORS.white },

  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  date: { fontSize: 12, color: COLORS.subText },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: "700" },

  customerName: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.success,
    marginTop: 4,
  },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },
  itemsText: { fontSize: 12, color: COLORS.subText },

  empty: { alignItems: "center", marginTop: 100, opacity: 0.7 },
  emptyText: { marginTop: 10, color: COLORS.subText, fontSize: 16 },
});
