import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router"; // ✅ Added useLocalSearchParams
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllProducts } from "../utils/database";

export default function SuvidhakAddSaleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // ✅ To catch the updated cart from the Review screen
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // State for Variant Modal
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] =
    useState(null);
  const [tempVariant, setTempVariant] = useState(null);

  // ✅ SYNC LOGIC: This ensures that if you remove an item in the Review Cart screen,
  // it is also removed here when you press the back button.
  useEffect(() => {
    if (params.cart) {
      setCart(JSON.parse(params.cart));
    }
  }, [params.cart]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await getAllProducts();
      if (result.success) {
        const inStockProducts = result.data.filter((p) => p.inStock);
        setProducts(inStockProducts);
      } else {
        Alert.alert("Error", "Failed to load products.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Action Failed", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (
      product.variants &&
      product.variants.length > 0 &&
      !product.isVariantSelected
    ) {
      setSelectedProductForVariant(product);
      setVariantModalVisible(true);
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        ),
      );
    } else {
      setCart(cart.filter((item) => item.id !== productId));
    }
  };

  const getCartQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleContinue = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add at least one product");
      return;
    }
    router.push({
      pathname: "/suvidhak-cart",
      params: { cart: JSON.stringify(cart), total: calculateTotal() },
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Seeds", "Fertilizers", "Pesticides", "Equipment"];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading Catalog...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Sale</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Feather
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search item name..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === cat && styles.filterTextActive,
                ]}
              >
                {cat === "all" ? "All Items" : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {filteredProducts.map((product) => {
          const quantity = getCartQuantity(product.id);
          return (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.imageContainer}>
                {product.imageUrl ? (
                  <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.productImage}
                  />
                ) : (
                  <Feather name="image" size={24} color="#ccc" />
                )}
              </View>

              <View style={styles.productInfo}>
                <Text style={styles.productCategory}>
                  {product.category.toUpperCase()}
                </Text>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  ₹{product.price}
                  <Text style={styles.unitText}>/{product.unit}</Text>
                </Text>
              </View>

              <View style={styles.actionContainer}>
                {product.variants && product.variants.length > 0 ? (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToCart(product)}
                  >
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                ) : quantity === 0 ? (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => addToCart(product)}
                  >
                    <Text style={styles.addButtonText}>ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.qBtn}
                      onPress={() => removeFromCart(product.id)}
                    >
                      <Feather name="minus" size={16} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.qText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.qBtn}
                      onPress={() => addToCart(product)}
                    >
                      <Feather name="plus" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal transparent visible={variantModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Size for {selectedProductForVariant?.name}
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {selectedProductForVariant?.variants?.map((v, idx) => {
                const isHighlighted =
                  tempVariant?.quantity === v.quantity &&
                  tempVariant?.unit === v.unit;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.variantItem,
                      isHighlighted && styles.variantItemActive,
                    ]}
                    onPress={() => setTempVariant(v)}
                  >
                    <View>
                      <Text
                        style={[
                          styles.variantLabel,
                          isHighlighted && styles.textWhite,
                        ]}
                      >
                        {v.quantity} {v.unit}
                      </Text>
                      <Text
                        style={[
                          styles.variantPrice,
                          isHighlighted && styles.textWhite,
                        ]}
                      >
                        ₹{v.price}
                      </Text>
                    </View>
                    {isHighlighted && (
                      <Feather name="check-circle" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setVariantModalVisible(false);
                  setTempVariant(null);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !tempVariant && styles.btnDisabled]}
                disabled={!tempVariant}
                onPress={() => {
                  const variantProduct = {
                    ...selectedProductForVariant,
                    id: `${selectedProductForVariant.id}-${tempVariant.quantity}${tempVariant.unit}`,
                    name: `${selectedProductForVariant.name} (${tempVariant.quantity}${tempVariant.unit})`,
                    price: tempVariant.price,
                    unit: `${tempVariant.quantity}${tempVariant.unit}`,
                    isVariantSelected: true,
                  };
                  addToCart(variantProduct);
                  setVariantModalVisible(false);
                  setTempVariant(null);
                }}
              >
                <Text style={styles.confirmBtnText}>Add to Sale</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {cart.length > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartLabel}>{cart.length} items selected</Text>
            <Text style={styles.cartTotal}>
              ₹{calculateTotal().toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleContinue}>
            <Text style={styles.checkoutText}>Proceed</Text>
            <Feather
              name="arrow-right"
              size={18}
              color="#1976D2"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#1976D2", fontWeight: "500" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1976D2",
    paddingTop: Platform.OS === "ios" ? 60 : 50,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  placeholder: { width: 40 },
  controlsContainer: {
    backgroundColor: "#fff",
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#333", height: "100%" },
  filterContainer: { paddingHorizontal: 15 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#F0F2F5",
  },
  filterChipActive: { backgroundColor: "#E3F2FD", borderColor: "#1976D2" },
  filterText: { fontSize: 13, color: "#666", fontWeight: "600" },
  filterTextActive: { color: "#1976D2", fontWeight: "700" },
  content: { padding: 15 },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  productImage: { width: "100%", height: "100%", borderRadius: 8 },
  productInfo: { flex: 1, marginRight: 10 },
  productCategory: {
    fontSize: 10,
    color: "#1976D2",
    fontWeight: "700",
    marginBottom: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: { fontSize: 16, fontWeight: "700", color: "#1976D2" },
  unitText: { fontSize: 12, color: "#999", fontWeight: "normal" },
  actionContainer: { width: 90, alignItems: "flex-end" },
  addButton: {
    borderWidth: 1,
    borderColor: "#1976D2",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  addButtonText: { color: "#1976D2", fontWeight: "700", fontSize: 12 },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 6,
    overflow: "hidden",
  },
  qBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
  },
  qText: {
    paddingHorizontal: 10,
    fontWeight: "700",
    color: "#333",
    fontSize: 14,
  },
  cartBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1565C0",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    elevation: 8,
  },
  cartLabel: { color: "#BBDEFB", fontSize: 12, marginBottom: 2 },
  cartTotal: { color: "#fff", fontSize: 20, fontWeight: "700" },
  checkoutBtn: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  checkoutText: { color: "#1976D2", fontWeight: "700", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    padding: 20,
    shadowColor: "#000",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  variantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  variantLabel: { fontSize: 16, fontWeight: "600", color: "#333" },
  variantPrice: { fontSize: 16, fontWeight: "700", color: "#1976D2" },
  variantItemActive: {
    backgroundColor: "#1976D2",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderColor: "#1976D2",
  },
  textWhite: { color: "#fff" },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  confirmBtn: {
    flex: 2,
    padding: 15,
    alignItems: "center",
    backgroundColor: "#1976D2",
    borderRadius: 10,
  },
  confirmBtnText: { color: "#fff", fontWeight: "bold" },
  cancelBtnText: { color: "#666", fontWeight: "bold" },
  btnDisabled: { backgroundColor: "#ccc" },
});
