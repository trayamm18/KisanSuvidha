import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getAllSuvidhaks } from "../utils/database";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminOrderDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Suvidhak Assignment Logic
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [suvidhaks, setSuvidhaks] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadOrderDetails();
    fetchSuvidhaks();
  }, []);

  const loadOrderDetails = async () => {
    try {
      const doc = await firestore().collection("orders").doc(orderId).get();
      if (doc.exists) {
        setOrder({ id: doc.id, ...doc.data() });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuvidhaks = async () => {
    const result = await getAllSuvidhaks();
    if (result.success) setSuvidhaks(result.data);
  };

  const handleAssign = async (suvidhak) => {
    Alert.alert("Assign Order", `Assign this order to ${suvidhak.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setAssigning(true);
          try {
            await firestore().collection("orders").doc(orderId).update({
              status: "assigned",
              suvidhakId: suvidhak.id,
              suvidhakName: suvidhak.name,
              suvidhakPhone: suvidhak.phoneNumber,
              assignedAt: firestore.FieldValue.serverTimestamp(),
            });

            setShowAssignModal(false);
            loadOrderDetails(); // Refresh
            Alert.alert("Success", "Order assigned successfully!");
          } catch (error) {
            Alert.alert("Error", "Failed to assign order.");
          } finally {
            setAssigning(false);
          }
        },
      },
    ]);
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading || !order)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 1. STATUS CARD */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.label}>Current Status</Text>
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
                  {order.status.toUpperCase().replace(/_/g, " ")}
                </Text>
              </View>
            </View>
            {/* Re-Assign Button */}
            {order.type === "delivered" &&
              (order.status === "pending" || order.status === "assigned") && (
                <TouchableOpacity
                  style={styles.assignBtn}
                  onPress={() => setShowAssignModal(true)}
                >
                  <Ionicons name="person-add-outline" size={16} color="#FFF" />
                  <Text style={styles.assignBtnText}>
                    {order.status === "assigned" ? "Re-Assign" : "Assign"}
                  </Text>
                </TouchableOpacity>
              )}
          </View>

          {order.suvidhakName && (
            <View style={styles.assignedBox}>
              <Text style={styles.assignedLabel}>🚚 Assigned Suvidhak</Text>
              <Text style={styles.assignedValue}>{order.suvidhakName}</Text>
              <Text style={styles.assignedPhone}>{order.suvidhakPhone}</Text>
            </View>
          )}
        </View>

        {/* 2. CUSTOMER CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Details</Text>

          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {order.customerName?.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerAddress}>
                {order.address || order.customerAddress}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleCall(order.customerPhone)}
              style={styles.callBtn}
            >
              <Ionicons name="call" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. PAYMENT INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.rowLabel}>Method</Text>
            <Text style={styles.rowValue}>
              {order.paymentMethod?.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.rowBetween, { marginTop: 10 }]}>
            <Text style={styles.rowLabel}>Payment Status</Text>
            <View
              style={[
                styles.payBadge,
                {
                  backgroundColor:
                    order.paymentStatus === "paid" ? "#DEF7EC" : "#FDE8E8",
                },
              ]}
            >
              <Text
                style={[
                  styles.payText,
                  {
                    color:
                      order.paymentStatus === "paid"
                        ? COLORS.success
                        : COLORS.error,
                  },
                ]}
              >
                {order.paymentStatus === "paid" ? "PAID" : "PENDING"}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. ORDER ITEMS (RECEIPT STYLE) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.receiptContainer}>
            {order.products.map((item, index) => (
              <View key={index} style={styles.productRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodName}>{item.name}</Text>
                  <Text style={styles.prodQty}>
                    {item.quantity} x ₹{item.price}
                  </Text>
                </View>
                <Text style={styles.prodTotal}>
                  ₹{item.price * item.quantity}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* SUVIDHAK SELECTION MODAL */}
      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Suvidhak</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {assigning ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginTop: 20 }}
              />
            ) : (
              <FlatList
                data={suvidhaks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suvidhakItem}
                    onPress={() => handleAssign(item)}
                  >
                    <View style={styles.suvAvatar}>
                      <Text style={styles.suvAvatarText}>
                        {item.name?.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suvidhakName}>{item.name}</Text>
                      <Text style={styles.suvidhakArea}>{item.area}</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={COLORS.subText}
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: "center",
                      color: COLORS.subText,
                      marginTop: 20,
                    }}
                  >
                    No active Suvidhaks found.
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
  },

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

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.subText,
    marginBottom: 10,
    textTransform: "uppercase",
  },

  // Status Section
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 12, color: COLORS.subText, marginBottom: 4 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  assignBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  assignBtnText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 6,
  },

  assignedBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  assignedLabel: {
    fontSize: 10,
    color: COLORS.subText,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  assignedValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 2,
  },
  assignedPhone: { fontSize: 12, color: COLORS.primary, marginTop: 1 },

  // Customer Section
  customerRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  customerName: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  customerAddress: { fontSize: 13, color: COLORS.subText, marginTop: 2 },
  callBtn: { padding: 10, backgroundColor: "#F0F9FF", borderRadius: 20 },

  // Payment Section
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { fontSize: 14, color: COLORS.text },
  rowValue: { fontSize: 14, fontWeight: "bold", color: COLORS.text },
  payBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  payText: { fontSize: 12, fontWeight: "bold" },

  // Product Receipt
  receiptContainer: { marginTop: 5 },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  prodName: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  prodQty: { fontSize: 12, color: COLORS.subText, marginTop: 1 },
  prodTotal: { fontSize: 14, fontWeight: "bold", color: COLORS.text },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: COLORS.success },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.text },

  suvidhakItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suvAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  suvAvatarText: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  suvidhakName: { fontSize: 15, fontWeight: "bold", color: COLORS.text },
  suvidhakArea: { fontSize: 12, color: COLORS.subText },
});
