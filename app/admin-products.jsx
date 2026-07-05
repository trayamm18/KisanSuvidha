import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { deleteProduct, getAllProducts } from "../utils/database";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  const loadProducts = async () => {
    setLoading(true);
    const result = await getAllProducts();
    if (result.success) {
      setProducts(result.data);
    } else {
      Alert.alert("Error", "Failed to load products");
    }
    setLoading(false);
  };

  const handleDelete = async (productId, productName) => {
    Alert.alert(
      "Delete Product?",
      `Are you sure you want to remove "${productName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteProduct(productId);
            if (result.success) {
              loadProducts();
            } else {
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ],
    );
  };

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const categories = ["all", "Seeds", "Fertilizers", "Pesticides", "Equipment"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Category Filter */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                filter === cat && styles.filterChipActive,
              ]}
              onPress={() => setFilter(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === cat && styles.filterTextActive,
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
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadProducts}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Add Product Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/admin-add-product")}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color="#FFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>

        {/* List Title */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 15,
            paddingHorizontal: 5,
          }}
        >
          <Text style={styles.sectionTitle}>
            {filter === "all" ? "All Products" : filter}
          </Text>
          <Text style={{ color: COLORS.subText }}>
            {filteredProducts.length} Items
          </Text>
        </View>

        {filteredProducts.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={40} color={COLORS.subText} />
            <Text style={styles.emptyText}>No products found.</Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.card}>
              <View style={styles.cardContent}>
                {/* Image Placeholder or Real Image */}
                <View style={styles.imageBox}>
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={COLORS.subText}
                    />
                  )}
                </View>

                <View style={styles.info}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.name} numberOfLines={1}>
                      {product.name}
                    </Text>
                    {!product.inStock && (
                      <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.category}>{product.category}</Text>
                  <Text style={styles.price}>
                    ₹{product.price}/{product.unit}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/admin-edit-product",
                      params: { productId: product.id },
                    })
                  }
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <View style={styles.dividerVertical} />

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(product.id, product.name)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={COLORS.error}
                  />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.white },

  filterWrapper: { backgroundColor: COLORS.white, paddingVertical: 12 },
  filterContainer: { paddingHorizontal: 15 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { fontSize: 13, color: COLORS.subText },
  filterTextActive: { color: COLORS.white, fontWeight: "600" },

  content: { flex: 1, padding: 20 },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 3,
  },
  addButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: { flexDirection: "row", padding: 15 },
  imageBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  info: { flex: 1, marginLeft: 15, justifyContent: "center" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "bold", color: COLORS.text, flex: 1 },
  outOfStockBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 5,
  },
  outOfStockText: { fontSize: 10, color: COLORS.error, fontWeight: "700" },
  category: { fontSize: 12, color: COLORS.subText, marginVertical: 2 },
  price: { fontSize: 15, fontWeight: "bold", color: COLORS.success },

  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  editBtnText: {
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  deleteBtnText: {
    color: COLORS.error,
    fontWeight: "600",
    marginLeft: 5,
    fontSize: 14,
  },
  dividerVertical: { width: 1, backgroundColor: "#F3F4F6" },

  emptyState: { alignItems: "center", marginTop: 40 },
  emptyText: { color: COLORS.subText, marginTop: 10 },
});
