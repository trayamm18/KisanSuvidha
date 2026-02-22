import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) setUser(JSON.parse(data));
    } catch (error) {
      console.error("Error loading profile", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            router.replace('/login'); 
          }
        }
      ]
    );
  };

  if (!user) return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;

  // Get Initials
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "A";

  return (
    <ScrollView style={styles.container}>
      
      {/* 1. HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
        </View>
        
        {/* "Admin" Tag ABOVE Name */}
        <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.phone}>+91 {user.phoneNumber?.replace('+91', '')}</Text>
      </View>

      {/* 2. SETTINGS LIST (Same as Farmer) */}
      <Text style={styles.sectionHeader}>SETTINGS</Text>

      <View style={styles.settingsList}>
        
        {/* Language Option */}
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Language", "Feature coming soon!")}>
            <View style={styles.settingLeft}>
                <Ionicons name="globe-outline" size={22} color="#333" style={{marginRight:15}} />
                <Text style={styles.settingText}>Language / भाषा</Text>
            </View>
            <Text style={styles.settingValue}>English</Text>
        </TouchableOpacity>

        {/* About App */}
        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={22} color="#333" style={{marginRight:15}} />
                <Text style={styles.settingText}>About App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={22} color="#333" style={{marginRight:15}} />
                <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

      </View>

      {/* 3. LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF5252" style={{marginRight: 10}} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0 (Admin Build)</Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HEADER
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#fff', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2E7D32',
    marginBottom: 15
  },
  avatarText: { fontSize: 40, color: '#2E7D32', fontWeight: 'bold' },
  
  // Specific Admin Tag Style
  adminBadge: { 
    backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 2, 
    borderRadius: 4, marginBottom: 5 
  },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  phone: { fontSize: 16, color: '#666', marginTop: 5 },

  // SETTINGS SECTION
  sectionHeader: { 
    fontSize: 14, fontWeight: 'bold', color: '#666', marginLeft: 20, marginBottom: 10, marginTop: 20 
  },
  settingsList: { backgroundColor: '#fff', paddingHorizontal: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  settingItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' 
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 16, color: '#333' },
  settingValue: { fontSize: 14, color: '#2E7D32', fontWeight: 'bold' },

  // LOGOUT
  logoutBtn: { 
    margin: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#FF5252', 
    borderRadius: 10, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' 
  },
  logoutText: { color: '#FF5252', fontSize: 16, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#ccc', fontSize: 12, marginBottom: 30 }
});