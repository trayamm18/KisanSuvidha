import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getOrdersBySuvidhak } from "../utils/database";

export default function SuvidhakDeliveriesScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'completed'

  useFocusEffect(
    useCallback(() => {
      loadDeliveries();
    }, []),
  );

  const loadDeliveries = async () => {
    setLoading(true);
    const userDataStr = await AsyncStorage.getItem("userData");
    const user = JSON.parse(userDataStr);

    // Fetch only 'delivered' type orders (Farmer Orders) assigned to this Suvidhak
    const result = await getOrdersBySuvidhak(user.uid, "delivered");
    if (result.success) {
      setOrders(result.data);
    }
    setLoading(false);
  };

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "pending") {
      return ["assigned", "out_for_delivery"].includes(o.status);
    } else {
      return o.status === "delivered";
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Deliveries</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadDeliveries}
            tintColor="#1976D2"
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather
              name="package"
              size={50}
              color="#ccc"
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySub}>
              No deliveries found in this section.
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/suvidhak-delivery-details",
                  params: { orderId: order.id },
                })
              }
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderLabel}>ORDER NO.</Text>
                  <Text style={styles.orderId}>#{order.orderNumber}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        activeTab === "pending" ? "#FFF3E0" : "#E8F5E9",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: activeTab === "pending" ? "#EF6C00" : "#2E7D32",
                      },
                    ]}
                  >
                    {order.status.replace(/_/g, " ").toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Feather
                  name="user"
                  size={16}
                  color="#666"
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.customer}>{order.customerName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Feather
                  name="map-pin"
                  size={16}
                  color="#666"
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.address}>{order.customerAddress}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.amount}>Collect: ₹{order.totalAmount}</Text>
                <View style={styles.detailsLink}>
                  <Text style={styles.linkText}>View Details</Text>
                  <Feather name="chevron-right" size={16} color="#1976D2" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    backgroundColor: "#1976D2",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  backBtn: { padding: 5 },

  tabContainer: {
    backgroundColor: "#1976D2",
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  tabWrapper: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#fff" },
  tabText: { fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  activeTabText: { color: "#1976D2", fontWeight: "bold" },

  content: { padding: 20 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingBottom: 10,
  },
  orderLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "bold",
    marginBottom: 2,
  },
  orderId: { fontWeight: "bold", color: "#333", fontSize: 14 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "800" },

  infoRow: { flexDirection: "row", marginBottom: 8, paddingRight: 20 },
  customer: { fontSize: 16, fontWeight: "600", color: "#333", marginLeft: 10 },
  address: { fontSize: 14, color: "#666", marginLeft: 10, lineHeight: 20 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  amount: { fontWeight: "700", color: "#1976D2", fontSize: 15 },

  detailsLink: { flexDirection: "row", alignItems: "center" },
  linkText: {
    color: "#1976D2",
    fontWeight: "600",
    fontSize: 13,
    marginRight: 2,
  },

  emptyState: { alignItems: "center", marginTop: 80, opacity: 0.7 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  emptySub: { fontSize: 14, color: "#666", marginTop: 5 },
});
