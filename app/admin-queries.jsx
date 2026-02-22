import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, getFirestore, orderBy, query, updateDoc, where } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  primary: '#0D47A1',   
  secondary: '#F5F7FA', 
  white: '#FFFFFF',
  text: '#1F2937',
  subText: '#6B7280',
  success: '#10B981',
};

export default function AdminQueriesScreen() {
  const router = useRouter();
  const db = getFirestore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'support_requests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleResolve = async (id) => {
    try {
      await updateDoc(doc(db, 'support_requests', id), {
        status: 'resolved'
      });
      setRequests(prev => prev.filter(req => req.id !== id));
      Alert.alert("Success", "Request marked as resolved.");
    } catch (error) {
      Alert.alert("Error", "Could not update status");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.name}>{item.userName}</Text>
          <Text style={styles.time}>{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</Text>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.userPhone)}>
          <Ionicons name="call" size={16} color="#FFF" />
          <Text style={styles.callBtnText}>Call</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailBox}>
         <Text style={styles.typeLabel}>Request Type:</Text>
         <Text style={styles.typeValue}>{item.type || 'General Inquiry'}</Text>
      </View>

      <View style={styles.row}>
         <Ionicons name="phone-portrait-outline" size={16} color={COLORS.subText} />
         <Text style={styles.phone}>{item.userPhone}</Text>
      </View>
      
      <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
        <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
        <Text style={styles.resolveText}>Mark as Resolved</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Requests</Text>
        <View style={{width: 24}} /> 
      </View>

      <FlatList 
        data={requests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{padding: 20}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRequests} colors={[COLORS.primary]} />}
        ListEmptyComponent={
            !loading && (
                <View style={styles.emptyState}>
                    <Ionicons name="checkmark-done-circle-outline" size={60} color={COLORS.success} />
                    <Text style={styles.emptyText}>All Caught Up!</Text>
                    <Text style={styles.emptySubtext}>No pending callback requests.</Text>
                </View>
            )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingBottom: 20, paddingTop: 60, 
    backgroundColor: COLORS.primary, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  time: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
  
  callBtn: { backgroundColor: COLORS.success, flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center' },
  callBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12, marginLeft: 4 },

  detailBox: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 10 },
  typeLabel: { fontSize: 11, color: COLORS.subText, textTransform: 'uppercase' },
  typeValue: { fontSize: 14, color: COLORS.text, fontWeight: '500', marginTop: 2 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  phone: { fontSize: 14, color: COLORS.subText, marginLeft: 8 },

  resolveBtn: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resolveText: { color: COLORS.success, fontWeight: '600', marginLeft: 8 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 10 },
  emptySubtext: { fontSize: 14, color: COLORS.subText, marginTop: 5 }
});