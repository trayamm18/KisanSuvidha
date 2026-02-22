import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  primary: '#1E40AF',
  secondary: '#F3F4F6',
  white: '#FFFFFF',
  text: '#111827',
  subText: '#6B7280',
  error: '#EF4444',
  border: '#E5E7EB'
};

export default function SuvidhakProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) setUser(JSON.parse(data));
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to exit?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem('userData');
          router.replace('/login');
        } 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'S'}</Text>
            </View>
            <Text style={styles.name}>{user?.name || 'Suvidhak'}</Text>
            <Text style={styles.role}>Authorized Field Agent</Text>
            <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
                <Text style={styles.badgeText}>Verified Account</Text>
            </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            
            <View style={styles.row}>
                <View style={styles.iconBox}><Ionicons name="call" size={20} color={COLORS.subText} /></View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Phone Number</Text>
                    <Text style={styles.value}>{user?.phoneNumber}</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
                <View style={styles.iconBox}><Ionicons name="location" size={20} color={COLORS.subText} /></View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Assigned Area</Text>
                    <Text style={styles.value}>{user?.area || 'N/A'}</Text>
                </View>
            </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <TouchableOpacity style={styles.optionRow}>
                <Text style={styles.optionText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.optionRow}>
                <Text style={styles.optionText}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.optionRow}>
                <Text style={styles.optionText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.subText} />
            </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: COLORS.white, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: { padding: 20 },
  
  profileCard: { alignItems: 'center', marginBottom: 25 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: COLORS.primary },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  role: { fontSize: 14, color: COLORS.subText, marginBottom: 8 },
  badge: { flexDirection: 'row', backgroundColor: '#E0E7FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  section: { backgroundColor: COLORS.white, borderRadius: 12, padding: 15, marginBottom: 20, elevation: 1 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.subText, marginBottom: 15, textTransform: 'uppercase' },
  
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, alignItems: 'center' },
  label: { fontSize: 12, color: COLORS.subText },
  value: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  optionText: { fontSize: 16, color: COLORS.text },

  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 15, borderRadius: 12, gap: 8 },
  logoutText: { color: COLORS.error, fontWeight: 'bold', fontSize: 16 },
  
  version: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, fontSize: 12 }
});