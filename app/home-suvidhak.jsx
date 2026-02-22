import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllSuvidhaks, getSuvidhakPerformance } from "../utils/database";

// 🎨 Professional Color Palette
const COLORS = {
  primary: "#1E40AF", // Royal Blue
  secondary: "#F3F4F6", // Light Gray Background
  white: "#FFFFFF",
  text: "#111827",
  subText: "#6B7280",
  success: "#10B981", // Green
  accent: "#F59E0B", // Amber (Rank)
  taskBtn: "#00897B", // Teal (Contrast for My Tasks - Professional)
  cardBorder: "#E5E7EB",
};

export default function HomeSuvidhakScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [rank, setRank] = useState("-");
  const [loading, setLoading] = useState(true);

  // Reload data every time we come to this screen
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);

        const perfResult = await getSuvidhakPerformance(user.uid);
        if (perfResult.success) {
          setPerformance(perfResult.data);
        }

        const allSuvidhaksRes = await getAllSuvidhaks();
        if (allSuvidhaksRes.success) {
          const allSuvidhaks = allSuvidhaksRes.data;
          let scores = [];

          for (let s of allSuvidhaks) {
            const p = await getSuvidhakPerformance(s.id);
            scores.push({
              id: s.id,
              amount: p.success ? p.data.total.amount : 0,
            });
          }
          scores.sort((a, b) => b.amount - a.amount);
          const myRankIndex = scores.findIndex((s) => s.id === user.uid);
          setRank(myRankIndex !== -1 ? `#${myRankIndex + 1}` : "-");
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Syncing Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* 1. PROFESSIONAL HEADER (Name + Rank + Profile only) */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.name || "Suvidhak"}</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Rank moved here inside Blue BG */}
            <View style={styles.rankPill}>
              <Ionicons name="trophy" size={12} color="#FFF" />
              <Text style={styles.rankText}>Rank {rank}</Text>
            </View>

            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push("/suvidhak-profile")}
            >
              <Ionicons
                name="person-circle-outline"
                size={40}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* 2. TOTAL SALES CARD (Moved below header) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>TOTAL SALES</Text>
              {/* Showing Order Count instead of Amount */}
              <Text style={styles.summaryValue}>
                {performance?.total.count || "0"} Orders
              </Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons name="stats-chart" size={24} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {/* 3. ASSIGNED AREA BANNER */}
        <View style={styles.areaBanner}>
          <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
          <Text style={styles.areaText}>
            Assigned Area:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {userData?.area || "Not assigned"}
            </Text>
          </Text>
        </View>

        {/* 4. PERFORMANCE BREAKDOWN */}
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              router.push({
                pathname: "/suvidhak-history",
                params: { filter: "delivery" },
              })
            }
          >
            <View style={[styles.iconBox, { backgroundColor: "#E0F2FE" }]}>
              <Ionicons name="bicycle" size={20} color="#0284C7" />
            </View>
            <Text style={styles.statValue}>
              {performance?.deliveredOrders.count || 0}
            </Text>
            <Text style={styles.statLabel}>Deliveries</Text>
            <Text style={styles.statSub}>
              ₹{performance?.deliveredOrders.amount.toLocaleString() || "0"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() =>
              router.push({
                pathname: "/suvidhak-history",
                params: { filter: "sale" },
              })
            }
          >
            <View style={[styles.iconBox, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="briefcase" size={20} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>
              {performance?.selfSales.count || 0}
            </Text>
            <Text style={styles.statLabel}>Self Sales</Text>
            <Text style={styles.statSub}>
              ₹{performance?.selfSales.amount.toLocaleString() || "0"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {/* BUTTON 1: MY TASKS (New Teal Color, Moved to Top) */}
        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: COLORS.taskBtn }]}
          onPress={() => router.push("/suvidhak-deliveries")}
        >
          <View style={styles.primaryIconCircle}>
            <Ionicons name="checkbox-outline" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.primaryBtnTitle}>My Tasks</Text>
            <Text style={styles.primaryBtnSub}>View assigned deliveries</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.white}
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* BUTTON 2: RECORD NEW SALE (Standard Blue, Moved Below) */}
        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={() => router.push("/suvidhak-add-sale")}
        >
          <View style={styles.primaryIconCircle}>
            <Ionicons name="add" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={styles.primaryBtnTitle}>Record New Sale</Text>
            <Text style={styles.primaryBtnSub}>
              Log a direct farmer purchase
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.white}
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* BUTTON 3 & 4: Leaderboard & History (Row) */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/suvidhak-leaderboard")}
          >
            <Ionicons name="podium-outline" size={24} color={COLORS.accent} />
            <Text style={styles.actionBtnText}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/suvidhak-history")}
          >
            <Ionicons name="time-outline" size={24} color={COLORS.subText} />
            <Text style={styles.actionBtnText}>History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: COLORS.subText },

  // Header Styles
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  userName: { color: COLORS.white, fontSize: 22, fontWeight: "700" },

  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  rankPill: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
  },
  rankText: { color: COLORS.white, fontWeight: "bold", fontSize: 12 },
  profileBtn: { padding: 0 },

  content: { flex: 1, marginTop: 15, paddingHorizontal: 20 },

  // Summary Card (Total Sales)
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },

  areaBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  areaText: { marginLeft: 10, color: "#3730A3", fontSize: 14 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    marginLeft: 4,
  },

  statsGrid: { flexDirection: "row", gap: 15, marginBottom: 30 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: COLORS.text },
  statLabel: { fontSize: 13, color: COLORS.subText, marginBottom: 4 },
  statSub: { fontSize: 14, fontWeight: "600", color: COLORS.success },

  // Big Action Buttons
  primaryActionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  primaryBtnTitle: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  primaryBtnSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },

  // Secondary Action Grid
  actionGrid: { flexDirection: "row", gap: 15 },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    elevation: 1,
  },
  actionBtnText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
});
