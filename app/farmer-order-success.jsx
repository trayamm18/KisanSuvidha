import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; // ✅ Added MaterialCommunityIcons
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FarmerOrderSuccess() {
  const router = useRouter();
  const { orderNumber } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      <View style={styles.card}>
        <View style={styles.iconCircle}>
            <Feather name="check" size={50} color="#fff" />
        </View>
        
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.sub}>Thank you for your order.</Text>

        <View style={styles.divider} />

        <View style={styles.infoBox}>
            <Text style={styles.label}>ORDER ID</Text>
            <Text style={styles.orderNum}>#{orderNumber}</Text>
        </View>

        <View style={styles.messageRow}>
            {/* Now this icon will work correctly */}
            <MaterialCommunityIcons name="bike-fast" size={20} color="#1976D2" style={{marginRight: 8}} />
            <Text style={styles.info}>A Suvidhak will be assigned shortly.</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/home-farmer')}>
        <Text style={styles.btnText}>Back to Home</Text>
        <Feather name="home" size={18} color="#1976D2" style={{marginLeft: 8}} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1976D2', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  card: { 
    backgroundColor: '#fff', 
    width: '100%', 
    padding: 30, 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1976D2', // Brand Blue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    marginTop: -60, // Floating effect
    borderWidth: 4,
    borderColor: '#fff'
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#333', 
    marginBottom: 8 
  },
  sub: { 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E0E0E0',
    marginBottom: 20
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
    letterSpacing: 1
  },
  orderNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10
  },
  info: { 
    color: '#1565C0', 
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1
  },
  btn: { 
    marginTop: 30, 
    backgroundColor: 'white', 
    flexDirection: 'row',
    paddingVertical: 16, 
    paddingHorizontal: 40,
    borderRadius: 12, 
    alignItems: 'center',
    elevation: 3
  },
  btnText: { 
    color: '#1976D2', 
    fontWeight: 'bold', 
    fontSize: 16 
  }
});