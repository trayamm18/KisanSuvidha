import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getAllOrders } from "../utils/database";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("delivered");

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  const loadOrders = async () => {
    setLoading(true);
    const result = await getAllOrders();
    if (result.success) {
      setOrders(result.data);
    }
    setLoading(false);
  };

  const filteredOrders = orders.filter((o) => o.type === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return COLORS.warning;
      case "assigned":
        return COLORS.info;
      case "out_for_delivery":
        return "#F97316";
      case "delivered":
        return COLORS.success;
      case "completed":
        return COLORS.success;
      default:
        return "#9CA3AF";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "delivered" && styles.activeTab]}
          onPress={() => setActiveTab("delivered")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "delivered" && styles.activeTabText,
            ]}
          >
            Farmer Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "self_sale" && styles.activeTab]}
          onPress={() => setActiveTab("self_sale")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "self_sale" && styles.activeTabText,
            ]}
          >
            Direct Sales
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadOrders}
            colors={[COLORS.primary]}
          />
        }
      >
        {filteredOrders.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={50} color={COLORS.subText} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/admin-order-details",
                  params: { orderId: order.id },
                })
              }
            >
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{order.orderNumber}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {order.status.replace(/_/g, " ").toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <Ionicons
                  name="person-circle-outline"
                  size={18}
                  color={COLORS.subText}
                />
                <Text style={styles.customerName}>{order.customerName}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.label}>Total Amount</Text>
                  <Text style={styles.amount}>
                    ₹{order.totalAmount?.toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
                  {order.suvidhakName && (
                    <Text style={styles.assignedTo}>
                      By: {order.suvidhakName}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
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
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.white },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.subText },
  activeTabText: { color: COLORS.primary },

  content: { flex: 1, padding: 20 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  customerName: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 6,
    fontWeight: "500",
  },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 12, color: COLORS.subText },
  amount: { fontSize: 16, fontWeight: "bold", color: COLORS.success },
  date: { fontSize: 12, color: COLORS.subText, marginBottom: 2 },
  assignedTo: { fontSize: 12, color: COLORS.primary, fontStyle: "italic" },

  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: COLORS.subText, marginTop: 10, fontSize: 16 },
});
