import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { addProduct } from "../utils/database";
import theme from "../utils/theme";
const COLORS = theme.COLORS;

export default function AdminAddProductScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [inStock, setInStock] = useState(true);

  // ✅ NEW ADMIN KEYS
  const [isPriceVisible, setIsPriceVisible] = useState(true); // Toggle Price Visibility
  const [discount, setDiscount] = useState(""); // Discount Percentage

  const [variants, setVariants] = useState([]);
  const [vQty, setVQty] = useState("");
  const [vUnit, setVUnit] = useState("");
  const [vPrice, setVPrice] = useState("");

  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = ["Seeds", "Fertilizers", "Pesticides", "Equipment"];

  const addVariantToList = () => {
    if (!vQty || !vUnit || !vPrice) {
      Alert.alert(
        "Incomplete",
        "Please fill Quantity, Unit, and Price for this size.",
      );
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
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need permission to access your photos!",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddProduct = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter product name");
      return;
    }
    if (!category) {
      Alert.alert("Required", "Please select a category");
      return;
    }
    if (variants.length === 0) {
      Alert.alert("Required", "Please add at least one size/variant");
      return;
    }

    setUploading(true);
    try {
      let finalImageUrl = "";
      if (imageUri) {
        finalImageUrl = await uploadToCloudinary(imageUri);
      }

      const productData = {
        name: name.trim(),
        category,
        variants,
        description: description.trim(),
        inStock,
        imageUrl: finalImageUrl,
        // ✅ NEW KEYS ADDED TO DATA
        isPriceVisible,
        discountPercentage: discount ? parseFloat(discount) : 0,
        price: variants[0].price,
        unit: `${variants[0].quantity} ${variants[0].unit}`,
      };

      const result = await addProduct(productData);

      if (result.success) {
        Alert.alert("Success", "Product added successfully!", [
          {
            text: "Add Another",
            onPress: () => {
              setName("");
              setDescription("");
              setVariants([]);
              setCategory("");
              setImageUri(null);
              setIsPriceVisible(true);
              setDiscount("");
            },
          },
          { text: "Done", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", "Failed to add product.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {imageUri ? (
                <>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                  />
                  <View style={styles.editImageOverlay}>
                    <MaterialIcons name="edit" size={16} color="#FFF" />
                  </View>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="camera" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.placeholderText}>Upload Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {imageUri && (
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                style={styles.removeBtn}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Super Wheat Seeds"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              editable={!uploading}
            />

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
                  disabled={uploading}
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

            {/* ✅ MODIFIED VARIANT SECTION: Grouping for clarity */}
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

            {/* ✅ NEW: PRICE VISIBILITY KEY (PROFESSIONAL SECTION) */}
            <View style={styles.controlSection}>
              <View style={styles.controlRow}>
                <View>
                  <Text style={styles.controlLabel}>Price Visibility</Text>
                  <Text style={styles.controlSubText}>
                    Show price or 'Contact for Best Price'
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
                    price/buy button.
                  </Text>
                </View>
              )}
            </View>

            {/* ✅ NEW: DISCOUNT ENGINE KEY */}
            <Text style={styles.label}>Discount Percentage (%)</Text>
            <View style={styles.discountRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ex: 10%" // ✅ Added Placeholder
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={discount}
                onChangeText={setDiscount}
                editable={!uploading}
              />
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>% OFF</Text>
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe quality, usage, etc..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              editable={!uploading}
            />

            <Text style={styles.label}>Availability</Text>
            <View style={styles.stockContainer}>
              <TouchableOpacity
                style={[
                  styles.stockOption,
                  inStock && styles.stockOptionActive,
                ]}
                onPress={() => setInStock(true)}
                disabled={uploading}
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
                disabled={uploading}
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
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              uploading && styles.submitButtonDisabled,
            ]}
            onPress={handleAddProduct}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="save-outline"
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.submitButtonText}>Publish Product</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  backBtn: { padding: 5 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  content: { flex: 1, padding: 20 },
  imageSection: { alignItems: "center", marginVertical: 10 },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    position: "relative",
  },
  imagePreview: { width: "100%", height: "100%", borderRadius: 20 },
  editImageOverlay: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 5,
    borderRadius: 12,
  },
  placeholderContainer: { alignItems: "center", justifyContent: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  placeholderText: { color: COLORS.primary, fontSize: 12, fontWeight: "600" },
  removeText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },
  formSection: { marginTop: 10 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: { height: 100, textAlignVertical: "top" },
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
  // ✅ NEW KEY SECTION STYLES
  controlSection: {
    marginTop: 25,
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
    paddingVertical: 12,
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
