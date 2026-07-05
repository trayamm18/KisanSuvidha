import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { firestore } from "../config/firebase";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminEditProductScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isPriceVisible, setIsPriceVisible] = useState(true);
  const [discount, setDiscount] = useState("");

  // ✅ NEW VARIANT STATES (Replacing old Price/Unit)
  const [variants, setVariants] = useState([]);
  const [vQty, setVQty] = useState("");
  const [vUnit, setVUnit] = useState("");
  const [vPrice, setVPrice] = useState("");

  const categories = ["Seeds", "Fertilizers", "Pesticides", "Equipment"];

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const loadProductData = async () => {
    try {
      const doc = await firestore().collection("products").doc(productId).get();
      if (doc.exists) {
        const data = doc.data();
        setName(data.name);
        setCategory(data.category);
        setDescription(data.description);
        setInStock(data.inStock);
        setIsPriceVisible(
          data.isPriceVisible !== undefined ? data.isPriceVisible : true,
        );
        setDiscount(
          data.discountPercentage ? data.discountPercentage.toString() : "",
        );

        // ✅ LOAD VARIANTS FROM FIREBASE
        setVariants(data.variants || []);
      } else {
        Alert.alert("Error", "Product not found");
        router.back();
      }
    } catch (error) {
      console.error("Error loading product:", error);
      Alert.alert("Error", "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ VARIANT LOGIC (Same as Add Screen)
  const addVariantToList = () => {
    if (!vQty || !vUnit || !vPrice) {
      Alert.alert("Incomplete", "Please fill Qty, Unit, and Price.");
      return;
    }
    const newVariant = {
      quantity: vQty.trim(),
      unit: vUnit.trim().toLowerCase(),
      price: parseFloat(vPrice),
    };
    setVariants([...variants, newVariant]);
    setVQty("");
    setVUnit("");
    setVPrice("");
  };

  const removeVariantFromList = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleUpdateProduct = async () => {
    // ✅ Added 'async' to fix SyntaxError
    if (!name.trim()) {
      Alert.alert("Required", "Product name required");
      return;
    }
    if (variants.length === 0) {
      Alert.alert("Required", "Please add at least one variant");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: name.trim(),
        category,
        description: description.trim(),
        inStock,
        isPriceVisible, // ✅ Saved from Phase 1
        discountPercentage: discount ? parseFloat(discount) : 0, // ✅ Saved from Phase 1
        variants,
        // Logic for display compatibility in the shop list
        price: variants.length > 0 ? variants[0].price : 0,
        unit:
          variants.length > 0
            ? `${variants[0].quantity} ${variants[0].unit}`
            : "",
      };

      // ✅ DIRECT FIRESTORE UPDATE - This fixes the TypeError: updateProduct is undefined
      await firestore()
        .collection("products")
        .doc(productId)
        .update(updateData);

      Alert.alert("Success", "Product updated!", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating:", error);
      Alert.alert("Error", "Something went wrong while updating the product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.subText }}>
          Loading Details...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.label}>Product Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="cube-outline"
                size={20}
                color={COLORS.subText}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Product Name"
              />
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    category === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ✅ UPDATED: SIZE & PRICING (VARIANTS) SECTION */}
            {/* ✅ UPDATED: SIZE & PRICING (VARIANTS) SECTION */}
            <Text style={styles.label}>Sizes & Pricing (Variants)</Text>
            <View style={styles.variantInputRow}>
              <TextInput
                style={styles.variantInputBox} // ✅ New clean style
                placeholder="Qty (Ex: 500)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={vQty}
                onChangeText={setVQty}
                underlineColorAndroid="transparent"
              />
              <TextInput
                style={styles.variantInputBox} // ✅ New clean style
                placeholder="Unit (Ex: ml)"
                placeholderTextColor="#9CA3AF"
                value={vUnit}
                onChangeText={setVUnit}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
              <TextInput
                style={styles.variantInputBox} // ✅ New clean style
                placeholder="Price (Ex: 250)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={vPrice}
                onChangeText={setVPrice}
                underlineColorAndroid="transparent"
              />
              <TouchableOpacity
                onPress={addVariantToList}
                style={styles.addVariantBtn}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.variantList}>
              {variants.map((v, index) => (
                <View key={index} style={styles.variantBadge}>
                  <Text style={styles.variantBadgeText}>
                    {v.quantity}
                    {v.unit} - ₹{v.price}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeVariantFromList(index)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.controlSection}>
              <View style={styles.controlRow}>
                <View>
                  <Text style={styles.controlLabel}>Price Visibility</Text>
                  <Text style={styles.controlSubText}>
                    Toggle price/buy button display
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#767577", true: COLORS.success }}
                  thumbColor={COLORS.white}
                  onValueChange={setIsPriceVisible}
                  value={isPriceVisible}
                />
              </View>
              {!isPriceVisible && (
                <View style={styles.warningBox}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color={COLORS.warning}
                  />
                  <Text style={styles.warningText}>
                    Farmer will see "Contact for Best Price" instead of
                    price/cart.
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.label}>Discount Percentage (%)</Text>
            <View style={styles.discountRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color={COLORS.subText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  placeholder="Ex: 10%"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>% OFF</Text>
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholder="Describe quality, usage, etc..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.label}>Availability Status</Text>
            <View style={styles.stockContainer}>
              <TouchableOpacity
                style={[
                  styles.stockOption,
                  inStock && styles.stockOptionActive,
                ]}
                onPress={() => setInStock(true)}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={inStock ? COLORS.success : COLORS.subText}
                />
                <Text
                  style={[
                    styles.stockText,
                    inStock && styles.stockTextSelected,
                  ]}
                >
                  In Stock
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.stockOption,
                  !inStock && styles.stockOptionInactive,
                ]}
                onPress={() => setInStock(false)}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={!inStock ? COLORS.error : COLORS.subText}
                />
                <Text
                  style={[
                    styles.stockText,
                    !inStock && styles.stockTextInactive,
                  ]}
                >
                  Out of Stock
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                saving && styles.submitButtonDisabled,
              ]}
              onPress={handleUpdateProduct}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="#FFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitButtonText}>Update Product</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  content: { flex: 1, padding: 20 },
  formSection: { marginTop: 10 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  textAreaContainer: {
    height: "auto",
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.text, height: "100%" },
  textArea: { height: 80, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: { fontSize: 13, color: COLORS.subText, fontWeight: "500" },
  categoryTextActive: { color: COLORS.white, fontWeight: "600" },

  // VARIANT STYLES

  variantInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 8, // ✅ Adds even spacing between boxes
  },

  variantInputBox: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.white, // ✅ Forcing solid white background
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25, // ✅ "Pill" shape to match Category chips
    paddingHorizontal: 8,
    marginRight: 12,
    fontSize: 12, // Smaller font to ensure placeholder fits
    color: COLORS.text,
    textAlign: "center",
    elevation: 2, // Slight shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  variantInputRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  addVariantBtn: {
    backgroundColor: COLORS.success,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 0,
  },
  variantList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  variantBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  variantBadgeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700",
    marginRight: 5,
  },
  controlSection: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  controlSubText: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#FFFBEB",
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  warningText: {
    fontSize: 11,
    color: COLORS.warning,
    flex: 1,
    fontWeight: "500",
  },
  discountRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  percentBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  percentText: { color: COLORS.error, fontWeight: "800", fontSize: 12 },
  stockContainer: { flexDirection: "row", gap: 12, marginTop: 5 },
  stockOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  stockOptionActive: {
    borderColor: COLORS.success,
    backgroundColor: "#ECFDF5",
  },
  stockOptionInactive: {
    borderColor: COLORS.error,
    backgroundColor: "#FEF2F2",
  },
  stockText: { fontSize: 14, fontWeight: "500", color: COLORS.subText },
  stockTextSelected: { color: COLORS.success, fontWeight: "700" },
  stockTextInactive: { color: COLORS.error, fontWeight: "700" },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    elevation: 5,
  },
  submitButtonDisabled: { backgroundColor: "#93C5FD" },
  submitButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
