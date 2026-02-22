import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FarmerCartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [params.cartData]); // ✅ Added dependency to reload if params change

  const loadData = async () => {
    try {
      // 1. Get Cart Data passed from Home OR Storage
      if (params.cartData) {
        try {
          setCartItems(JSON.parse(params.cartData));
        } catch (parseError) {
          console.error("Error parsing cart data from params:", parseError);
          // Fallback to storage
          const storedCart = await AsyncStorage.getItem("farmerCart");
          if (storedCart) {
            try {
              setCartItems(JSON.parse(storedCart));
            } catch (e) {
              console.error("Error parsing stored cart:", e);
              setCartItems([]);
            }
          }
        }
      } else {
        // Fallback: Try loading from storage if not passed via params
        const storedCart = await AsyncStorage.getItem("farmerCart");
        if (storedCart) {
          try {
            setCartItems(JSON.parse(storedCart));
          } catch (e) {
            console.error("Error parsing stored cart:", e);
            setCartItems([]);
          }
        }
      }

      // 2. Get User Data
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    // ✅ Check if user is logged in (Optional: Remove if you want guest checkout)
    // if (!user) {
    //   Alert.alert("Login Required", "Please login to place an order");
    //   return;
    // }

    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items to your cart first.");
      return;
    }

    // Navigate to Checkout Screen with cart data
    router.push({
      pathname: "/farmer-checkout",
      params: {
        cartData: JSON.stringify(cartItems),
        total: calculateTotal(),
      },
    });
  };

  const removeItem = async (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    await AsyncStorage.setItem("farmerCart", JSON.stringify(updatedCart));
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="cart-off" size={80} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopNowBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const calculateOriginalTotal = () => {
    return cartItems.reduce((sum, item) => {
      const original =
        item.variants && item.variants.length > 0
          ? item.variants[0].price
          : item.price;
      return sum + original * item.quantity;
    }, 0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Cart Items List */}
        {cartItems.map((item, index) => (
          <View key={index} style={styles.cartItem}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            ) : (
              <View style={styles.itemPlaceholder}>
                <Ionicons name="image-outline" size={24} color="#ccc" />
              </View>
            )}

            <View style={styles.itemDetails}>
              {/* ✅ UPDATED: Item Name handles new format */}
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>

              {/* ✅ UPDATED: Shows Variant Size specifically */}
              <View style={styles.specRow}>
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeText}>
                    {item.selectedSize || item.unit || "Std"}
                  </Text>
                </View>
                <Text style={styles.qtyText}>x {item.quantity}</Text>
              </View>

              <Text style={styles.itemTotal}>
                ₹{item.price * item.quantity}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeItem(item.id)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={22} color="#FF5252" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Bill Details */}
        {/* Bill Details */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total (MRP)</Text>
            <Text style={styles.billValue}>₹{calculateOriginalTotal()}</Text>
          </View>

          {/* ✅ SHOW SAVINGS IF APPLICABLE */}
          {calculateOriginalTotal() - calculateTotal() > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount</Text>
              <Text style={[styles.billValue, { color: "#EF4444" }]}>
                -₹{calculateOriginalTotal() - calculateTotal()}
              </Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={[styles.billValue, { color: "#2E7D32" }]}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer / Place Order Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalValue}>₹{calculateTotal()}</Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>Proceed to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#333",
  },
  backBtn: { padding: 5 },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: { fontSize: 18, color: "#666", marginTop: 20, marginBottom: 20 },
  shopNowBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopNowText: { color: "#fff", fontWeight: "bold" },

  content: { padding: 20 },

  // Cart Item
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    elevation: 1,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    resizeMode: "contain",
  },
  itemPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: { flex: 1, marginLeft: 15 },
  itemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },

  // ✅ NEW: Size & Qty Row Styles
  specRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  sizeBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 10,
  },
  sizeText: { color: "#2E7D32", fontSize: 12, fontWeight: "bold" },
  qtyText: { color: "#666", fontSize: 13 },

  itemTotal: { fontSize: 16, fontWeight: "bold", color: "#2E7D32" },
  deleteBtn: { padding: 10 },

  // Bill Card
  billCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 1,
  },
  billTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  billLabel: { color: "#666", fontSize: 14 },
  billValue: { color: "#333", fontSize: 14, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#333" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#2E7D32" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  footerTotalLabel: { fontSize: 12, color: "#666" },
  footerTotalValue: { fontSize: 24, fontWeight: "bold", color: "#333" },
  placeOrderBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 3,
  },
  placeOrderText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
