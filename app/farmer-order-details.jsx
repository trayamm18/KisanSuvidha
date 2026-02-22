import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadLanguage();
    fetchOrder();
  }, []);

  const loadLanguage = async () => {
    const lang = await AsyncStorage.getItem('userLanguage');
    if (lang) setLanguage(lang);
  };

  const fetchOrder = async () => {
    try {
      const doc = await firestore().collection('orders').doc(orderId).get();
      if (doc.exists) {
        setOrder({ id: doc.id, ...doc.data() });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const t = (en, hi) => (language === 'hi' ? hi : en);

  const handleCall = (phoneNumber) => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;
  if (!order) return <View style={styles.center}><Text style={styles.errorText}>Order not found</Text></View>;

  // Timeline Logic
  const steps = [
    { key: 'pending', label: t('Order Placed', 'ऑर्डर प्राप्त हुआ'), icon: 'clipboard-text-outline' },
    { key: 'packed', label: t('Packed', 'पैक किया गया'), icon: 'package-variant-closed' },
    { key: 'out_for_delivery', label: t('Out for Delivery', 'डिलीवरी के लिए निकला'), icon: 'truck-delivery-outline' },
    { key: 'delivered', label: t('Delivered', 'डिलीवर हो गया'), icon: 'check-circle-outline' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Professional Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('Order Details', 'ऑर्डर विवरण')}</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Order Summary Header */}
        <View style={styles.orderHeaderCard}>
            <View style={styles.orderHeaderRow}>
                <View>
                    <Text style={styles.orderLabel}>{t('ORDER ID', 'ऑर्डर आईडी')}</Text>
                    <Text style={styles.orderId}>#{order.orderNumber}</Text>
                </View>
                {order.createdAt && (
                    <View style={styles.dateBadge}>
                        <Feather name="calendar" size={12} color="#2E7D32" style={{marginRight: 4}}/>
                        <Text style={styles.dateText}>{new Date(order.createdAt?.toDate()).toLocaleDateString()}</Text>
                    </View>
                )}
            </View>
        </View>

        {/* 🚚 TRACKING TIMELINE */}
        <View style={styles.card}>
            <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="map-marker-path" size={20} color="#2E7D32" />
                <Text style={styles.sectionHeader}>{t('Track Order', 'ट्रैक ऑर्डर')}</Text>
            </View>
            
            <View style={styles.timeline}>
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isLast = index === steps.length - 1;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <View key={step.key} style={styles.stepRow}>
                            {/* Left Side: Line & Icon */}
                            <View style={styles.stepIndicator}>
                                {!isLast && (
                                    <View style={[styles.line, { backgroundColor: index < currentStepIndex ? '#2E7D32' : '#E0E0E0' }]} />
                                )}
                                <View style={[
                                    styles.stepIcon, 
                                    { backgroundColor: isCompleted ? '#2E7D32' : '#F5F5F5', borderColor: isCompleted ? '#2E7D32' : '#E0E0E0' }
                                ]}>
                                    <MaterialCommunityIcons name={step.icon} size={16} color={isCompleted ? '#fff' : '#9E9E9E'} />
                                </View>
                            </View>

                            {/* Right Side: Text */}
                            <View style={styles.stepTextContainer}>
                                <Text style={[
                                    styles.stepLabel, 
                                    { color: isCompleted ? '#333' : '#9E9E9E', fontWeight: isCompleted ? '700' : '500' }
                                ]}>
                                    {step.label}
                                </Text>
                                {isCurrent && (
                                    <Text style={styles.currentStatusBadge}>{t('In Progress', 'प्रगति पर है')}</Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>

        {/* 👤 SUVIDHAK (Delivery Agent) DETAILS */}
        {order.suvidhakName ? (
            <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons name="account-tie" size={20} color="#2E7D32" />
                    <Text style={styles.sectionHeader}>{t('Delivery Partner', 'डिलीवरी पार्टनर')}</Text>
                </View>
                
                <View style={styles.suvidhakRow}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="bike" size={28} color="#2E7D32" />
                    </View>
                    <View style={{flex:1, marginLeft: 15}}>
                        <Text style={styles.suvidhakName}>{order.suvidhakName}</Text>
                        <View style={styles.verifiedBadge}>
                            <MaterialCommunityIcons name="shield-check" size={14} color="#fff" />
                            <Text style={styles.verifiedText}>{t('Verified', 'सत्यापित')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(order.suvidhakPhone)}>
                        <Feather name="phone" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        ) : (
            <View style={styles.card}>
                 <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#F57C00" />
                    <Text style={[styles.sectionHeader, {color: '#F57C00'}]}>{t('Finding Partner...', 'पार्टनर खोज रहे हैं...')}</Text>
                </View>
                <Text style={styles.infoText}>{t('We will assign a delivery partner shortly.', 'हम जल्द ही एक डिलीवरी पार्टनर नियुक्त करेंगे।')}</Text>
            </View>
        )}

        {/* 📦 ITEMS LIST */}
        <View style={styles.card}>
            <View style={styles.cardTitleRow}>
                <Feather name="shopping-bag" size={18} color="#2E7D32" />
                <Text style={styles.sectionHeader}>{t('Order Items', 'ऑर्डर का सामान')}</Text>
            </View>
            
            {order.products?.map((item, index) => (
                <View key={index} style={styles.productRow}>
                    <View style={styles.qtyBox}>
                        <Text style={styles.qtyText}>{item.quantity}x</Text>
                    </View>
                    <View style={{flex: 1, marginHorizontal: 10}}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.unitText}>{item.unit}</Text>
                    </View>
                    <Text style={styles.productPrice}>₹{item.price * item.quantity}</Text>
                </View>
            ))}
            
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('Total Amount', 'कुल राशि')}</Text>
                <Text style={styles.totalValue}>₹{parseFloat(order.totalAmount).toLocaleString()}</Text>
            </View>
        </View>

        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#666' },

  // Header
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, paddingTop: 50, 
    backgroundColor: '#2E7D32', // Professional Green
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backBtn: { padding: 5 },

  content: { padding: 20, marginTop: -20 }, // Overlap header slightly for modern look

  // Order Summary Card
  orderHeaderCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderLabel: { fontSize: 11, color: '#9E9E9E', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  orderId: { fontSize: 18, fontWeight: '800', color: '#333' },
  dateBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', 
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 
  },
  dateText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },

  // Generic Card
  card: { 
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3 
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: 10 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#333', marginLeft: 8, textTransform: 'uppercase' },
  infoText: { color: '#666', fontSize: 14 },

  // Timeline
  timeline: { paddingLeft: 5 },
  stepRow: { flexDirection: 'row', height: 60 }, 
  stepIndicator: { alignItems: 'center', width: 30, marginRight: 15 },
  line: { 
    position: 'absolute', top: 24, width: 2, height: '100%', 
    zIndex: 0 
  },
  stepIcon: { 
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', 
    borderWidth: 2, zIndex: 1 
  },
  stepTextContainer: { justifyContent: 'center', paddingBottom: 15 },
  stepLabel: { fontSize: 15 },
  currentStatusBadge: { 
    fontSize: 10, color: '#1976D2', fontWeight: 'bold', marginTop: 2, 
    backgroundColor: '#E3F2FD', alignSelf: 'flex-start', paddingHorizontal: 6, borderRadius: 4 
  },

  // Suvidhak
  suvidhakRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  suvidhakName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E7D32', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', elevation: 2 },

  // Products
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  qtyBox: { backgroundColor: '#F5F5F5', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEEEEE' },
  qtyText: { fontSize: 13, fontWeight: 'bold', color: '#666' },
  productName: { fontSize: 15, fontWeight: '600', color: '#333' },
  unitText: { fontSize: 12, color: '#999' },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#333' },
  
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 12 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#666' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#2E7D32' },
});