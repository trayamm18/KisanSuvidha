import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ✅ ASSET MAPPING - This links your englishName to the local file
const CROP_IMAGES = {
  potato: require("../assets/crops/potato.png"),
  eggplant: require("../assets/crops/eggplant.png"),
  cabbage: require("../assets/crops/cabbage.png"), //✅
  tomato: require("../assets/crops/tomato.png"), //✅
  onion: require("../assets/crops/onion.png"), //✅
  cauliflower: require("../assets/crops/cauliflower.png"), //✅
  "bitter-melon": require("../assets/crops/bitter-melon.jpg"),
  okra: require("../assets/crops/okra.png"), //✅
  ginger: require("../assets/crops/ginger.png"), //✅
  turmeric: require("../assets/crops/turmeric.png"), //✅
  pumpkin: require("../assets/crops/pumpkin.png"), //✅
  cucumber: require("../assets/crops/cucumber.png"), //✅
  carrot: require("../assets/crops/carrot.png"), //✅
  radish: require("../assets/crops/radish.png"), //✅
  spinach: require("../assets/crops/spinach.jpeg"), //☑️
  capsicum: require("../assets/crops/capsicum.jpeg"), //☑️
  peas: require("../assets/crops/peas.jpeg"), //☑️
  gourd: require("../assets/crops/gourd.jpeg"), //☑️
  zucchini: require("../assets/crops/zucchini.jpeg"), //☑️
  squash: require("../assets/crops/squash.jpeg"), //☑️
  fenugreek: require("../assets/crops/fenugreek.jpeg"), //☑️
  coriander: require("../assets/crops/coriander.jpeg"), //☑️
  "chili-pepper": require("../assets/crops/chili-pepper.jpeg"), //☑️
  yam: require("../assets/crops/yam.jpeg"), //☑️
  drumstick: require("../assets/crops/drumstick.jpeg"), //☑️
  wheat: require("../assets/crops/wheat.jpeg"), //☑️
  paddy: require("../assets/crops/paddy.jpeg"),
  corn: require("../assets/crops/corn.jpeg"),
  millet: require("../assets/crops/millet.jpeg"),
  sorghum: require("../assets/crops/sorghum.jpeg"),
  grain: require("../assets/crops/grain.jpeg"),
  barley: require("../assets/crops/barley.jpeg"),
  oats: require("../assets/crops/oats.jpeg"),
  chickpea: require("../assets/crops/chickpea.jpeg"),
  bean: require("../assets/crops/bean.jpeg"),
  vigna: require("../assets/crops/vigna.jpeg"),
  "pigeon-peas": require("../assets/crops/pigeon-peas.jpeg"),
  lentil: require("../assets/crops/lentil.jpeg"),
  "kidney-beans": require("../assets/crops/kidney-beans.jpeg"),
  "black-eyed-peas": require("../assets/crops/black-eyed-peas.jpeg"),
  "sugar-cane": require("../assets/crops/sugar-cane.jpeg"),
  "cotton-plant": require("../assets/crops/cotton-plant.jpeg"),
  "coffee-beans": require("../assets/crops/coffee-beans.jpeg"),
  "tea-leaves": require("../assets/crops/tea-leaves.jpeg"),
  "tobacco-leaf": require("../assets/crops/tobacco-leaf.jpeg"),
  hemp: require("../assets/crops/hemp.jpeg"),
  soy: require("../assets/crops/soy.jpeg"),
  mustard: require("../assets/crops/mustard.jpeg"),
  peanuts: require("../assets/crops/peanuts.jpeg"),
  sunflower: require("../assets/crops/sunflower.jpeg"),
  "sesame-seeds": require("../assets/crops/sesame-seeds.jpeg"),
  mango: require("../assets/crops/mango.jpeg"),
  banana: require("../assets/crops/banana.jpeg"),
  papaya: require("../assets/crops/papaya.jpeg"),
  pomegranate: require("../assets/crops/pomegranate.jpeg"),
  grapes: require("../assets/crops/grapes.jpeg"),
  orange: require("../assets/crops/orange.jpeg"),
  guava: require("../assets/crops/guava.jpeg"),
  apple: require("../assets/crops/apple.jpeg"),
  lychee: require("../assets/crops/lychee.jpeg"),
  sapodilla: require("../assets/crops/sapodilla.jpeg"),
  "custard-apple": require("../assets/crops/custard-apple.jpeg"),
  cumin: require("../assets/crops/cumin.jpeg"),
  fennel: require("../assets/crops/fennel.jpeg"),
  cardamom: require("../assets/crops/cardamom.jpeg"),
  "black-pepper": require("../assets/crops/black-pepper.jpeg"),
  seeds: require("../assets/crops/seeds.jpeg"),
  grass: require("../assets/crops/grass.jpeg"),
  rose: require("../assets/crops/rose.jpeg"), //☑️
  flower: require("../assets/crops/flower.jpeg"), //☑️
  leaf: require("../assets/crops/leaf.jpeg"),
};

