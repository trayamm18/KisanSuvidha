import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SuvidhakSaleSuccessScreen() {
  const router = useRouter();
  const { orderNumber, total, customerName, paymentMethod } = useLocalSearchParams();

  const handleDone = () => {
    // Go back to Suvidhak home and refresh
    router.replace('/home-suvidhak');
  };

  const handleAddAnother = () => {
    // Go to add sale screen to record another sale
    router.replace('/suvidhak-add-sale');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Feather name="check" size={50} color="#fff" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Sale Completed</Text>
        <Text style={styles.subtitle}>
          Your sale has been recorded successfully.
        </Text>

        {/* Order Details Card (Receipt Style) */}
        <View style={styles.detailsCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptLabel}>RECEIPT ID</Text>
            <Text style={styles.receiptValue}>#{orderNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer</Text>
            <Text style={styles.detailValue}>{customerName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <View style={styles.paymentRow}>
                <MaterialIcons 
                    name={paymentMethod === 'cash' ? "attach-money" : "qr-code-scanner"} 
                    size={16} 
                    color="#333" 
                    style={{marginRight: 4}}
                />
                <Text style={styles.detailValue}>
                    {paymentMethod === 'cash' ? 'Cash Payment' : 'UPI Transfer'}
                </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal</Text>
            <Text style={styles.detailValue}>₹{parseFloat(total).toLocaleString()}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Received</Text>
            <Text style={styles.totalAmount}>₹{parseFloat(total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Confirmation List */}
        <View style={styles.noteBox}>
          <View style={styles.checkItem}>
            <Feather name="check-circle" size={16} color="#2E7D32" style={{marginRight: 8}} />
            <Text style={styles.noteText}>Admin has been notified</Text>
          </View>
          <View style={styles.checkItem}>
            <Feather name="check-circle" size={16} color="#2E7D32" style={{marginRight: 8}} />
            <Text style={styles.noteText}>Sale added to performance</Text>
          </View>
          <View style={styles.checkItem}>
            <Feather name="check-circle" size={16} color="#2E7D32" style={{marginRight: 8}} />
            <Text style={styles.noteText}>Inventory updated</Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleDone}
        >
          <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
          <Feather name="home" size={18} color="#fff" style={{marginLeft: 8}} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleAddAnother}
        >
          <Text style={styles.secondaryButtonText}>Add Another Sale</Text>
          <Feather name="plus" size={18} color="#1976D2" style={{marginLeft: 8}} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  contentContainer: { padding: 30, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1976D2', justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 10, shadowColor: '#1976D2', shadowOpacity: 0.3, shadowRadius: 8 },
  
  title: { fontSize: 24, fontWeight: '800', color: '#333', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },
  
  detailsCard: { width: '100%', backgroundColor: '#F8F9FA', padding: 20, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: Platform.OS === 'ios' ? 'solid' : 'dashed' },
  
  receiptHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  receiptLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1 },
  receiptValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  
  paymentRow: { flexDirection: 'row', alignItems: 'center' },
  
  separator: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 12 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalAmount: { fontSize: 22, fontWeight: '800', color: '#1976D2' },
  
  noteBox: { width: '100%', backgroundColor: '#F1F8E9', padding: 15, borderRadius: 10, marginBottom: 30, borderWidth: 1, borderColor: '#C8E6C9' },
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  noteText: { fontSize: 14, color: '#33691E', fontWeight: '500' },
  
  primaryButton: { flexDirection: 'row', backgroundColor: '#1976D2', width: '100%', paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 15, elevation: 2 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  secondaryButton: { flexDirection: 'row', backgroundColor: '#fff', width: '100%', paddingVertical: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  secondaryButtonText: { color: '#1976D2', fontSize: 16, fontWeight: 'bold' },
});