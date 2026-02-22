import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"; // ✅ Added Alert

export default function SuvidhakCartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (params.cart) setCartItems(JSON.parse(params.cart));
  }, [params.cart]);

  const updateQuantity = (id, delta) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCartItems(updated);

    // If cart is empty, go back automatically
    if (updated.length === 0) {
      Alert.alert("Cart Cleared", "Your cart is empty. Returning to catalog.");
      router.replace({
        pathname: "/suvidhak-add-sale",
        params: { cart: JSON.stringify([]) },
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  // ✅ Renamed to handleContinue to match your project style
  const handleContinue = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Please add items before proceeding.");
      return;
    }
    router.push({
      pathname: "/suvidhak-customer-details",
      params: { cart: JSON.stringify(cartItems), total: calculateTotal() },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* ✅ Updated to sync cart when going back */}
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/suvidhak-add-sale",
              params: { cart: JSON.stringify(cartItems) },
            })
          }
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, -1)}
                style={styles.qtyBtn}
              >
                <Feather name="minus" size={16} color="#1976D2" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, 1)}
                style={styles.qtyBtn}
              >
                <Feather name="plus" size={16} color="#1976D2" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            ₹{calculateTotal().toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            cartItems.length === 0 && { backgroundColor: "#ccc" },
          ]}
          onPress={handleContinue}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.nextBtnText}>Add Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#1976D2",
    paddingTop: 50,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  content: { padding: 15 },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  itemImage: { width: 50, height: 50, borderRadius: 5 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontWeight: "bold", color: "#333" },
  itemPrice: { color: "#1976D2", fontWeight: "bold" },
  qtyControls: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    padding: 5,
    borderWidth: 1,
    borderColor: "#1976D2",
    borderRadius: 5,
  },
  qtyText: { marginHorizontal: 10, fontWeight: "bold" },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 12, color: "#666" },
  totalValue: { fontSize: 20, fontWeight: "bold", color: "#1976D2" },
  nextBtn: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  nextBtnText: { color: "#fff", fontWeight: "bold" },
});
