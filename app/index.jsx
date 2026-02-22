import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // 1. Keep the beautiful branding visible for 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const userDataString = await AsyncStorage.getItem("userData");

        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const role = userData.role;

          // 2. Using your Splash's working Switch logic
          switch (role) {
            case "admin":
              router.replace("/home-admin");
              break;
            case "suvidhak":
              router.replace("/home-suvidhak");
              break;
            case "farmer":
              if (userData.isProfileComplete) {
                router.replace("/home-farmer");
              } else {
                router.replace("/farmer-setup");
              }
              break;
            default:
              await AsyncStorage.removeItem("userData");
              router.replace("/login");
          }
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/login");
      }
    };
    checkAuthAndNavigate();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ImageBackground
        source={require("../assets/wellcome.png")}
        style={styles.fullScreenImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Content View is now empty to let your background image shine */}
          <View style={styles.content} />

          {/* Footer remains to maintain the original layout balance */}
          <View style={styles.footer} />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  fullScreenImage: { width: width, height: height, flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
  },
  content: {
    alignItems: "center",
    marginTop: 50,
  },
  footer: {
    height: 60,
  },
});
