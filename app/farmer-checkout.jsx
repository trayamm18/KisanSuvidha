import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { addOrder } from '../utils/database';

export default function FarmerCheckoutScreen() {
  const router = useRouter();
  const { cartData, total } = useLocalSearchParams();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const parsed = useMemo(() => {
    try {
      const c = cartData ? JSON.parse(cartData) : [];
      const amt = total ? parseFloat(total) || 0 : 0;
      return { cart: c, totalAmount: amt, parseError: false };
    } catch {
      return { cart: [], totalAmount: 0, parseError: true };
    }
  }, [cartData, total]);

  const { cart, totalAmount, parseError } = parsed;

  useEffect(() => {
    if (parseError) {
      Alert.alert("Error", "Invalid cart data. Please try again.");
      router.back();
    }
  }, [parseError]);

  if (parseError) return null;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Address", "Please enter your delivery address.");
      return;
    }

    if (paymentMethod === 'online') {
        // ✅ BLOCKED FOR NOW
        Alert.alert("Coming Soon", "Online payment is being set up. Please use Cash on Delivery for now.");
        return;
    } else {
        saveOrder('pending'); 
    }
  };

  // ✅ REMOVED: UPI payment function (client requirement - not needed for now)

  const saveOrder = async (payStatus) => {
    setLoading(true);
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      let user = {};
      try {
        if (userDataStr) {
          user = JSON.parse(userDataStr);
        }
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        user = {};
      }

      const orderData = {
        type: 'delivered',
        customerId: user.uid || 'unknown_id',
        customerName: user.name || 'Farmer',
        customerPhone: user.phoneNumber || '',
        customerAddress: address,
        customerArea: '',
        products: cart,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentStatus: payStatus, 
        status: 'pending',
      };

      const result = await addOrder(orderData);

      if (result.success) {
        // ✅ TRIGGER CART EMPTYING
       await AsyncStorage.setItem('orderCompleted', 'true');

        router.replace({
            pathname: '/farmer-order-success',
            params: { orderNumber: result.orderNumber }
        });
      } else {
        Alert.alert("Error", "Failed: " + (result.error?.message || "Unknown Error"));
      }
    } catch (error) {
      console.error("Crash Error:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 40}} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{flex: 1}}
      >
        <ScrollView 
            style={styles.content} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }} 
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.sectionHeaderRow}>
                <Feather name="map-pin" size={18} color="#2E7D32" />
                <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>
            </View>
            
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    placeholder="Enter full address, Village, Landmark..."
                    placeholderTextColor="#999"
                    multiline 
                    numberOfLines={4}
                    value={address}
                    onChangeText={setAddress}
                />
            </View>

            <View style={[styles.sectionHeaderRow, { marginTop: 25 }]}>
                <Feather name="credit-card" size={18} color="#2E7D32" />
                <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
            </View>
            
            <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'cod' && styles.activeOption]}
                onPress={() => setPaymentMethod('cod')}
            >
                <View style={[styles.iconBox, {backgroundColor: '#E8F5E9'}]}>
                    <MaterialCommunityIcons name="cash-multiple" size={24} color="#2E7D32" />
                </View>
                <View style={styles.paymentTextContainer}>
                    <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                    <Text style={styles.paymentSub}>Pay when products arrive</Text>
                </View>
                <View style={styles.radioOuter}>
                    {paymentMethod === 'cod' && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>

            {/* ✅ Online Payment Option (Marked Coming Soon) */}
            <TouchableOpacity 
                style={[styles.paymentOption, { opacity: 0.6 }]} 
                onPress={() => Alert.alert("Coming Soon", "Online payment will be available soon!")}
                disabled={true} 
            >
                <View style={[styles.iconBox, {backgroundColor: '#f0f0f0'}]}>
                    <MaterialCommunityIcons name="qrcode-scan" size={24} color="#999" />
                </View>
                <View style={styles.paymentTextContainer}>
                    <Text style={[styles.paymentTitle, {color: '#999'}]}>Pay Online (UPI)</Text>
                    <Text style={styles.paymentSub}>Coming Soon / जल्द आ रहा है</Text>
                </View>
                <View style={[styles.radioOuter, {borderColor: '#ccc'}]}>
                </View>
            </TouchableOpacity>

            <View style={[styles.sectionHeaderRow, { marginTop: 25 }]}>
                <Feather name="file-text" size={18} color="#2E7D32" />
                <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
            </View>

            <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Items ({cart.length})</Text>
                    <Text style={styles.value}>₹{totalAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Delivery Fee</Text>
                    <Text style={[styles.value, {color: '#2E7D32'}]}>FREE</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Payable</Text>
                    <Text style={styles.totalValue}>₹{totalAmount.toLocaleString()}</Text>
                </View>
            </View>

            <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
          {loading ? (
              <ActivityIndicator size="large" color="#2E7D32" />
          ) : (
              <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder}>
                  <Text style={styles.placeText}>
                    {paymentMethod === 'cod' ? 'Place Order (COD) →' : `Pay ₹${totalAmount} & Order →`}
                  </Text>
              </TouchableOpacity>
          )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 50, backgroundColor: '#2E7D32' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 5 },
  
  content: { flex: 1, padding: 20 },
  
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', marginLeft: 8, letterSpacing: 1 },
  
  inputContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 5, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  input: { padding: 15, fontSize: 16, color: '#333', textAlignVertical: 'top', height: 100 },
  
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, borderWidth: 1, borderColor: 'transparent' },
  activeOption: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
  
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  
  paymentTextContainer: { flex: 1 },
  paymentTitle: { fontWeight: '700', fontSize: 15, color: '#333' },
  paymentSub: { color: '#666', fontSize: 13, marginTop: 2 },
  
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#9E9E9E', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2E7D32' },

  summaryBox: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 15, color: '#666' },
  value: { fontSize: 15, color: '#333', fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 12 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#2E7D32' },
  
  footer: { 
  paddingHorizontal: 20, 
  paddingTop: 15,
  // ✅ Pushing the entire container UP from the bottom
  paddingBottom: Platform.OS === 'android' ? 50 : 40, 
  // ✅ Adding Margin to ensure it clears the system navigation buttons
  marginBottom: Platform.OS === 'android' ? 10 : 0,
  backgroundColor: '#fff', 
  elevation: 25, // Stronger shadow to show the "lift"
  borderTopWidth: 1, 
  borderTopColor: '#EEEEEE',
},
placeBtn: { 
  backgroundColor: '#2E7D32', 
  paddingVertical: 14, 
  borderRadius: 12, 
  alignItems: 'center', 
  // Makes the button pop
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 4.65,
  elevation: 8, 
},
placeText: { 
  color: '#fff', 
  fontSize: 16, 
  fontWeight: 'bold' 
}
});