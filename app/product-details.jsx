import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { productData } = useLocalSearchParams();
  const [toastVisible, setToastVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);

  // Parse product once; hooks must run unconditionally
  const product = useMemo(() => {
    try {
      if (!productData) return null;
      return JSON.parse(productData);
    } catch {
      return null;
    }
  }, [productData]);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0] || null);
    }
  }, [product]);

  useEffect(() => {
    if (productData !== undefined && product === null) {
      Alert.alert("Error", "Invalid product data. Please try again.");
      router.back();
    }
  }, [productData, product]);

  if (!product) {
    return null;
  }

  // ✅ CALCULATION: Price & Discount logic
  const originalPrice = selectedVariant
    ? selectedVariant.price
    : product.price || 0;
  const discountPercent = product.discountPercentage || 0;
  const finalPrice =
    discountPercent > 0
      ? Math.round(originalPrice - originalPrice * (discountPercent / 100))
      : originalPrice;

  // ✅ UPDATED: Accepts 'true' for Buy Now, 'false' for Add to Cart
  const handleAddToCart = async (goToCart = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // --- YOUR ORIGINAL LOGIC STARTS HERE (UNCHANGED) ---
      const uniqueId = selectedVariant
        ? `${product.id}-${selectedVariant.quantity}${selectedVariant.unit}`
        : product.id;

      const cartItem = {
        ...product,
        id: uniqueId,
        name: selectedVariant
          ? `${product.name} (${selectedVariant.quantity}${selectedVariant.unit})`
          : product.name,
        price: finalPrice,
        quantity: qty,
        selectedSize: selectedVariant
          ? `${selectedVariant.quantity}${selectedVariant.unit}`
          : product.unit,
      };

      const savedCart = await AsyncStorage.getItem("farmerCart");
      let cart = savedCart ? JSON.parse(savedCart) : [];

      const existingIndex = cart.findIndex((item) => item.id === uniqueId);
      if (existingIndex > -1) {
        cart[existingIndex].quantity += qty;
      } else {
        cart.push(cartItem);
      }

      await AsyncStorage.setItem("farmerCart", JSON.stringify(cart));
      // --- YOUR ORIGINAL LOGIC ENDS HERE ---

      // ✅ NEW LOGIC: Check which button was clicked
      if (goToCart) {
        // IF "BUY NOW": Go straight to Cart Page
        router.push({
          pathname: "/farmer-cart",
          params: { cartData: JSON.stringify(cart) },
        });
      } else {
        // IF "ADD TO CART": Show Toast & STAY on this page
        setToastVisible(true);

        setTimeout(() => {
          setToastVisible(false);
          // ❌ I removed router.back() so you can keep shopping here
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCallAdmin = () => {
    Linking.openURL("tel:+919876543210"); // Replace with your actual number
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/farmer-cart")}>
          <Ionicons name="cart-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
            />
          ) : (
            <Ionicons name="image-outline" size={100} color="#ccc" />
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.brandText}>{product.category}</Text>
          <Text style={styles.titleText}>{product.name}</Text>

          {/* ✅ DYNAMIC PRICE SECTION */}
          {product.isPriceVisible !== false ? (
            <View style={styles.priceRow}>
              <Text style={styles.finalPrice}>₹{finalPrice}</Text>
              {discountPercent > 0 && (
                <>
                  <Text style={styles.mrpText}>₹{originalPrice}</Text>
                  <Text style={styles.discountText}>
                    {discountPercent}% OFF
                  </Text>
                </>
              )}
            </View>
          ) : (
            <View style={styles.callBadge}>
              <Text style={styles.callBadgeText}>Contact for Best Price</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* ✅ SIZE SELECTION CHIPS (Flipkart Style) */}
          {/* ✅ SIZE SELECTION CHIPS (Fixed "Disappearing Green" Issue) */}
          <Text style={styles.sectionLabel}>Select Size</Text>
          <View style={styles.chipContainer}>
            {product.variants?.map((v, index) => {
              // ✅ THE FIX: Compare values (Qty & Unit), not the object memory
              const isSelected =
                selectedVariant?.quantity === v.quantity &&
                selectedVariant?.unit === v.unit;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sizeChip,
                    isSelected && styles.activeChip, // ✅ Use new check
                  ]}
                  onPress={() => setSelectedVariant(v)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.activeChipText, // ✅ Use new check
                    ]}
                  >
                    {v.quantity}
                    {v.unit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantity Selector */}
          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty(Math.max(1, qty - 1))}
            >
              <Ionicons name="remove" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQty(qty + 1)}
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Product Description</Text>
          <Text style={styles.descriptionText}>
            {product.description ||
              "High quality agricultural product for better yield."}
          </Text>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ FIXED BOTTOM BUTTONS */}
      <View style={styles.footer}>
        {product.isPriceVisible !== false ? (
          <>
            <TouchableOpacity
              style={styles.secondaryBtn}
              // ✅ Pass 'false' to Stay on Page (Add to Cart)
              onPress={() => handleAddToCart(false)}
            >
              <Text style={styles.secondaryBtnText}>ADD TO CART</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryBtn}
              // ✅ Pass 'true' to Go to Cart (Buy Now)
              onPress={() => handleAddToCart(true)}
            >
              <Text style={styles.primaryBtnText}>BUY NOW</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: "#0D47A1" }]}
            onPress={handleCallAdmin}
          >
            <Ionicons
              name="call"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.primaryBtnText}>CONTACT FOR PRICE</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* PASTE THE CODE BELOW THIS LINE 👇 */}
      {toastVisible && (
        <View style={styles.toastContainer}>
          <View style={styles.toastBox}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.toastText}>Added to Cart Successfully!</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  customHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  productImage: { width: "80%", height: "80%", resizeMode: "contain" },
  infoSection: { padding: 20 },
  brandText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 5,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 10 },
  finalPrice: { fontSize: 26, fontWeight: "bold", color: "#2E7D32" },
  mrpText: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  discountText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "bold",
    marginLeft: 10,
  },
  callBadge: {
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  callBadgeText: { color: "#B45309", fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 20 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    marginTop: 10,
  },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  sizeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeChip: { borderColor: "#2E7D32", backgroundColor: "#E8F5E9" },
  chipText: { fontSize: 14, color: "#666" },
  activeChipText: { color: "#2E7D32", fontWeight: "bold" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyValue: { fontSize: 18, fontWeight: "bold" },
  descriptionText: { fontSize: 15, color: "#666", lineHeight: 22 },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2E7D32",
    alignItems: "center",
    marginRight: 10,
  },
  secondaryBtnText: { color: "#2E7D32", fontWeight: "bold" },
  primaryBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "bold" },
  toastContainer: {
    position: "absolute",
    top: 50, // Slides in near the top
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999, // Floating on top
  },
  toastBox: {
    backgroundColor: "#2E7D32", // Deep green
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 14,
  },
});
