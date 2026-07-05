import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal, // ✅ Added for Variants
  Platform, // ✅ Added for Platform specific lifting
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyState from "../components/EmptyState";
import OfflineIndicator from "../components/OfflineIndicator";
import { getAllProducts } from "../utils/database";
import { useTheme } from "../utils/theme";

function useStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors || {}), [colors]);
}

// Import crop images mapping (same as setup-crops.jsx)
const CROP_IMAGES = {
  potato: require("../assets/crops/potato.png"),
  eggplant: require("../assets/crops/eggplant.png"),
  cabbage: require("../assets/crops/cabbage.png"),
  tomato: require("../assets/crops/tomato.png"),
  onion: require("../assets/crops/onion.png"),
  cauliflower: require("../assets/crops/cauliflower.png"),
  "bitter-melon": require("../assets/crops/bitter-melon.jpg"),
  okra: require("../assets/crops/okra.png"),
  ginger: require("../assets/crops/ginger.png"),
  turmeric: require("../assets/crops/turmeric.png"),
  pumpkin: require("../assets/crops/pumpkin.png"),
  cucumber: require("../assets/crops/cucumber.png"),
  carrot: require("../assets/crops/carrot.png"),
  radish: require("../assets/crops/radish.png"),
  spinach: require("../assets/crops/spinach.jpeg"),
  capsicum: require("../assets/crops/capsicum.jpeg"),
  peas: require("../assets/crops/peas.jpeg"),
  gourd: require("../assets/crops/gourd.jpeg"),
  zucchini: require("../assets/crops/zucchini.jpeg"),
  squash: require("../assets/crops/squash.jpeg"),
  fenugreek: require("../assets/crops/fenugreek.jpeg"),
  coriander: require("../assets/crops/coriander.jpeg"),
  "chili-pepper": require("../assets/crops/chili-pepper.jpeg"),
  yam: require("../assets/crops/yam.jpeg"),
  drumstick: require("../assets/crops/drumstick.jpeg"),
  wheat: require("../assets/crops/wheat.jpeg"),
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
  rose: require("../assets/crops/rose.jpeg"),
  flower: require("../assets/crops/flower.jpeg"),
  leaf: require("../assets/crops/leaf.jpeg"),
};

// Crop data mapping (Hindi name to English name)
const CROP_DATA_MAP = {
  आलू: "potato",
  बैंगन: "eggplant",
  "पत्ता गोभी": "cabbage",
  टमाटर: "tomato",
  प्याज़: "onion",
  फूलगोभी: "cauliflower",
  करेला: "bitter-melon",
  भिंडी: "okra",
  अदरक: "ginger",
  हल्दी: "turmeric",
  कद्दू: "pumpkin",
  खीरा: "cucumber",
  गाजर: "carrot",
  मूली: "radish",
  पालक: "spinach",
  "शिमला मिर्च": "capsicum",
  मटर: "peas",
  लौकी: "gourd",
  तुरई: "zucchini",
  टिंडा: "squash",
  मेथी: "fenugreek",
  धनिया: "coriander",
  मिर्च: "chili-pepper",
  अरबी: "yam",
  सहजन: "drumstick",
  गेहूँ: "wheat",
  धान: "paddy",
  मक्का: "corn",
  बाजरा: "millet",
  ज्वार: "sorghum",
  रागी: "grain",
  जौ: "barley",
  जई: "oats",
  चना: "chickpea",
  मूंग: "bean",
  उड़द: "vigna",
  अरहर: "pigeon-peas",
  मसूर: "lentil",
  राजमा: "kidney-beans",
  लोबिया: "black-eyed-peas",
  गन्ना: "sugar-cane",
  कपास: "cotton-plant",
  कॉफी: "coffee-beans",
  चाय: "tea-leaves",
  तंबाकू: "tobacco-leaf",
  जूट: "hemp",
  सोयाबीन: "soy",
  सरसों: "mustard",
  मूंगफली: "peanuts",
  सूरजमुखी: "sunflower",
  तिल: "sesame-seeds",
  आम: "mango",
  केला: "banana",
  पपीता: "papaya",
  अनार: "pomegranate",
  अंगूर: "grapes",
  संतरा: "orange",
  अमरूद: "guava",
  सेब: "apple",
  लीची: "lychee",
  चीकू: "sapodilla",
  सीताफल: "custard-apple",
  जीरा: "cumin",
  सौफ़: "fennel",
  इलायची: "cardamom",
  "काली मिर्च": "black-pepper",
  इसबगोल: "seeds",
  चारा: "grass",
  गुलाब: "rose",
  गेंदा: "flower",
  मेंहदी: "leaf",
};

const { width } = Dimensions.get("window");

