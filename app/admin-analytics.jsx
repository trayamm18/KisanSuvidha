import { Ionicons } from '@expo/vector-icons'; // ✅ Icons
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getAllOrders, getAllSuvidhaks } from '../utils/database';

// 🎨 Professional Color Palette
const COLORS = {
  primary: '#0D47A1',   // Deep Admin Blue
  secondary: '#F5F7FA', // Background
  white: '#FFFFFF',
  text: '#1F2937',
  subText: '#6B7280',
  success: '#10B981',
  cardBg: '#FFFFFF',
  chartGradientFrom: '#E3F2FD',
  chartGradientTo: '#FFFFFF',
};

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeSuvidhaks: 0,
    recentRevenue: [0, 0, 0, 0, 0, 0] 
  });

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [])
  );

  const loadAnalytics = async () => {
    setLoading(true);
    const ordersRes = await getAllOrders();
    const suvidhaksRes = await getAllSuvidhaks();
    
    if (ordersRes.success && suvidhaksRes.success) {
        const orders = ordersRes.data;
        const suvidhaks = suvidhaksRes.data;

        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
        
        // Mock Chart Data Logic (Last 6 orders)
        const last6Orders = orders.slice(0, 6).map(o => parseFloat(o.totalAmount) || 0);

        setStats({
            totalRevenue,
            totalOrders: orders.length,
            activeSuvidhaks: suvidhaks.length,
            recentRevenue: last6Orders.length > 0 ? last6Orders : [0,0,0,0,0,0]
        });
    }
    setLoading(false);
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.chartGradientFrom,
    backgroundGradientTo: COLORS.chartGradientTo,
    decimalPlaces: 0, 
    color: (opacity = 1) => `rgba(13, 71, 161, ${opacity})`, // Primary Blue
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Grey Text
    style: { borderRadius: 16 },
    propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primary }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Analytics</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAnalytics} colors={[COLORS.primary]} />}
      >
        
        {/* 📊 KEY METRICS GRID */}
        <View style={styles.gridContainer}>
            {/* Revenue Card */}
            <View style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.cardLabel}>Total Revenue</Text>
                <Text style={styles.cardValue}>₹{stats.totalRevenue.toLocaleString()}</Text>
            </View>

            {/* Orders Card */}
            <View style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="cart-outline" size={24} color={COLORS.success} />
                </View>
                <Text style={styles.cardLabel}>Total Orders</Text>
                <Text style={styles.cardValue}>{stats.totalOrders}</Text>
            </View>
        </View>

        <View style={styles.gridContainer}>
            {/* Team Card */}
            <View style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="people-outline" size={24} color="#D97706" />
                </View>
                <Text style={styles.cardLabel}>Active Team</Text>
                <Text style={styles.cardValue}>{stats.activeSuvidhaks}</Text>
            </View>

            {/* AOV Card */}
            <View style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                    <Ionicons name="stats-chart-outline" size={24} color="#7C3AED" />
                </View>
                <Text style={styles.cardLabel}>Avg Order Value</Text>
                <Text style={styles.cardValue}>
                    ₹{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : 0}
                </Text>
            </View>
        </View>

        {/* 📈 REVENUE CHART SECTION */}
        <View style={styles.chartContainer}>
            <View style={styles.sectionHeaderRow}>
                <Ionicons name="trending-up" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Recent Trends</Text>
            </View>
            
            <LineChart
                data={{
                    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // Mock labels
                    datasets: [{ data: stats.recentRevenue }]
                }}
                width={SCREEN_WIDTH - 40}
                height={220}
                yAxisLabel="₹"
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />
        </View>

        {/* 📥 EXPORT ACTION */}
        <TouchableOpacity style={styles.exportBtn} onPress={() => alert("Report downloaded! (Simulated)")}>
            <Ionicons name="cloud-download-outline" size={22} color="#FFF" style={{marginRight: 10}} />
            <Text style={styles.exportText}>Download Full Report (PDF)</Text>
        </TouchableOpacity>
        
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    paddingTop: 60, 
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },

  content: { flex: 1, padding: 20 },

  // Grid
  gridContainer: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  card: { 
    flex: 1, 
    backgroundColor: COLORS.cardBg, 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'flex-start',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2 
  },
  iconCircle: {
      width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  cardLabel: { fontSize: 13, color: COLORS.subText, fontWeight: '500', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },

  // Chart Section
  chartContainer: { 
      marginTop: 10, 
      backgroundColor: COLORS.cardBg, 
      borderRadius: 16, 
      padding: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2 
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingHorizontal: 10, paddingTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  chart: { marginVertical: 8, borderRadius: 16 },

  // Export Button
  exportBtn: { 
      backgroundColor: COLORS.success, 
      paddingVertical: 16, 
      borderRadius: 14, 
      flexDirection: 'row',
      justifyContent: 'center', 
      alignItems: 'center', 
      marginTop: 30,
      shadowColor: COLORS.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5
  },
  exportText: { color: COLORS.white, fontWeight: '700', fontSize: 16 }
});