import { Stack } from "expo-router";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../utils/theme";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          {/* --- ENTRY FLOW --- */}
          {/* Index loads first (Full PNG), then jumps to Splash */}
          <Stack.Screen name="index" />
          {/* Splash handles Role Assignment logic & "Namaste" Animation */}
          <Stack.Screen name="splash" />

          {/* --- AUTH & ONBOARDING --- */}
          <Stack.Screen name="login" />
          <Stack.Screen name="otp" />

          {/* --- SETUP SCREENS --- */}
          <Stack.Screen name="setup-location" />
          <Stack.Screen name="setup-crops" />
          <Stack.Screen
            name="farmer-setup"
            options={{
              title: "Complete Profile",
              headerLeft: () => null,
              gestureEnabled: false,
            }}
          />

          {/* --- ROLE-BASED HOME SCREENS --- */}
          <Stack.Screen name="home-farmer" />
          <Stack.Screen name="home-admin" />
          <Stack.Screen name="home-suvidhak" />

          {/* --- ADMIN MANAGEMENT --- */}
          <Stack.Screen name="admin-suvidhaks" />
          <Stack.Screen name="admin-add-suvidhak" />
          <Stack.Screen name="admin-farmers" />
          <Stack.Screen name="admin-analytics" />
          <Stack.Screen
            name="admin-queries"
            options={{ title: "Callback Requests", headerShown: true }}
          />

          {/* --- PRODUCT MANAGEMENT --- */}
          <Stack.Screen name="admin-products" />
          <Stack.Screen name="admin-add-product" />
          <Stack.Screen name="admin-edit-product" />

          {/* --- SUVIDHAK SALES & DELIVERY --- */}
          <Stack.Screen name="suvidhak-add-sale" />
          <Stack.Screen name="suvidhak-customer-details" />
          <Stack.Screen name="suvidhak-payment" />
          <Stack.Screen name="suvidhak-sale-success" />
          <Stack.Screen name="suvidhak-deliveries" />
          <Stack.Screen name="suvidhak-delivery-details" />
          <Stack.Screen name="suvidhak-leaderboard" />

          {/* --- FARMER ORDER FLOW --- */}
          <Stack.Screen name="farmer-cart" />
          <Stack.Screen name="farmer-checkout" />
          <Stack.Screen name="farmer-order-success" />
          <Stack.Screen name="farmer-order-details" />
          <Stack.Screen
            name="farmer-help"
            options={{ title: "Help Center", headerShown: true }}
          />

          {/* --- ADMIN ORDER MANAGEMENT --- */}
          <Stack.Screen name="admin-orders" />
          <Stack.Screen name="admin-order-details" />
        </Stack>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
