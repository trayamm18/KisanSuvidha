import { Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAllSuvidhaks, getSuvidhakPerformance } from '../utils/database';

export default function SuvidhakLeaderboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [])
  );

  const loadLeaderboard = async () => {
    setLoading(true);
    const userDataStr = await AsyncStorage.getItem('userData');
    const currentUser = JSON.parse(userDataStr);

    // 1. Get All Suvidhaks
    const result = await getAllSuvidhaks();
    if (result.success) {
        const suvidhaks = result.data;
        const rankedList = [];

        // 2. Get Performance for EACH (In production, do this in backend)
        for (let s of suvidhaks) {
            const perf = await getSuvidhakPerformance(s.id);
            rankedList.push({
                id: s.id,
                name: s.name,
                area: s.area,
                amount: perf.success ? perf.data.total.amount : 0,
                sales: perf.success ? perf.data.total.count : 0
            });
        }

        // 3. Sort by Amount (Highest First)
        rankedList.sort((a, b) => b.amount - a.amount);
        setLeaderboard(rankedList);

        // 4. Find Current User
        const myRank = rankedList.findIndex(x => x.id === currentUser.uid) + 1;
        setCurrentUserRank(myRank);
    }
    setLoading(false);
  };

  const getRankConfig = (index) => {
    if (index === 0) return { color: '#FFD700', bg: '#FFFDE7', icon: 'medal' }; // Gold
    if (index === 1) return { color: '#C0C0C0', bg: '#F5F5F5', icon: 'medal' }; // Silver
    if (index === 2) return { color: '#CD7F32', bg: '#FFF3E0', icon: 'medal' }; // Bronze
    return { color: '#90A4AE', bg: '#fff', icon: null }; // Default
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.banner}>
        <FontAwesome5 name="trophy" size={28} color="#FBC02D" style={{marginBottom: 8}}/>
        <Text style={styles.bannerText}>Top Performers</Text>
      </View>

      <View style={styles.myRankBar}>
        <Text style={styles.myRankText}>Your Current Rank</Text>
        <View style={styles.rankPill}>
            <Text style={styles.myRankValue}>{currentUserRank > 0 ? `#${currentUserRank}` : '-'}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadLeaderboard} tintColor="#1976D2" />}
      >
        {leaderboard.map((item, index) => {
            const config = getRankConfig(index);
            return (
                <View key={item.id} style={[
                    styles.card, 
                    {backgroundColor: config.bg, borderColor: config.color, borderWidth: index < 3 ? 1 : 0}
                ]}>
                    <View style={styles.rankCol}>
                        {config.icon ? (
                            <FontAwesome5 name={config.icon} size={22} color={config.color} />
                        ) : (
                            <Text style={styles.rankNum}>#{index + 1}</Text>
                        )}
                    </View>
                    
                    <View style={styles.infoCol}>
                        <Text style={styles.name}>{item.name}</Text>
                        <View style={styles.areaRow}>
                            <Feather name="map-pin" size={12} color="#666" style={{marginRight: 4}} />
                            <Text style={styles.area}>{item.area}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.statsCol}>
                        <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
                        <Text style={styles.sales}>{item.sales} Sales</Text>
                    </View>
                </View>
            );
        })}
        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50, backgroundColor: '#1976D2', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 5 },
  
  banner: { alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  bannerText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  myRankBar: { backgroundColor: '#E3F2FD', padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#BBDEFB' },
  myRankText: { fontSize: 15, color: '#1565C0', fontWeight: 'bold' },
  rankPill: { backgroundColor: '#1976D2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  myRankValue: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  
  content: { padding: 20 },
  
  card: { flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 12, alignItems: 'center', backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  
  rankCol: { width: 40, alignItems: 'center', justifyContent: 'center' },
  rankNum: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  
  infoCol: { flex: 1, paddingHorizontal: 15 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  areaRow: { flexDirection: 'row', alignItems: 'center' },
  area: { fontSize: 13, color: '#666' },
  
  statsCol: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#1976D2' },
  sales: { fontSize: 12, color: '#999', marginTop: 2 }
});