import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FarmerSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingLoc, setFetchingLoc] = useState(false);
  
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState(""); 
  
  const [location, setLocation] = useState(null); 
  const [detectedAddress, setDetectedAddress] = useState("Detecting location..."); 

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setFetchingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDetectedAddress("Permission denied. Enter manually.");
        setFetchingLoc(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      let addressList = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      if (addressList.length > 0) {
        const addr = addressList[0];
        const locality = addr.district || addr.subregion || addr.city || ""; 
        const area = addr.street || addr.name || "";
        setDetectedAddress(`${area}, ${locality}`);
        
        if (!city && addr.city) setCity(addr.city);
        if (!state && addr.region) setState(addr.region);
      }
    } catch (error) {
      console.log(error);
      setDetectedAddress("Could not detect location.");
    } finally {
      setFetchingLoc(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !state.trim() || !city.trim()) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      const user = JSON.parse(userDataStr);

      const updateData = {
        name: name,
        state: state,
        city: city,
        manualAddress: `${city}, ${state}`,
        location: location, 
        detectedLocality: detectedAddress, 
        isProfileComplete: true, 
        role: 'farmer'
      };

      await firestore().collection('users').doc(user.uid).update(updateData);
      
      const updatedUser = { ...user, ...updateData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

      router.replace('/setup-crops');

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Ionicons name="leaf" size={40} color="#2E7D32" style={{marginBottom: 10}} />
          <Text style={styles.title}>Welcome, Farmer</Text>
          <Text style={styles.subtitle}>Complete your profile to access the marketplace.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter your full name" 
                placeholderTextColor="#999"
                value={name} 
                onChangeText={setName} 
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.label}>State</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. MP" 
                placeholderTextColor="#999"
                value={state} 
                onChangeText={setState} 
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.label}>City/District</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Indore" 
                placeholderTextColor="#999"
                value={city} 
                onChangeText={setCity} 
              />
            </View>
          </View>

          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Ionicons name="location-outline" size={18} color="#2E7D32" />
              <Text style={styles.locLabel}>Auto-Detected Location</Text>
            </View>
            
            {fetchingLoc ? (
              <View style={styles.fetchingBox}>
                <ActivityIndicator size="small" color="#2E7D32" />
                <Text style={styles.fetchingText}>Syncing location...</Text>
              </View>
            ) : (
              <View style={styles.addressBox}>
                <Text style={styles.detectedText}>{detectedAddress}</Text>
                <TouchableOpacity onPress={detectLocation} style={styles.refreshBtn}>
                  <Ionicons name="refresh-outline" size={16} color="#1976D2" />
                  <Text style={styles.retryText}>Update Location</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, loading && styles.btnDisabled]} 
            onPress={handleSaveProfile} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff"/>
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.saveText}>Save & Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', // ✅ Centers content vertically in the ScrollView
  },
  content: { 
    padding: 24,
    width: '100%',
    alignItems: 'center', // ✅ Centers everything horizontally
  },
  headerSection: { 
    alignItems: 'center', 
    marginBottom: 32 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1A1A1A',
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 15, 
    color: '#666', 
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22 
  },
  form: { 
    width: '100%' 
  },
  inputGroup: { 
    marginBottom: 20 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#444', 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  inputIcon: { 
    marginLeft: 15 
  },
  input: { 
    flex: 1, 
    padding: 16, 
    fontSize: 16, 
    color: '#333' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  locationSection: { 
    backgroundColor: '#F1F8E9', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 32, 
    borderWidth: 1, 
    borderColor: '#DCEDC8' 
  },
  locationHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  locLabel: { 
    fontWeight: '700', 
    color: '#2E7D32', 
    marginLeft: 6, 
    fontSize: 14 
  },
  fetchingBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10 
  },
  fetchingText: { 
    marginLeft: 10, 
    color: '#666', 
    fontSize: 14 
  },
  addressBox: { 
    marginTop: 2 
  },
  detectedText: { 
    fontSize: 15, 
    color: '#333', 
    fontWeight: '600', 
    lineHeight: 20 
  },
  refreshBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 12 
  },
  retryText: { 
    color: '#1976D2', 
    marginLeft: 5, 
    fontWeight: '700', 
    fontSize: 13 
  },
  saveBtn: { 
    backgroundColor: '#2E7D32', 
    paddingVertical: 18, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginTop: 10,
    // iOS shadow
    shadowColor: '#2E7D32', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8,
    // Android elevation
    elevation: 4 
  },
  btnContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  btnDisabled: { 
    backgroundColor: '#A5D6A7' 
  },
  saveText: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700', 
    marginRight: 8 
  }
});