const CROP_DATA = [
  // सब्जियां
  { id: 1, name: "आलू", englishName: "potato", category: "सब्जियां" },
  { id: 2, name: "बैंगन", englishName: "eggplant", category: "सब्जियां" },
  { id: 3, name: "पत्ता गोभी", englishName: "cabbage", category: "सब्जियां" },
  { id: 4, name: "टमाटर", englishName: "tomato", category: "सब्जियां" },
  { id: 5, name: "प्याज़", englishName: "onion", category: "सब्जियां" },
  { id: 6, name: "फूलगोभी", englishName: "cauliflower", category: "सब्जियां" },
  { id: 7, name: "करेला", englishName: "bitter-melon", category: "सब्जियां" },
  { id: 8, name: "भिंडी", englishName: "okra", category: "सब्जियां" },
  { id: 9, name: "अदरक", englishName: "ginger", category: "सब्जियां" },
  { id: 10, name: "हल्दी", englishName: "turmeric", category: "सब्जियां" },
  { id: 11, name: "कद्दू", englishName: "pumpkin", category: "सब्जियां" },
  { id: 12, name: "खीरा", englishName: "cucumber", category: "सब्जियां" },
  { id: 13, name: "गाजर", englishName: "carrot", category: "सब्जियां" },
  { id: 14, name: "मूली", englishName: "radish", category: "सब्जियां" },
  { id: 15, name: "पालक", englishName: "spinach", category: "सब्जियां" },
  {
    id: 16,
    name: "शिमला मिर्च",
    englishName: "capsicum",
    category: "सब्जियां",
  },
  { id: 17, name: "मटर", englishName: "peas", category: "सब्जियां" },
  { id: 18, name: "लौकी", englishName: "gourd", category: "सब्जियां" },
  { id: 19, name: "तुरई", englishName: "zucchini", category: "सब्जियां" },
  { id: 20, name: "टिंडा", englishName: "squash", category: "सब्जियां" },
  { id: 21, name: "मेथी", englishName: "fenugreek", category: "सब्जियां" },
  { id: 22, name: "धनिया", englishName: "coriander", category: "सब्जियां" },
  { id: 23, name: "मिर्च", englishName: "chili-pepper", category: "सब्जियां" },
  { id: 24, name: "अरबी", englishName: "yam", category: "सब्जियां" },
  { id: 25, name: "सहजन", englishName: "drumstick", category: "सब्जियां" },

  // अनाज
  { id: 101, name: "गेहूँ", englishName: "wheat", category: "अनाज" },
  { id: 102, name: "धान", englishName: "paddy", category: "अनाज" },
  { id: 103, name: "मक्का", englishName: "corn", category: "अनाज" },
  { id: 104, name: "बाजरा", englishName: "millet", category: "अनाज" },
  { id: 105, name: "ज्वार", englishName: "sorghum", category: "अनाज" },
  { id: 106, name: "रागी", englishName: "grain", category: "अनाज" },
  { id: 107, name: "जौ", englishName: "barley", category: "अनाज" },
  { id: 108, name: "जई", englishName: "oats", category: "अनाज" },

  // दालें
  { id: 201, name: "चना", englishName: "chickpea", category: "दालें" },
  { id: 202, name: "मूंग", englishName: "bean", category: "दालें" },
  { id: 203, name: "उड़द", englishName: "vigna", category: "दालें" },
  { id: 204, name: "अरहर", englishName: "pigeon-peas", category: "दालें" },
  { id: 205, name: "मसूर", englishName: "lentil", category: "दालें" },
  { id: 206, name: "राजमा", englishName: "kidney-beans", category: "दालें" },
  {
    id: 207,
    name: "लोबिया",
    englishName: "black-eyed-peas",
    category: "दालें",
  },

  // नकदी फसलें
  { id: 301, name: "गन्ना", englishName: "sugar-cane", category: "नकदी फसलें" },
  {
    id: 302,
    name: "कपास",
    englishName: "cotton-plant",
    category: "नकदी फसलें",
  },
  {
    id: 303,
    name: "कॉफी",
    englishName: "coffee-beans",
    category: "नकदी फसलें",
  },
  { id: 304, name: "चाय", englishName: "tea-leaves", category: "नकदी फसलें" },
  {
    id: 305,
    name: "तंबाकू",
    englishName: "tobacco-leaf",
    category: "नकदी फसलें",
  },
  { id: 306, name: "जूट", englishName: "hemp", category: "नकदी फसलें" },

  // तिलहन
  { id: 401, name: "सोयाबीन", englishName: "soy", category: "तिलहन" },
  { id: 402, name: "सरसों", englishName: "mustard", category: "तिलहन" },
  { id: 403, name: "मूंगफली", englishName: "peanuts", category: "तिलहन" },
  { id: 404, name: "सूरजमुखी", englishName: "sunflower", category: "तिलहन" },
  { id: 405, name: "तिल", englishName: "sesame-seeds", category: "तिलहन" },

  // फल
  { id: 501, name: "आम", englishName: "mango", category: "फल" },
  { id: 502, name: "केला", englishName: "banana", category: "फल" },
  { id: 503, name: "पपीता", englishName: "papaya", category: "फल" },
  { id: 504, name: "अनार", englishName: "pomegranate", category: "फल" },
  { id: 505, name: "अंगूर", englishName: "grapes", category: "फल" },
  { id: 506, name: "संतरा", englishName: "orange", category: "फल" },
  { id: 507, name: "अमरूद", englishName: "guava", category: "फल" },
  { id: 508, name: "सेब", englishName: "apple", category: "फल" },
  { id: 509, name: "लीची", englishName: "lychee", category: "फल" },
  { id: 510, name: "चीकू", englishName: "sapodilla", category: "फल" },
  { id: 511, name: "सीताफल", englishName: "custard-apple", category: "फल" },

  // मसाले
  { id: 601, name: "जीरा", englishName: "cumin", category: "मसाले" },
  { id: 602, name: "सौफ़", englishName: "fennel", category: "मसाले" },
  { id: 603, name: "इलायची", englishName: "cardamom", category: "मसाले" },
  {
    id: 604,
    name: "काली मिर्च",
    englishName: "black-pepper",
    category: "मसाले",
  },

  // अन्य
  { id: 701, name: "इसबगोल", englishName: "seeds", category: "अन्य" },
  { id: 702, name: "चारा", englishName: "grass", category: "अन्य" },
  { id: 703, name: "गुलाब", englishName: "rose", category: "अन्य" },
  { id: 704, name: "गेंदा", englishName: "flower", category: "अन्य" },
  { id: 705, name: "मेंहदी", englishName: "leaf", category: "अन्य" },
];

