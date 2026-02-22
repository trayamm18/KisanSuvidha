import { Feather } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BeautifulAlert from '../components/BeautifulAlert'; // ✅ Added

export default function SuvidhakDeliveryDetailsScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ New States for Custom Alerts
  const [alertVisible, setAlertVisible] = useState(false);
  const [paymentAlertVisible, setPaymentAlertVisible] = useState(false);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const doc = await firestore().collection('orders').doc(orderId).get();
    if (doc.exists) {
      setOrder({ id: doc.id, ...doc.data() });
    }
    setLoading(false);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === 'delivered') {
        // ✅ Show Custom Collection Alert
        setAlertVisible(true);
    } else {
        await updateStatusDB(newStatus, false, order.paymentMethod || 'cash');
    }
  };

  const updateStatusDB = async (status, isDelivered, paymentMethod) => {
    setLoading(true);
    try {
        await firestore().collection('orders').doc(orderId).update({
            status: status,
            paymentMethod: paymentMethod,
            deliveredAt: isDelivered ? new Date() : null
        });
        
        // Final success alert (optional: can also be a BeautifulAlert)
        router.back();
    } catch (error) {
        console.error(error);
    }
    setLoading(false);
  };

  if (!order) return <View style={styles.center}><ActivityIndicator color="#1976D2" size="large"/></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statusBar}>
          <Feather name="info" size={16} color="#1565C0" style={{marginRight: 8}}/>
          <Text style={styles.statusText}>Status: {order.status.replace(/_/g, ' ').toUpperCase()}</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionHeader}>CUSTOMER INFORMATION</Text>
            <View style={styles.row}>
                <Feather name="user" size={18} color="#666" style={{marginTop: 2}} />
                <View style={{marginLeft: 12}}>
                    <Text style={styles.name}>{order.customerName}</Text>
                    <Text style={styles.phone}>+91 {order.customerPhone}</Text>
                </View>
            </View>
            <View style={[styles.row, {marginTop: 15}]}>
                <Feather name="map-pin" size={18} color="#666" style={{marginTop: 2}} />
                <Text style={styles.address}>{order.customerAddress}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                <Feather name="phone" size={16} color="#1976D2" style={{marginRight: 8}}/>
                <Text style={styles.callText}>Call Customer</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionHeader}>ITEMS TO DELIVER</Text>
            {order.products.map((p, i) => (
                <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemName}>{p.name} (x{p.quantity})</Text>
                    <Text style={styles.itemPrice}>₹{p.price * p.quantity}</Text>
                </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total to Collect</Text>
                <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
            </View>
        </View>
        <View style={{height: 100}} />
      </ScrollView>

      <View style={styles.footer}>
        {order.status === 'assigned' && (
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusUpdate('out_for_delivery')}>
                <Feather name="truck" size={20} color="#fff" style={{marginRight: 10}}/>
                <Text style={styles.actionText}>Start Delivery</Text>
            </TouchableOpacity>
        )}
        {order.status === 'out_for_delivery' && (
            <TouchableOpacity style={[styles.actionBtn, styles.greenBtn]} onPress={() => handleStatusUpdate('delivered')}>
                <Feather name="check-square" size={20} color="#fff" style={{marginRight: 10}}/>
                <Text style={styles.actionText}>Mark Delivered & Collected</Text>
            </TouchableOpacity>
        )}
      </View>

      {/* ✅ STEP 1 ALERT: Confirm Cash Collection */}
      <BeautifulAlert 
        visible={alertVisible}
        title="Confirm Delivery"
        message={`Have you collected ₹${order.totalAmount} from the customer?`}
        type="question"
        onConfirm={() => {
            setAlertVisible(false);
            setTimeout(() => setPaymentAlertVisible(true), 400); // Show next alert after a brief pause
        }}
        onCancel={() => setAlertVisible(false)}
      />

      {/* ✅ STEP 2 ALERT: Select Payment Method */}
      <BeautifulAlert 
        visible={paymentAlertVisible}
        title="Payment Method"
        message="Did they pay by Cash or UPI?"
        type="question"
        onConfirm={() => {
            setPaymentAlertVisible(false);
            updateStatusDB('delivered', true, 'cash'); // Defaults to cash on confirm
        }}
        onCancel={() => {
            setPaymentAlertVisible(false);
            updateStatusDB('delivered', true, 'upi'); // Use Cancel button logic for UPI or add a 3rd button
        }}
      />
    </View>
  );
}


// styles

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50, backgroundColor: '#1976D2', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 5 },
  
  content: { padding: 20 },
  
  statusBar: { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#BBDEFB' },
  statusText: { color: '#1565C0', fontWeight: 'bold', fontSize: 14 },

  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: '#999', marginBottom: 15, letterSpacing: 1, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  phone: { fontSize: 14, color: '#666', marginTop: 2 },
  address: { fontSize: 15, color: '#333', lineHeight: 22, flex: 1, marginLeft: 12 },
  
  callBtn: { flexDirection: 'row', backgroundColor: '#F0F7FF', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20, borderWidth: 1, borderColor: '#E3F2FD' },
  callText: { color: '#1976D2', fontWeight: 'bold' },
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemName: { fontSize: 15, color: '#333', flex: 1 },
  qty: { color: '#666' },
  itemPrice: { fontWeight: '600', color: '#333' },
  
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 20, fontWeight: '800', color: '#1976D2' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  
  actionBtn: { flexDirection: 'row', backgroundColor: '#1976D2', paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  greenBtn: { backgroundColor: '#2E7D32' },
  actionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  completedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#E8F5E9', borderRadius: 10, borderWidth: 1, borderColor: '#A5D6A7' },
  completedText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 16 }
});