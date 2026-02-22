import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BeautifulAlert({ visible, title, message, onConfirm, onCancel, type = "success" }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {/* Top Icon Area */}
          <View style={[styles.iconCircle, { backgroundColor: type === 'success' ? '#E8F5E9' : '#FFF3E0' }]}>
            <Ionicons 
              name={type === 'success' ? "checkmark-done-circle" : "help-circle"} 
              size={50} 
              color={type === 'success' ? "#2E7D32" : "#F57C00"} 
            />
          </View>
          
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          
          {/* Buttons Area */}
          <View style={styles.buttonRow}>
            {onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { width: '85%', backgroundColor: '#fff', borderRadius: 28, padding: 25, alignItems: 'center', elevation: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  alertTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  alertMessage: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmBtn: { flex: 1, backgroundColor: '#2E7D32', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { flex: 1, backgroundColor: '#f5f5f5', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: 'bold', fontSize: 16 },
});