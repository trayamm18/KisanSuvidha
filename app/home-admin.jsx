import { useFocusEffect, useRouter } from "expo-router";

import { useCallback, useState } from "react";

import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getAllOrders, getAllSuvidhaks } from '../utils/database';

// Icons

import { Ionicons, MaterialIcons } from '@expo/vector-icons';



export default function HomeAdminScreen() {

  const router = useRouter();

  const [stats, setStats] = useState({

    totalRevenue: 0,

    activeSuvidhaks: 0

  });

  const [recentActivity, setRecentActivity] = useState([]);

  const [loading, setLoading] = useState(false);



  useFocusEffect(

    useCallback(() => {

      loadStats();

    }, [])

  );



  const loadStats = async () => {

    setLoading(true);

    const ordersRes = await getAllOrders();

    const suvidhaksRes = await getAllSuvidhaks();

   

    let revenue = 0;

    let recent = [];



    if (ordersRes.success) {

        const orders = ordersRes.data;

        // Calculate Revenue

        revenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

       

        // Get Recent Activity (Top 3 orders)

        recent = orders.slice(0, 3).map(order => ({

            id: order.id,

            type: order.type === 'delivered' ? 'Delivery Order' : 'Self Sale',

            amount: order.totalAmount,

            user: order.type === 'delivered' ? (order.suvidhakName || 'Unassigned') : 'Suvidhak Sale',

            status: order.status,

            orderNumber: order.orderNumber

        }));

    }



    setStats({

        totalRevenue: revenue,

        activeSuvidhaks: suvidhaksRes.success ? suvidhaksRes.data.length : 0

    });

    setRecentActivity(recent);

    setLoading(false);

  };



  const formatCurrency = (amount) => {

    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;

    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;

    return `₹${amount}`;

  };



  return (

    <View style={styles.container}>

      {/* Header */}

      <View style={styles.header}>

        <View>

            <Text style={styles.headerTitle}>Admin Panel</Text>

            <Text style={styles.headerSubtitle}>Overview & Performance</Text>

        </View>

       

        {/* ✅ UPDATED: Profile Button instead of Logout */}

        <TouchableOpacity

          style={styles.profileBtn}

          onPress={() => router.push('/admin-profile')}

        >

            <Ionicons name="person-circle-outline" size={32} color="#fff" />

        </TouchableOpacity>

      </View>



      <ScrollView

        style={styles.content}

        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}

      >

        {/* STATS CARDS */}

        <View style={styles.statsGrid}>

            <View style={styles.statCard}>

                <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>

                <Text style={styles.statLabel}>Total Revenue</Text>

            </View>

            <View style={styles.statCard}>

                <Text style={styles.statValue}>{stats.activeSuvidhaks}</Text>

                <Text style={styles.statLabel}>Suvidhaks</Text>

            </View>

        </View>



        {/* RECENT ACTIVITY SECTION */}

        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activityContainer}>

            {recentActivity.length === 0 ? (

                <Text style={{color: '#999', padding: 20, textAlign: 'center'}}>No recent activity</Text>

            ) : (

                recentActivity.map((item, index) => (

                    <View key={index} style={styles.activityCard}>

                        {/* ICONS */}

                        <View style={styles.activityIconContainer}>

                             {item.type === 'Delivery Order'

                                ? <Ionicons name="cube-outline" size={24} color="#2E7D32" />

                                : <Ionicons name="flash-outline" size={24} color="#FBC02D" />

                             }

                        </View>

                        <View style={{flex: 1, marginLeft: 10}}>

                            <Text style={styles.activityTitle}>

                                {item.type === 'Delivery Order' ? `Order #${item.orderNumber}` : 'New Self Sale'}

                            </Text>

                            <Text style={styles.activitySub}>

                                {item.user} • {item.status.replace(/_/g, ' ')}

                            </Text>

                        </View>

                        <Text style={styles.activityAmount}>₹{item.amount}</Text>

                    </View>

                ))

            )}

        </View>



        {/* MANAGEMENT GRID */}

        <Text style={styles.sectionTitle}>Management</Text>

        <View style={styles.grid}>

          <TouchableOpacity

            style={styles.gridBtn}

            onPress={() => router.push('/admin-suvidhaks')}

          >

            <Ionicons name="people-outline" size={32} color="#2E7D32" style={{marginBottom: 10}} />

            <Text style={styles.gridText}>Manage Team</Text>

          </TouchableOpacity>

         

          <TouchableOpacity

            style={styles.gridBtn}

            onPress={() => router.push('/admin-orders')}

          >

            <Ionicons name="cube-outline" size={32} color="#2E7D32" style={{marginBottom: 10}} />

            <Text style={styles.gridText}>All Orders</Text>

          </TouchableOpacity>



          <TouchableOpacity

            style={styles.gridBtn}

            onPress={() => router.push('/admin-products')}

          >

            <MaterialIcons name="grass" size={32} color="#2E7D32" style={{marginBottom: 10}} />

            <Text style={styles.gridText}>Products</Text>

          </TouchableOpacity>



          <TouchableOpacity

            style={styles.gridBtn}

            onPress={() => router.push('/admin-analytics')}

          >

            <Ionicons name="bar-chart-outline" size={32} color="#2E7D32" style={{marginBottom: 10}} />

            <Text style={styles.gridText}>Analytics</Text>

          </TouchableOpacity>



          <TouchableOpacity

            style={styles.gridBtn}

            onPress={() => router.push('/admin-queries')}

          >

            <Ionicons name="call-outline" size={32} color="#2E7D32" style={{marginBottom: 10}} />

            <Text style={styles.gridText}>Callback Requests</Text>

          </TouchableOpacity>



          <TouchableOpacity

            style={styles.gridBtn}

            onPress={() => router.push('/admin-banners')}

          >

            <Ionicons name="image-outline" size={32} color="#2E7D32" style={{marginBottom: 10}} />

            <Text style={styles.gridText}>Manage Ads</Text>

          </TouchableOpacity>



          <TouchableOpacity

            style={styles.gridBtn}

            onPress={() => router.push('/admin-farmers')}

          >

            <Ionicons name="document-text-outline" size={32} color="#2E7D32" style={{marginBottom: 10}} />

            <Text style={styles.gridText}>Farmer Reports</Text>

          </TouchableOpacity>

        </View>

       

        <View style={{height: 50}} />

      </ScrollView>

    </View>

  );

}



const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#2E7D32', alignItems: 'center' },

  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  headerSubtitle: { color: '#A5D6A7', fontSize: 14 },

 

  // New Profile Button Style

  profileBtn: {

    width: 44, height: 44,

    justifyContent: 'center', alignItems: 'center',

    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 22

  },



  content: { padding: 20 },

 

  // Stats

  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },

  statCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },

  statValue: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5 },

  statLabel: { color: '#666', fontSize: 12 },

 

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },

 

  // Recent Activity

  activityContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 10, marginBottom: 25, elevation: 1 },

  activityCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },

  activityIconContainer: { marginRight: 15 },

  activityTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },

  activitySub: { color: '#999', fontSize: 12, marginTop: 2 },

  activityAmount: { fontWeight: 'bold', color: '#2E7D32', fontSize: 16 },



  // Management Grid

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },

  gridBtn: { width: '47%', backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2, marginBottom: 5 },

  gridText: { fontWeight: '600', color: '#333', textAlign: 'center' }

});