const CATEGORIES = [
  "सभी",
  "सब्जियां",
  "अनाज",
  "दालें",
  "नकदी फसलें",
  "तिलहन",
  "फल",
  "मसाले",
  "अन्य",
];

export default function SetupCropsScreen() {
  const router = useRouter();
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [activeCategory, setActiveCategory] = useState("सभी");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCrop = (crop) => {
    const isSelected = selectedCrops.find((c) => c.id === crop.id);
    setSelectedCrops(
      isSelected
        ? selectedCrops.filter((c) => c.id !== crop.id)
        : [...selectedCrops, crop],
    );
  };

  const handleComplete = async () => {
    if (selectedCrops.length === 0) return;
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const userData = JSON.parse(userDataString);
      const cropsList = selectedCrops.map((c) => c.name);

      await firestore().collection("users").doc(userData.uid).update({
        mainCrops: cropsList,
        setupComplete: true,
      });

      const updatedUser = {
        ...userData,
        mainCrops: cropsList,
        setupComplete: true,
      };
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      router.replace("/home-farmer");
    } catch (e) {
      Alert.alert("त्रुटि", "डाटा सुरक्षित नहीं हो सका");
    }
  };

  const filteredCrops = useMemo(() => {
    return CROP_DATA.filter(
      (c) =>
        (activeCategory === "सभी" || c.category === activeCategory) &&
        c.name.includes(searchQuery),
    );
  }, [activeCategory, searchQuery]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topHeader}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.stepText}>चरण 3 (Step 3)</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>चुनी गई फसलें ({selectedCrops.length})</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectedContainer}
        >
          {selectedCrops.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.selectedPill}
              onPress={() => toggleCrop(c)}
            >
              <Text style={styles.selectedPillText}>{c.name}</Text>
              <Ionicons name="close-circle" size={14} color="#2E7D32" />
            </TouchableOpacity>
          ))}
          {selectedCrops.length === 0 && (
            <Text style={styles.emptyText}>कोई फसल नहीं चुनी गई</Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            placeholder="फसल ढूँढें..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.catPill,
                activeCategory === cat && styles.catActive,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === cat && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredCrops.map((c) => {
            const isSelected = selectedCrops.find((sc) => sc.id === c.id);
            const localImage = CROP_IMAGES[c.englishName];

            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => toggleCrop(c)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                {/* --- ADD THIS WRAPPER --- */}
                <View style={styles.imageWrapper}>
                  <Image
                    source={localImage}
                    style={styles.cropIcon}
                    resizeMode="cover" // This makes it stretch to fill
                  />
                </View>

                <Text
                  style={[styles.cardText, isSelected && styles.cardTextActive]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            selectedCrops.length === 0 && styles.nextBtnDisabled,
          ]}
          onPress={handleComplete}
          disabled={selectedCrops.length === 0}
        >
          <Text style={styles.nextText}>आगे बढ़ें (Continue)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FDFDFD" },
  topHeader: {
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginRight: 15,
  },
  progressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2E7D32",
    borderRadius: 2,
  },
  stepText: { fontSize: 13, fontWeight: "700", color: "#4CAF50" },
  header: { paddingHorizontal: 20, marginBottom: 15 },
  title: { fontSize: 16, fontWeight: "800", color: "#333", marginBottom: 10 },
  selectedContainer: { height: 40 },
  selectedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  selectedPillText: {
    marginRight: 5,
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
  },
  emptyText: { color: "#BBB", fontSize: 14, fontStyle: "italic" },
  filterSection: { paddingHorizontal: 20, marginBottom: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    padding: 12,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#333" },
  catRow: { marginTop: 15 },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  catActive: { backgroundColor: "#2E7D32", borderColor: "#2E7D32" },
  catText: { color: "#757575", fontSize: 14 },
  catTextActive: { color: "#FFF", fontWeight: "bold" },
  gridContainer: { padding: 10, paddingBottom: 110 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  iconBg: {
    width: 70, // Narrower
    height: 80, // Taller
    backgroundColor: "#F9F9F9",
    borderRadius: 50, // High value creates the Oval curve
    marginBottom: 10,
    overflow: "hidden", // Clips the image to the oval shape
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  imageWrapper: {
    width: 70,
    height: 80,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#F9F9F9",
  },
  cropIcon: {
    width: 70, // Must match iconBg width
    height: 80, // Must match iconBg height
    borderRadius: 50, // Also apply to image for safety on Android
  },

  card: {
    width: (width - 44) / 3,
    height: 140, // Increased height to accommodate the taller oval
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardSelected: {
    borderColor: "#2E7D32",
    backgroundColor: "#F1F8E9",
    borderWidth: 2,
  },
  cardText: {
    fontSize: 13,
    textAlign: "center",
    color: "#424242",
    fontWeight: "600",
  },
  cardTextActive: { color: "#2E7D32", fontWeight: "800" },
  checkIcon: { position: "absolute", top: 4, right: 4 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  nextBtn: {
    backgroundColor: "#2E7D32",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
  },
  nextBtnDisabled: { backgroundColor: "#E0E0E0" },
  nextText: { color: "#FFF", fontSize: 17, fontWeight: "800" },
});