// ────────────────────────────────────────────────
// Main Screen Component
// ────────────────────────────────────────────────
export default function HomeFarmerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, paletteKey, setPalette } = useTheme();
  const styles = useStyles();
  const [activeTab, setActiveTab] = useState("explore");
  const [language, setLanguage] = useState("en");
  const [cart, setCart] = useState([]);

  // ✅ FIX: Back button handler to prevent going back to login
  useEffect(() => {
    // Apply earth palette while this screen is active, restore previous on unmount
    const prev = paletteKey;
    try {
      setPalette("earth");
    } catch (e) {}

    const backAction = () => {
      Alert.alert("Exit App?", "Do you want to exit Kisan Suvidha?", [
        { text: "Cancel", style: "cancel" },
        { text: "Exit", onPress: () => BackHandler.exitApp() },
      ]);
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => {
      try {
        setPalette(prev);
      } catch (e) {}
      backHandler.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const initHome = async () => {
        const orderFinished = await AsyncStorage.getItem("orderCompleted");
        if (orderFinished === "true") {
          setCart([]);
          await AsyncStorage.removeItem("farmerCart");
          await AsyncStorage.removeItem("orderCompleted");
        } else {
          loadCart();
        }
        checkLanguage();
      };
      initHome();
    }, []),
  );

  const checkLanguage = async () => {
    const storedLang = await AsyncStorage.getItem("userLanguage");
    if (storedLang) setLanguage(storedLang);
  };

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem("farmerCart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      // Failed to load cart
    }
  };

  // ✅ NO CHANGES to your actual cart logic
  const addToCart = async (product, action = "plus") => {
    // ✅ Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let newCart = [...cart];
    const index = newCart.findIndex((item) => item.id === product.id);

    if (index > -1) {
      if (action === "plus") {
        newCart[index].quantity += 1;
      } else if (action === "minus") {
        if (newCart[index].quantity > 1) {
          newCart[index].quantity -= 1;
        } else {
          newCart = newCart.filter((item) => item.id !== product.id);
        }
      }
    } else {
      newCart.push({ ...product, quantity: 1 });
    }

    setCart(newCart);
    await AsyncStorage.setItem("farmerCart", JSON.stringify(newCart));
  };

  const t = (en, hi) => (language === "hi" ? hi : en);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("Kisan Suvidha", "किसान सुविधा")}
        </Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/farmer-profile")}
        >
          <Ionicons
            name="person-circle-outline"
            size={36}
            color={colors?.primary || "#2E7D32"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === "explore" && <ExploreTab t={t} />}
        {activeTab === "shop" && (
          <ShopTab t={t} cart={cart} updateCartQuantity={addToCart} />
        )}
        {activeTab === "orders" && <OrdersTab t={t} />}
        {activeTab === "help" && <HelpChatTab t={t} language={language} />}
      </View>

      <View
        style={[
          styles.bottomNav,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 15 },
        ]}
      >
        <NavButton
          title={t("Explore", "खोजें")}
          icon="globe-outline"
          isActive={activeTab === "explore"}
          onPress={() => setActiveTab("explore")}
        />
        <NavButton
          title={t("Shop", "दुकान")}
          icon="cart-outline"
          isActive={activeTab === "shop"}
          onPress={() => setActiveTab("shop")}
        />
        <NavButton
          title={t("Orders", "ऑर्डर")}
          icon="cube-outline"
          isActive={activeTab === "orders"}
          onPress={() => setActiveTab("orders")}
        />
        <NavButton
          title={t("Sahayak", "सहायक")}
          icon="chatbubble-ellipses-outline"
          isActive={activeTab === "help"}
          onPress={() => setActiveTab("help")}
        />
      </View>
    </View>
  );
}

function NavButton({ title, icon, isActive, onPress }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={
          isActive ? colors?.primary || "#2E7D32" : colors?.subText || "#999"
        }
      />
      <Text
        style={[
          styles.navText,
          isActive && { color: colors?.primary || "#2E7D32" },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Weather Display Component with Animation
function WeatherDisplay({ temp, condition, t }) {
  const animatedValue = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedValue.value,
  }));

  useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 800 });
  }, []);
  const styles = useStyles();

  return (
    <View style={styles.weatherContent}>
      <Animated.Text style={[styles.weatherTemp, animatedStyle]}>
        {temp}°C
      </Animated.Text>
      <Text style={styles.weatherCondition}>{condition}</Text>
      <Text style={styles.weatherMessage}>
        {t(
          "Aaj mausam bahut accha hai! Kheti ke liye perfect.",
          "आज मौसम बहुत अच्छा है! खेती के लिए perfect।",
        )}
      </Text>
    </View>
  );
}

// Crop circle item - separate component so hooks are not called inside map
function CropCircleItem({ cropName, cropImage, onPress }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.cropCircle}
        onPressIn={() => {
          scale.value = withSpring(0.95);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
          onPress(cropName);
        }}
      >
        <View style={styles.cropCircleImage}>
          {cropImage ? (
            <Image
              source={cropImage}
              style={styles.cropCircleImageInner}
              resizeMode="cover"
            />
          ) : (
            <MaterialCommunityIcons
              name="sprout"
              size={32}
              color={colors?.primary || "#4A5D23"}
            />
          )}
        </View>
        <Text style={styles.cropCircleText} numberOfLines={1}>
          {cropName}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ────────────────────────────────────────────────
