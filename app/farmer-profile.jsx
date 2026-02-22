import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react'; // ✅ Added useEffect
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FarmerProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('en'); 
  const [loading, setLoading] = useState(true);

  // ✅ ADDED STATES FOR PRE-FILLING
  const [name, setName] = useState(""); 
  const [phone, setPhone] = useState("");

  // Reload data every time screen opens
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // ✅ NEW EFFECT: Pre-fill name and phone whenever user data updates
  // This ensures that when you go to the setup/edit screen, the data is already ready
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phoneNumber || "");
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const localData = await AsyncStorage.getItem('userData');
      const lang = await AsyncStorage.getItem('userLanguage');
      if (lang) setLanguage(lang);

      if (localData) {
        const parsedLocal = JSON.parse(localData);
        const userDoc = await firestore().collection('users').doc(parsedLocal.uid).get();
        
        if (userDoc.exists) {
          const freshData = userDoc.data();
          const finalUser = { uid: parsedLocal.uid, ...freshData };
          setUser(finalUser);
          await AsyncStorage.setItem('userData', JSON.stringify(finalUser));
        } else {
          setUser(parsedLocal);
        }
      }
    } catch (error) {
      console.error("Error loading profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLanguage = () => {
    Alert.alert(
      "Select Language / भाषा चुनें",
      "Choose your preferred language / अपनी पसंदीदा भाषा चुनें",
      [
        { 
          text: "English", 
          onPress: async () => {
            await AsyncStorage.setItem('userLanguage', 'en');
            setLanguage('en');
            loadData(); 
          } 
        },
        { 
          text: "हिंदी (Hindi)", 
          onPress: async () => {
            await AsyncStorage.setItem('userLanguage', 'hi');
            setLanguage('hi');
            loadData();
          }
        },
        { text: "Cancel / रद्द करें", style: "cancel" }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      language === 'hi' ? "लॉग आउट" : "Logout",
      language === 'hi' ? "क्या आप लॉग आउट करना चाहते हैं?" : "Are you sure you want to logout?",
      [
        { text: language === 'hi' ? "रद्द करें" : "Cancel", style: "cancel" },
        { 
          text: language === 'hi' ? "हाँ" : "Logout", 
          style: "destructive", 
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            router.replace('/login'); 
          }
        }
      ]
    );
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2E7D32" /></View>;
  }

  if (!user) return null;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "K";
  const t = (en, hi) => (language === 'hi' ? hi : en);

  const displayLocation = () => {
    if (user.location && typeof user.location === 'object' && user.location.address) {
        return user.location.address;
    }
    if (user.location && typeof user.location === 'string') {
        return user.location;
    }
    if (user.address) return user.address;
    if (user.city) return user.city;
    return t("Not Set", "सेट नहीं है");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* 1. HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.phone}>+91 {user.phoneNumber?.replace('+91', '')}</Text>
        
        <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2E7D32" style={{marginRight: 4}} />
            <Text style={styles.verifiedText}>{t('Verified Farmer', 'सत्यापित किसान')}</Text>
        </View>
      </View>

      {/* 2. INFO CARD */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
            <View style={styles.iconBox}><Ionicons name="location-outline" size={20} color="#2E7D32" /></View>
            <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>{t('Location', 'स्थान')}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{displayLocation()}</Text>
            </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="seed-outline" size={20} color="#2E7D32" /></View>
            <View style={{flex: 1}}>
                <Text style={styles.infoLabel}>{t('Main Crops', 'मुख्य फसलें')}</Text>
                <Text style={styles.infoValue}>
                    {user.mainCrops ? (Array.isArray(user.mainCrops) ? user.mainCrops.join(', ') : user.mainCrops) : "N/A"}
                </Text>
            </View>
        </View>

        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => router.push('/setup-crops')}
        >
            <Text style={styles.editBtnText}>{t('Edit Profile', 'प्रोफ़ाइल संपादित करें')}</Text>
        </TouchableOpacity>
      </View>

      {/* 3. SETTINGS SECTION */}
      <Text style={styles.sectionHeader}>{t('SETTINGS', 'सेटिंग्स')}</Text>

      <View style={styles.settingsList}>
        <TouchableOpacity style={styles.settingItem} onPress={handleChangeLanguage}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, {backgroundColor: '#E3F2FD'}]}>
                    <Ionicons name="globe-outline" size={20} color="#1565C0" />
                </View>
                <Text style={styles.settingText}>{t('Language', 'भाषा')}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.settingValue}>{language === 'hi' ? 'हिंदी' : 'English'}</Text>
                <Ionicons name="chevron-forward" size={18} color="#ccc" style={{marginLeft: 5}} />
            </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, {backgroundColor: '#FFF3E0'}]}>
                    <Ionicons name="information-circle-outline" size={20} color="#EF6C00" />
                </View>
                <Text style={styles.settingText}>{t('About App', 'ऐप के बारे में')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/farmer-help')}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, {backgroundColor: '#E8F5E9'}]}>
                    <Ionicons name="headset-outline" size={20} color="#2E7D32" />
                </View>
                <Text style={styles.settingText}>{t('Help & Support', 'सहायता')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, {backgroundColor: '#FFEBEE'}]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#C62828" />
                </View>
                <Text style={styles.settingText}>{t('Privacy Policy', 'गोपनीयता नीति')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* 4. LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#D32F2F" style={{marginRight: 8}} />
        <Text style={styles.logoutText}>{t('Logout', 'लॉग आउट')}</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Version 1.0.0</Text>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HEADER
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn: { position: 'absolute', top: 40, left: 20, padding: 5, zIndex: 10 },
  
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff',
    marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
  },
  avatarText: { fontSize: 36, color: '#2E7D32', fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  phone: { fontSize: 15, color: '#666', marginTop: 2 },
  verifiedBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', 
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8, 
    borderWidth: 1, borderColor: '#C8E6C9' 
  },
  verifiedText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },

  // INFO CARD
  infoCard: { 
    backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 20, 
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F7FA', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  infoValue: { fontSize: 16, color: '#333', fontWeight: '600', flex: 1 }, // Added flex:1 for multiline wrapping
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12, marginLeft: 50 },
  
  editBtn: { 
    backgroundColor: '#fff', borderRadius: 10, paddingVertical: 12, 
    alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#2E7D32' 
  },
  editBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 14 },

  // SETTINGS SECTION
  sectionHeader: { 
    fontSize: 14, fontWeight: 'bold', color: '#888', marginLeft: 25, marginBottom: 10, marginTop: 25, letterSpacing: 1 
  },
  settingsList: { backgroundColor: '#fff', paddingHorizontal: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  settingItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' 
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingText: { fontSize: 16, color: '#333', marginLeft: 0 }, 
  settingValue: { fontSize: 14, color: '#2E7D32', fontWeight: '600' },

  // LOGOUT
  logoutBtn: { 
    margin: 20, backgroundColor: '#FFEBEE', borderRadius: 12, 
    paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' 
  },
  logoutText: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' },
  versionText: { textAlign: 'center', color: '#ccc', fontSize: 12, marginBottom: 30 }
});