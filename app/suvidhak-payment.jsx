import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { addOrder } from '../utils/database';

export default function SuvidhakPaymentScreen() {
  const router = useRouter();
  const { cart, total, customerName, customerPhone, customerVillage, customerAddress } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false); // Kept state for potential future use

  const cartItems = cart ? JSON.parse(cart) : [];
  const totalAmount = total ? parseFloat(total) : 0;

  // Placeholder for future UPI logic
  const COMPANY_UPI_ID = "kisan.suvidha@upi"; 
  const COMPANY_NAME = "Kisan Suvidha Pvt Ltd";
  const upiUrl = `upi://pay?pa=${COMPANY_UPI_ID}&pn=${COMPANY_NAME}&am=${totalAmount}&cu=INR`;

  const handlePaymentComplete = async (method) => {
    setShowQR(false); 
    setLoading(true);
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);

      const orderData = {
        type: 'self_sale',
        customerId: null,
        customerName,
        customerPhone,
        customerArea: customerVillage,
        customerAddress: customerAddress || '',
        suvidhakId: userData.uid,
        suvidhakName: userData.name,
        products: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit
        })),
        totalAmount,
        paymentMethod: method,
        paymentStatus: 'paid',
      };

      const result = await addOrder(orderData);

      if (result.success) {
        router.replace({
          pathname: '/suvidhak-sale-success',
          params: {
            orderNumber: result.orderNumber,
            total: totalAmount,
            customerName,
            paymentMethod: method,
          }
        });
      } else {
        Alert.alert("Error", "Failed to save order.");
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = () => {
    Alert.alert(
      "Confirm Cash Collection",
      `Please confirm you have received ₹${totalAmount.toLocaleString()} from the customer.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Payment Received", onPress: () => handlePaymentComplete('cash') }
      ]
    );
  };

  const handleUPIPayment = () => {
    // 🔴 LOGIC CHANGED: Showing Coming Soon instead of opening scanner
    Alert.alert(
        "Coming Soon", 
        "Online payments are currently disabled. Please collect cash.",
        [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={loading}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
             <Feather name="file-text" size={18} color="#1976D2" style={{marginRight: 8}} />
             <Text style={styles.detailsTitle}>INVOICE DETAILS</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer</Text>
            <Text style={styles.detailValue}>{customerName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Village</Text>
            <Text style={styles.detailValue}>{customerVillage}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>

        {/* Cash Payment */}
        <TouchableOpacity 
          style={styles.paymentCard}
          onPress={handleCashPayment}
          disabled={loading}
        >
          <View style={[styles.iconBox, {backgroundColor: '#E3F2FD'}]}>
            <FontAwesome5 name="money-bill-wave" size={20} color="#1976D2" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Cash Collection</Text>
            <Text style={styles.paymentSubtext}>Mark as paid in cash</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* UPI Payment (Disabled/Coming Soon) */}
        <TouchableOpacity 
          style={[styles.paymentCard, {opacity: 0.7}]} // Slightly faded to indicate disabled state
          onPress={handleUPIPayment}
          disabled={loading}
        >
          <View style={[styles.iconBox, {backgroundColor: '#F5F5F5'}]}>
            <MaterialIcons name="qr-code-scanner" size={24} color="#757575" />
          </View>
          <View style={styles.paymentInfo}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.paymentTitle, {color: '#757575'}]}>Online Payment</Text>
                <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>SOON</Text>
                </View>
            </View>
            <Text style={styles.paymentSubtext}>UPI / QR Code</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Processing Transaction...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1976D2', paddingTop: Platform.OS === 'ios' ? 60 : 50 },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  placeholder: { width: 40 },
  
  content: { flex: 1, padding: 20 },
  
  detailsCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailsTitle: { fontSize: 12, fontWeight: '700', color: '#999', letterSpacing: 1 },
  
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 24, fontWeight: '800', color: '#1976D2' },
  
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 15, letterSpacing: 0.5 },
  
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  
  iconBox: { width: 50, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  
  paymentInfo: { flex: 1 },
  paymentTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  paymentSubtext: { fontSize: 13, color: '#999' },
  
  soonBadge: { backgroundColor: '#EEEEEE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  soonText: { fontSize: 10, fontWeight: 'bold', color: '#757575' },
  
  loadingOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#fff', fontWeight: '600' }
});