// Explore Tab - HUMANISTIC DESIGN OVERHAUL
// ────────────────────────────────────────────────
function ExploreTab({ t }) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles();
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [userCrops, setUserCrops] = useState([]);
  const [weather, setWeather] = useState({ temp: 0, condition: "Loading..." });
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Load user crops
  useEffect(() => {
    const loadUserCrops = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          setUserCrops(userData.mainCrops || []);
        }
      } catch (error) {
        // Error loading user crops
      }
    };
    loadUserCrops();
  }, []);

  // Load weather (simulated - replace with actual API)
  useEffect(() => {
    const loadWeather = async () => {
      setLoadingWeather(true);
      // Simulate weather loading
      setTimeout(() => {
        setWeather({
          temp: Math.floor(Math.random() * 15) + 25, // 25-40°C
          condition: ["Sunny", "Partly Cloudy", "Cloudy"][
            Math.floor(Math.random() * 3)
          ],
        });
        setLoadingWeather(false);
      }, 1000);
    };
    loadWeather();
  }, []);

  useEffect(() => {
    // ✅ FIX: Proper Firebase listener cleanup with error handling
    let unsubPromo = null;
    let unsubProd = null;

    try {
      unsubPromo = firestore()
        .collection("promotions")
        .orderBy("createdAt", "desc")
        .onSnapshot(
          (snap) => {
            if (snap && !snap.empty) {
              setPromotions(
                snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
              );
            } else {
              setPromotions([]);
            }
          },
          (error) => {
            setPromotions([]);
          },
        );

      unsubProd = firestore()
        .collection("products")
        .orderBy("createdAt", "desc")
        .limit(5)
        .onSnapshot(
          (snap) => {
            if (snap && !snap.empty) {
              setProducts(
                snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
              );
            } else {
              setProducts([]);
            }
          },
          (error) => {
            setProducts([]);
          },
        );
    } catch (error) {
      // Error setting up Firebase listeners
    }

    return () => {
      if (unsubPromo) unsubPromo();
      if (unsubProd) unsubProd();
    };
  }, []);

  // Crop circle animation handler
  const handleCropPress = (cropName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to crop details or show info
    // For now, just log
    console.log("Crop selected:", cropName);
  };

  return (
    <View style={styles.exploreContainer}>
      <OfflineIndicator />
      <ScrollView style={styles.tab} showsVerticalScrollIndicator={false}>
        {/* Greeting Banner - Clean Green Design with Wheat Field Background */}
        <ImageBackground
          source={require("../assets/wheat-field.jpg")}
          style={styles.greetingBanner}
          imageStyle={{ opacity: 0.8 }}
        >
          <View style={styles.greetingBannerOverlay}>
            <View style={styles.greetingContent}>
              <Text style={styles.greetingTitle}>Namaste Kisan Mitra! 🙏</Text>
              <Text style={styles.greetingSubtitle}>
                Apki Kheti Mein Barkat Ho.
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Weather Card - Enhanced */}
        <View style={styles.weatherBannerEnhanced}>
          <View style={styles.weatherLeftSection}>
            <View style={styles.weatherIconBox}>
              <Text style={styles.weatherIconEmoji}>☀️</Text>
            </View>
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherTemp}>
                {weather.temp}°C{" "}
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
              </Text>
              <Text style={styles.weatherOptimal}>
                Perfect for farming today!
              </Text>
            </View>
          </View>
          <View style={styles.weatherRightSection}>
            <Text style={styles.humidityLabel}>Humidity</Text>
            <Text style={styles.humidityValue}>45%</Text>
          </View>
        </View>

        {/* Crop Insights Section - Horizontal Scroll with Photography */}
        {userCrops.length > 0 && (
          <>
            <Text style={styles.sectionTitleHumanistic}>
              {t("Mere Khet ki Shaan", "मेरे खेत की शान")}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cropInsightsScroll}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {userCrops.map((cropName, index) => {
                const englishName =
                  CROP_DATA_MAP[cropName] ||
                  cropName.toLowerCase().replace(/\s+/g, "-");
                const cropImage = CROP_IMAGES[englishName];
                return (
                  <CropCircleItem
                    key={index}
                    cropName={cropName}
                    cropImage={cropImage}
                    onPress={handleCropPress}
                  />
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Recommended Products */}
        {products.length > 0 && (
          <>
            <Text style={styles.sectionTitleHumanistic}>
              {t("Aapke Liye Kuch Khaas", "आपके लिए कुछ खास")}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.recommendationsHumanistic}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {products.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recommendCardHumanistic}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push({
                      pathname: "/product-details",
                      params: { productData: JSON.stringify(item) },
                    });
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.recommendImageHumanistic}
                    />
                  ) : (
                    <View style={styles.recommendImagePlaceholder}>
                      <MaterialCommunityIcons
                        name="leaf"
                        size={40}
                        color={colors?.primary || "#4A5D23"}
                      />
                    </View>
                  )}
                  <Text
                    style={styles.recommendNameHumanistic}
                    numberOfLines={2}
                  >
                    {item.name || item.title}
                  </Text>
                  {item.price && (
                    <Text style={styles.recommendPriceHumanistic}>
                      ₹{item.price}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Highlights Section */}
        <Text style={styles.sectionTitleHumanistic}>
          {t("Khaas Baatein", "खास बातें")}
        </Text>
        {promotions.length > 0 ? (
          <View style={{ paddingBottom: 20, paddingHorizontal: 20 }}>
            {promotions.map((ad) => (
              <TouchableOpacity
                key={ad.id}
                style={styles.adCardHumanistic}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                {ad.imageUrl && (
                  <Image
                    source={{ uri: ad.imageUrl }}
                    style={styles.adImageHumanistic}
                  />
                )}
                <View style={styles.adContentHumanistic}>
                  <Text style={styles.adTitleHumanistic}>{ad.title}</Text>
                  <Text style={styles.adSubtitleHumanistic}>{ad.subtitle}</Text>
                </View>
                <View style={styles.adBadgeHumanistic}>
                  <Text style={styles.adBadgeTextHumanistic}>
                    {t("Khaas", "खास")}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="newspaper-outline"
            title={t("No updates today", "आज कोई अपडेट नहीं")}
            subtitle={t(
              "Check back later for new highlights",
              "नए highlights के लिए बाद में देखें",
            )}
          />
        )}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

// ────────────────────────────────────────────────
// 2. SHOP TAB (Variant Enabled)
// ────────────────────────────────────────────────
function ShopTab({ t, cart, updateCartQuantity }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    {
      id: 1,
      name: "All",
      label: t("All", "सभी"),
      icon: "grid-outline",
      lib: "Ionicons",
    },
    {
      id: 2,
      name: "Seeds",
      label: t("Seeds", "बीज"),
      icon: "seed-outline",
      lib: "MaterialCommunity",
    },
    {
      id: 3,
      name: "Fertilizers",
      label: t("Fertilizers", "उर्वरक"),
      icon: "flask-outline",
      lib: "Ionicons",
    },
    {
      id: 4,
      name: "Pesticides",
      label: t("Pesticides", "कीटनाशक"),
      icon: "bug-outline",
      lib: "Ionicons",
    },
    {
      id: 5,
      name: "Equipment",
      label: t("Equipment", "उपकरण"),
      icon: "tractor",
      lib: "MaterialCommunity",
    },
  ];

  const getCatIcon = (iconName, lib) => {
    if (lib === "MaterialCommunity")
      return <MaterialCommunityIcons name={iconName} size={22} color="#333" />;
    return <Ionicons name={iconName} size={22} color="#333" />;
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  const styles = useStyles();

  const loadProducts = async () => {
    setLoading(true);
    const result = await getAllProducts();
    if (result.success) setProducts(result.data);
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddPress = (product) => {
    // ✅ This tells the app: "Go to the product-details page and take this product's data with you"
    router.push({
      pathname: "/product-details",
      params: { productData: JSON.stringify(product) },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.tab} showsVerticalScrollIndicator={false}>
        {/* Search & Categories (KEEPING YOUR ORIGINAL CODE) */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={{ flex: 1, marginLeft: 10, color: "#333" }}
            placeholder={t("Search products...", "उत्पाद खोजें...")}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>{t("Categories", "श्रेणियाँ")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                activeCategory === cat.name && styles.activeCategoryCard,
              ]}
              onPress={() => setActiveCategory(cat.name)}
            >
              <View
                style={[
                  styles.iconCircle,
                  activeCategory === cat.name && styles.activeIconCircle,
                ]}
              >
                {getCatIcon(cat.icon, cat.lib)}
              </View>
              <Text
                style={[
                  styles.categoryName,
                  activeCategory === cat.name && styles.activeCategoryName,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>
          {activeCategory === "All"
            ? t("All Products", "सभी उत्पाद")
            : t(`${activeCategory}`, `${activeCategory}`)}
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2E7D32"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);

              // Calculate Prices
              const basePrice =
                product.variants && product.variants.length > 0
                  ? product.variants[0].price
                  : product.price;
              const hasDiscount = product.discountPercentage > 0;
              const discountedPrice = hasDiscount
                ? Math.round(
                    basePrice - basePrice * (product.discountPercentage / 100),
                  )
                : basePrice;

              return (
                <View key={product.id} style={styles.productCard}>
                  {/* ✅ 1. ADDED DISCOUNT BADGE ON IMAGE */}
                  {hasDiscount && (
                    <View style={styles.discountBadgeContainer}>
                      <Text style={styles.discountBadgeText}>
                        {product.discountPercentage}% OFF
                      </Text>
                    </View>
                  )}

                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImg}
                    />
                  ) : (
                    <View style={styles.productPlaceholder}>
                      <Ionicons name="image-outline" size={30} color="#ccc" />
                    </View>
                  )}

                  <View style={{ padding: 10 }}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>

                    {/* ✅ 2. FIXED PRICE LAYOUT WITH STRIKETHROUGH */}
                    {product.isPriceVisible !== false ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Text style={styles.productPrice}>
                          ₹{discountedPrice}
                        </Text>
                        {hasDiscount && (
                          <Text style={styles.mrpStrike}>₹{basePrice}</Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.callForPriceText}>
                        {t("Call for Price", "कीमत के लिए कॉल करें")}
                      </Text>
                    )}

                    {/* ✅ 3. YOUR ORIGINAL BUTTON LOGIC (KEEPING IT EXACTLY THE SAME) */}
                    {cartItem ? (
                      <View style={styles.qtySelector}>
                        <TouchableOpacity
                          onPress={() => updateCartQuantity(product, "minus")}
                          style={styles.qtyBtn}
                        >
                          <Ionicons name="remove" size={18} color="#2E7D32" />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{cartItem.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => updateCartQuantity(product, "plus")}
                          style={styles.qtyBtn}
                        >
                          <Ionicons name="add" size={18} color="#2E7D32" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.addToCartBtn,
                          product.isPriceVisible === false && {
                            backgroundColor: "#0D47A1",
                          },
                        ]}
                        onPress={() => handleAddPress(product)}
                      >
                        <Text style={styles.addToCartText}>
                          {product.isPriceVisible === false
                            ? t("CALL", "कॉल करें")
                            : t("ADD +", "जोड़ें +")}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ MODAL LOGIC (Kept and Polished) */}
      <Modal transparent visible={variantModalVisible} animationType="slide">
        <View style={styles.variantOverlay}>
          <View style={styles.variantSheet}>
            <View style={styles.variantHeader}>
              <Text style={styles.variantTitle}>{selectedProduct?.name}</Text>
              <TouchableOpacity onPress={() => setVariantModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#ccc" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {selectedProduct?.variants?.map((v, idx) => {
                // Calculate individual variant discount
                const vDisc = Math.round(
                  v.price -
                    v.price * (selectedProduct.discountPercentage / 100),
                );

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.variantOption}
                    onPress={() => {
                      const variantProd = {
                        ...selectedProduct,
                        id: `${selectedProduct.id}-${v.quantity}${v.unit}`,
                        name: `${selectedProduct.name} (${v.quantity}${v.unit})`,
                        price: vDisc,
                        unit: `${v.quantity}${v.unit}`,
                      };
                      updateCartQuantity(variantProd, "plus");
                      setVariantModalVisible(false);
                    }}
                  >
                    <View>
                      <Text style={styles.variantSizeText}>
                        {v.quantity}
                        {v.unit}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text style={styles.variantPriceText}>₹{vDisc}</Text>
                        {selectedProduct.discountPercentage > 0 && (
                          <Text style={styles.modalMrpStrike}>₹{v.price}</Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name="add-circle" size={30} color="#2E7D32" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Cart Button (Unchanged) */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCartBtn}
          onPress={() =>
            router.push({
              pathname: "/farmer-cart",
              params: { cartData: JSON.stringify(cart) },
            })
          }
        >
          <Ionicons
            name="cart"
            size={24}
            color="#fff"
            style={{ marginRight: 5 }}
          />
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {cart.length}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
// ────────────────────────────────────────────────
// Orders Tab (Unchanged)
// ────────────────────────────────────────────────
function OrdersTab({ t }) {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = useStyles();

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  const loadOrders = async () => {
    setLoading(true);
    try {
      const userDataStr = await AsyncStorage.getItem("userData");
      const user = JSON.parse(userDataStr);
      const snapshot = await firestore()
        .collection("orders")
        .where("customerId", "==", user.uid)
        .where("type", "==", "delivered")
        .orderBy("createdAt", "desc")
        .get();
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FFC107";
      case "assigned":
        return "#2196F3";
      case "out_for_delivery":
        return "#FF9800";
      case "delivered":
        return "#4CAF50";
      default:
        return "#999";
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#2E7D32"
        style={{ marginTop: 50 }}
      />
    );

  return (
    <ScrollView style={styles.tab} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{t("Your Orders", "आपके ऑर्डर")}</Text>
      {orders.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <MaterialCommunityIcons
            name="clipboard-text-off-outline"
            size={60}
            color="#ccc"
          />
          <Text style={{ color: "#666", marginTop: 10 }}>
            {t("No orders placed yet", "अभी तक कोई ऑर्डर नहीं")}
          </Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderProduct}>
                {t("Order #", "ऑर्डर #")}
                {order.orderNumber}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.orderStatus,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              {order.products.length} {t("Items", "वस्तु")} • ₹
              {order.totalAmount}
            </Text>
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() =>
                router.push({
                  pathname: "/farmer-order-details",
                  params: { orderId: order.id },
                })
              }
            >
              <Text style={styles.trackBtnText}>
                {t("Track Order", "ऑर्डर ट्रैक करें")}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        ))
      )}
      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// ────────────────────────────────────────────────
// Help Chat Tab (Unchanged)
// ────────────────────────────────────────────────
function HelpChatTab({ t, language }) {
  const router = useRouter();
  const flatListRef = useRef();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [inputMode, setInputMode] = useState(false);
  const [customNumber, setCustomNumber] = useState("");
  const [pendingTicket, setPendingTicket] = useState(null);

  const styles = useStyles();

  useEffect(() => {
    loadUser();
    resetChat();
  }, [language]);

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        text: t(
          "Namaste! 🙏 I am your Kisan Sahayak.",
          "नमस्ते! 🙏 मैं आपका किसान सहायक हूँ।",
        ),
        sender: "bot",
      },
      {
        id: "2",
        text: t(
          "How can I help you today?",
          "आज मैं आपकी कैसे मदद कर सकता हूँ?",
        ),
        sender: "bot",
      },
    ]);
    setOptions([
      {
        id: "opt1",
        label: t("Where is my Order?", "मेरा ऑर्डर कहाँ है?"),
        action: "track_order",
        icon: "cube-outline",
      },
      {
        id: "opt2",
        label: t("Request Call Back", "कॉल बैक का अनुरोध करें"),
        action: "request_call",
        icon: "call-outline",
      },
      {
        id: "opt3",
        label: t("Payment Issue", "भुगतान की समस्या"),
        action: "payment_issue",
        icon: "wallet-outline",
      },
    ]);
  };

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("userData");
    if (data) setUser(JSON.parse(data));
  };

  const addMessage = (text, sender) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, sender },
    ]);
  };

  const handleOptionClick = (option) => {
    addMessage(option.label, "user");
    setOptions([]);
    setTimeout(() => {
      if (option.action === "track_order") {
        addMessage(
          t(
            "You can track orders in the 'Orders' tab.",
            "आप 'ऑर्डर' टैब में ऑर्डर ट्रैक कर सकते हैं।",
          ),
          "bot",
        );
        setOptions([
          {
            id: "reset",
            label: t("Main Menu", "मुख्य मेनू"),
            action: "reset",
            icon: "menu-outline",
          },
        ]);
      } else if (
        option.action === "request_call" ||
        option.action === "payment_issue"
      ) {
        setPendingTicket({ type: option.label });
        addMessage(
          t(
            `Should we call your number: ${user?.phoneNumber}?`,
            `क्या हम आपके नंबर पर कॉल करें: ${user?.phoneNumber}?`,
          ),
          "bot",
        );
        setOptions([
          {
            id: "yes",
            label: t("Yes", "हाँ"),
            action: "confirm_yes",
            icon: "checkmark-circle-outline",
          },
          {
            id: "no",
            label: t("No, other number", "नहीं, दूसरा नंबर"),
            action: "confirm_no",
            icon: "close-circle-outline",
          },
        ]);
      } else if (option.action === "confirm_yes") {
        saveTicket(user?.phoneNumber);
      } else if (option.action === "confirm_no") {
        addMessage(t("Enter mobile number:", "मोबाइल नंबर दर्ज करें:"), "bot");
        setInputMode(true);
      } else if (option.action === "reset") {
        resetChat();
      }
    }, 500);
  };

  const handleSendNumber = () => {
    if (customNumber.length < 10) return;
    addMessage(customNumber, "user");
    setInputMode(false);
    saveTicket("+91" + customNumber);
  };

  const saveTicket = async (phone) => {
    try {
      addMessage(
        t("Sending request... ⏳", "अनुरोध भेजा जा रहा है... ⏳"),
        "bot",
      );
      await firestore()
        .collection("support_requests")
        .add({
          userId: user.uid,
          userName: user.name,
          userPhone: phone,
          type: pendingTicket?.type || "Help",
          status: "pending",
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      addMessage(
        t(
          "✅ Request Sent! We will call you.",
          "✅ अनुरोध भेजा गया! हम आपको कॉल करेंगे।",
        ),
        "bot",
      );
      setOptions([
        {
          id: "reset",
          label: t("Main Menu", "मुख्य मेनू"),
          action: "reset",
          icon: "menu-outline",
        },
      ]);
    } catch (e) {
      addMessage("Error sending request.", "bot");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E5DDD5" }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.sender === "user" ? styles.userText : styles.botText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />
      <View style={styles.chatFooter}>
        {inputMode ? (
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={styles.chatInput}
              placeholder="9876543210"
              keyboardType="numeric"
              value={customNumber}
              onChangeText={setCustomNumber}
            />
            <TouchableOpacity
              style={styles.chatSendBtn}
              onPress={handleSendNumber}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
            }}
          >
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.chatChip}
                onPress={() => handleOptionClick(opt)}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color="#075E54"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.chatChipText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────
// Styles (Ultra-Lifted & Modernized)
// ────────────────────────────────────────────────
export function makeStyles(colors = {}) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background || "#F9F9F7" }, // Warm paper tint
    exploreContainer: {
      flex: 1,
      backgroundColor: colors.background || "#F9F9F7",
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 55,
      paddingBottom: 15,
      backgroundColor: colors.surface || "#fff",
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder || "#f0f0f0",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.primary || "#2E7D32",
      letterSpacing: 0.5,
    },
    profileBtn: { padding: 5 },

    content: { flex: 1 },
    tab: { flex: 1 },

    // Humanistic Welcome Banner
    welcomeBannerHumanistic: {
      margin: 20,
      marginBottom: 20,
      borderRadius: 24,
      overflow: "hidden",
      height: 140,
    },
    welcomeBannerBg: {
      width: "100%",
      height: "100%",
      backgroundColor: colors.primaryDark || colors.primary || "#4A5D23",
    },
    welcomeBannerOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.12)",
      padding: 24,
      justifyContent: "center",
    },
    welcomeTitleHumanistic: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.white || "#FAF9F7",
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    welcomeSubHumanistic: {
      fontSize: 18,
      color: colors.subText || "#E8E6E0",
      fontWeight: "700",
      marginBottom: 4,
    },
    welcomeSubHumanisticSmall: {
      fontSize: 14,
      color: colors.subText || "#D4D2CC",
      fontWeight: "500",
      lineHeight: 20,
    },
    welcomeImage: { width: 80, height: 80, resizeMode: "contain" },

    // Hero Walk - Wheat Field Background
    heroWalkBackgroundImage: {
      width: "100%",
      height: 240,
      justifyContent: "center",
      alignItems: "center",
    },
    heroWalkOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.35)",
      width: "100%",
      paddingHorizontal: 30,
    },
    heroWalkMainText: {
      fontSize: 42,
      fontWeight: "900",
      color: colors.white || "#FAF9F7",
      textAlign: "center",
      marginBottom: 16,
      letterSpacing: 1.2,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    heroWalkSubText: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.white || "#FAF9F7",
      textAlign: "center",
      marginBottom: 12,
      letterSpacing: 0.8,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    heroWalkBottomText: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.white || "#FAF9F7",
      textAlign: "center",
      letterSpacing: 0.6,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },

    // Greeting Banner
    greetingBanner: {
      backgroundColor: "rgba(255, 200, 87, 0.15)",
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 24,
      padding: 24,
      minHeight: 35,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    greetingBannerOverlay: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flex: 1,
      backgroundColor: "rgba(255, 245, 230, 0.6)",
      padding: 0,
      borderRadius: 20,
    },
    greetingContent: {
      flex: 1,
      justifyContent: "center",
    },
    greetingTitle: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.text || "#1a1a1a",
      marginBottom: 12,
    },
    greetingSubtitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text || "#333333",
    },
    greetingTreesRight: {
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 16,
    },
    treeEmoji: {
      fontSize: 60,
      marginBottom: 8,
    },
    treeEmojiSmall: {
      fontSize: 40,
      opacity: 0.7,
    },

    // Weather Banner - Enhanced
    weatherBannerEnhanced: {
      backgroundColor: colors.surface || "#2C2C2C",
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 16,
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    weatherLeftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    weatherIconBox: {
      backgroundColor: colors.error || "#8B6F47",
      width: 70,
      height: 70,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    weatherIconEmoji: {
      fontSize: 40,
    },
    weatherInfo: {
      justifyContent: "center",
    },
    weatherTemp: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.white || "#FFFFFF",
    },
    weatherCondition: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.white || "#B0BEC5",
    },
    weatherOptimal: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.success || "#81C784",
      marginTop: 6,
    },
    weatherRightSection: {
      justifyContent: "center",
      alignItems: "flex-end",
      marginLeft: 16,
    },
    humidityLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.subText || "#999",
      marginBottom: 6,
    },
    humidityValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.white || "#FFFFFF",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text || "#222",
      marginLeft: 20,
      marginBottom: 15,
      marginTop: 10,
    },
    sectionTitleHumanistic: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.primary || "#1B5E20", // Forest Green
      marginLeft: 20,
      marginBottom: 16,
      marginTop: 24,
      letterSpacing: 0.3,
    },

    recommendations: { paddingLeft: 20, paddingRight: 20 },
    recommendCard: {
      width: 150,
      backgroundColor: colors.surface || "#fff",
      borderRadius: 16,
      padding: 15,
      marginRight: 15,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 3,
      marginBottom: 10,
    },
    recommendImage: {
      width: "100%",
      height: 90,
      backgroundColor: colors.surface || "#F1F8E9",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    recommendName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text || "#333",
      marginBottom: 5,
      lineHeight: 20,
    },
    recommendPrice: {
      fontSize: 15,
      fontWeight: "bold",
      color: colors.primary || "#2E7D32",
    },

    // Humanistic Crop Insights
    cropInsightsScroll: {
      marginBottom: 20,
    },
    cropCircle: {
      width: 90,
      alignItems: "center",
      marginRight: 16,
    },
    cropCircleImage: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.surface || "#FAF9F7",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.primaryDark || colors.primary || "#4A5D23",
      marginBottom: 8,
      shadowColor: colors.primaryDark || colors.primary || "#4A5D23",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
      overflow: "hidden", // Important for image clipping
    },
    cropCircleImageInner: {
      width: "100%",
      height: "100%",
      borderRadius: 33, // Slightly smaller to account for border
    },
    cropCircleText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary || "#1B5E20",
      textAlign: "center",
    },

    // Humanistic Weather Card
    weatherCardHumanistic: {
      marginHorizontal: 20,
      marginBottom: 24,
      backgroundColor: colors.surface || "#FAF9F7",
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder || "#E0E0E0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 0,
    },
    weatherHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    weatherTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primaryDark || colors.primary || "#4A5D23",
      marginLeft: 10,
    },
    weatherContent: {
      alignItems: "flex-start",
    },
    weatherTemp: {
      fontSize: 36,
      fontWeight: "800",
      color: colors.primary || "#1B5E20",
      marginBottom: 4,
    },
    weatherCondition: {
      fontSize: 16,
      color: colors.subText || "#666",
      fontWeight: "600",
      marginBottom: 8,
    },
    weatherMessage: {
      fontSize: 14,
      color: colors.subText || "#555",
      lineHeight: 20,
      fontStyle: "italic",
    },

    // Humanistic Recommendations
    recommendationsHumanistic: {
      marginBottom: 20,
    },
    recommendCardHumanistic: {
      width: 160,
      backgroundColor: colors.surface || "#FAF9F7",
      borderRadius: 18,
      padding: 12,
      marginRight: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder || "#E0E0E0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 0,
    },
    recommendImageHumanistic: {
      width: "100%",
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.surface || "#F1F8E9",
      marginBottom: 10,
    },
    recommendImagePlaceholder: {
      width: "100%",
      height: 100,
      borderRadius: 12,
      backgroundColor: "#F1F8E9",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    recommendNameHumanistic: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary || "#1B5E20",
      marginBottom: 6,
      lineHeight: 18,
    },
    recommendPriceHumanistic: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.primaryDark || colors.primary || "#4A5D23",
    },

    adCardVertical: {
      backgroundColor: colors.surface || "#fff",
      borderRadius: 16,
      marginHorizontal: 20,
      marginBottom: 20,
      overflow: "hidden",
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      borderWidth: 1,
      borderColor: colors.cardBorder || "#eee",
    },
    adImage: { width: "100%", height: 180, resizeMode: "cover" },
    adContent: { padding: 15 },
    adTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2E7D32",
      marginBottom: 6,
    },
    adSubtitle: { fontSize: 14, color: "#555", lineHeight: 20 },
    adBadge: {
      position: "absolute",
      top: 15,
      right: 15,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    adBadgeText: {
      color: colors.primary || "#2E7D32",
      fontSize: 11,
      fontWeight: "bold",
      textTransform: "uppercase",
    },

    // Humanistic Ad Cards
    adCardHumanistic: {
      backgroundColor: colors.surface || "#FAF9F7",
      borderRadius: 20,
      marginBottom: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.cardBorder || "#E0E0E0",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 0,
    },
    adImageHumanistic: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
    },
    adContentHumanistic: {
      padding: 18,
    },
    adTitleHumanistic: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.primary || "#1B5E20",
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    adSubtitleHumanistic: {
      fontSize: 15,
      color: "#555",
      lineHeight: 22,
    },
    adBadgeHumanistic: {
      position: "absolute",
      top: 18,
      right: 18,
      backgroundColor: colors.primaryDark
        ? "rgba(19,59,92,0.95)"
        : "rgba(74, 93, 35, 0.95)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    adBadgeTextHumanistic: {
      color: colors.white || "#FAF9F7",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    emptyStateContainer: { alignItems: "center", marginTop: 20, padding: 30 },
    emptyStateText: {
      marginTop: 10,
      color: colors.subText || "#888",
      fontSize: 14,
    },

    searchContainer: {
      flexDirection: "row",
      margin: 20,
      padding: 14,
      backgroundColor: colors.surface || "#fff",
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.cardBorder || "#eee",
    },
    categoriesScroll: { paddingLeft: 20, marginBottom: 20 },
    categoryCard: { alignItems: "center", marginRight: 20 },
    iconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surface || "#fff",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder || "#eee",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      elevation: 2,
    },
    activeIconCircle: {
      backgroundColor: colors.surface || "#E8F5E9",
      borderColor: colors.primary || "#2E7D32",
    },
    categoryName: {
      fontSize: 12,
      color: colors.subText || "#666",
      fontWeight: "500",
    },
    activeCategoryName: {
      color: colors.primary || "#2E7D32",
      fontWeight: "bold",
    },

    productsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 15,
    },
    productCard: {
      width: width / 2 - 24,
      backgroundColor: colors.surface || "#fff",
      borderRadius: 16,
      margin: 8,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
    },
    productImg: { width: "100%", height: 130, resizeMode: "cover" },
    productPlaceholder: {
      width: "100%",
      height: 130,
      backgroundColor: colors.lightGray || "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
    },
    productName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text || "#333",
      marginBottom: 4,
    },
    productPrice: {
      fontSize: 15,
      fontWeight: "bold",
      color: colors.primary || "#2E7D32",
      marginBottom: 10,
    },
    addToCartBtn: {
      backgroundColor: colors.surface || "#F1F8E9",
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    addToCartText: {
      color: colors.primary || "#2E7D32",
      fontSize: 12,
      fontWeight: "bold",
    },

    // ✅ ULTRA-LIFTED Floating Cart
    floatingCartBtn: {
      position: "absolute",
      bottom: Platform.OS === "android" ? 95 : 120,
      right: 20,
      backgroundColor: colors.accent || colors.secondary || "#FF9800",
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 30,
      flexDirection: "row",
      alignItems: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 5,
      zIndex: 999,
    },

    // ✅ VARIANT MODAL STYLES
    variantOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    variantSheet: {
      backgroundColor: colors.surface || "#fff",
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 25,
      paddingBottom: 40,
    },
    variantHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    variantTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text || "#333",
    },
    variantSub: {
      fontSize: 14,
      color: colors.subText || "#777",
      marginBottom: 20,
    },
    variantOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 18,
      backgroundColor: colors.background || "#F8F9FA",
      borderRadius: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder || "#eee",
    },
    variantSizeText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text || "#333",
    },
    variantPriceText: {
      fontSize: 15,
      color: colors.primary || "#2E7D32",
      fontWeight: "bold",
      marginTop: 4,
    },

    orderCard: {
      backgroundColor: colors.surface || "#fff",
      marginHorizontal: 20,
      marginBottom: 15,
      padding: 20,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.cardBorder || "#f5f5f5",
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    orderProduct: {
      fontWeight: "700",
      fontSize: 16,
      color: colors.text || "#333",
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    orderStatus: { fontSize: 11, fontWeight: "bold" },
    orderDate: {
      fontSize: 13,
      color: colors.subText || "#777",
      marginBottom: 15,
    },
    trackBtn: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background || "#F9FAFB",
      padding: 12,
      borderRadius: 10,
    },
    trackBtnText: {
      color: colors.primary || "#2E7D32",
      fontWeight: "600",
      fontSize: 14,
    },

    chatFooter: {
      padding: 15,
      backgroundColor: colors.surface || "#fff",
      borderTopWidth: 1,
      borderColor: colors.cardBorder || "#eee",
    },
    bubble: {
      maxWidth: "80%",
      padding: 14,
      borderRadius: 18,
      marginBottom: 12,
    },
    botBubble: {
      backgroundColor: colors.surface || "#fff",
      alignSelf: "flex-start",
      borderBottomLeftRadius: 4,
      elevation: 1,
    },
    userBubble: {
      backgroundColor: colors.success || "#DCF8C6",
      alignSelf: "flex-end",
      borderBottomRightRadius: 4,
      elevation: 1,
    },
    bubbleText: { fontSize: 15, lineHeight: 22 },
    botText: { color: colors.text || "#333" },
    userText: { color: colors.text || "#111" },

    chatChip: {
      backgroundColor: colors.surface || "#fff",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.cardBorder || "#E0E0E0",
      margin: 4,
      flexDirection: "row",
      alignItems: "center",
      elevation: 2,
    },
    chatChipText: {
      color: colors.primaryDark || colors.primary || "#075E54",
      fontWeight: "600",
      fontSize: 13,
    },
    chatInput: {
      flex: 1,
      backgroundColor: colors.lightGray || "#f0f0f0",
      padding: 12,
      borderRadius: 25,
      marginRight: 10,
      color: colors.text || "#333",
    },
    chatSendBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primaryDark || colors.primary || "#075E54",
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },

    bottomNav: {
      flexDirection: "row",
      backgroundColor: colors.surface || "#fff",
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder || "#f0f0f0",
      paddingTop: 10,
      paddingBottom: 25,
      paddingHorizontal: 10,
      elevation: 8,
    },
    navItem: { flex: 1, alignItems: "center" },
    navText: {
      fontSize: 11,
      color: colors.subText || "#aaa",
      marginTop: 4,
      fontWeight: "500",
    },
    navTextActive: { color: colors.primary || "#2E7D32", fontWeight: "700" },

    qtySelector: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface || "#F1F8E9",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.success || "#DCFCE7",
      width: "100%",
    },
    qtyBtn: {
      padding: 8,
      backgroundColor: colors.surface || "#fff",
      borderRadius: 6,
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    qtyValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary || "#2E7D32",
    },
    mrpStrike: {
      fontSize: 12,
      color: colors.subText || "#9CA3AF",
      textDecorationLine: "line-through", // Makes 2̶2̶5̶0̶
      marginLeft: 8, // Separates prices
    },
    discountBadgeContainer: {
      position: "absolute",
      top: 5,
      right: 5,
      backgroundColor: colors.error || "#EF4444",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
      zIndex: 10,
      elevation: 3,
    },
    discountBadgeText: {
      color: colors.white || "#FFFFFF",
      fontSize: 10,
      fontWeight: "bold",
    },
  });
}
