import { Ionicons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image, ScrollView,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AdminContentManager() {
  const router = useRouter();
  
  // ✅ TABS: 'highlights' or 'products'
  const [activeTab, setActiveTab] = useState('highlights');

  // State
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form Inputs
  const [title, setTitle] = useState('');     // Used for Name/Title
  const [subtitle, setSubtitle] = useState(''); // Used for Price/Subtitle
  const [imageUrl, setImageUrl] = useState('');

  // Data Lists
  const [highlights, setHighlights] = useState([]);
  const [products, setProducts] = useState([]);

  // ✅ 1. Listen to BOTH collections
  useEffect(() => {
    // Listen to Highlights
    const unsubHighlights = firestore().collection('promotions').orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        if(snap) setHighlights(snap.docs.map(d => ({id: d.id, ...d.data()})));
      });

    // Listen to Products
    const unsubProducts = firestore().collection('products').orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        if(snap) setProducts(snap.docs.map(d => ({id: d.id, ...d.data()})));
      });

    return () => { unsubHighlights(); unsubProducts(); };
  }, []);

  // ✅ 2. Image Picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) handleUpload(result.assets[0]);
  };

  // ✅ 3. Upload Logic
  const handleUpload = async (imageAsset) => {
    setUploading(true);
    const cloudName = "dkm7msss8"; 
    const uploadPreset = "unsigned_kisan"; 
    const cleanId = `content_${Date.now()}`; 
    const base64Img = `data:image/jpg;base64,${imageAsset.base64}`;
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        body: JSON.stringify({ file: base64Img, upload_preset: uploadPreset, public_id: cleanId }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      });
      const data = await response.json();
      if (data.secure_url) setImageUrl(data.secure_url);
      else Alert.alert("Upload Failed", "Cloudinary Error");
    } catch (err) {
      Alert.alert("Error", "Network error.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ 4. Add Logic (Dynamic based on Tab)
  const handleAddItem = async () => {
    if (!title || !subtitle || !imageUrl) {
      Alert.alert("Missing Info", "Please fill all fields and upload an image.");
      return;
    }

    setLoading(true);
    const collectionName = activeTab === 'highlights' ? 'promotions' : 'products';
    
    try {
      await firestore().collection(collectionName).add({
        title,      // Product Name OR Highlight Title
        subtitle,   // Price OR Highlight Subtitle
        imageUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      setTitle(''); setSubtitle(''); setImageUrl('');
      Alert.alert("Success", "Item added successfully!");
    } catch (error) {
      Alert.alert("Error", "Could not add item.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 5. Delete Logic
  const handleDelete = (id) => {
    const collectionName = activeTab === 'highlights' ? 'promotions' : 'products';
    Alert.alert("Delete?", "Action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => firestore().collection(collectionName).doc(id).delete() }
    ]);
  };

  // Helper to get labels based on tab
  const getLabel = (type) => {
    if (activeTab === 'highlights') {
      return type === 'title' ? 'Headline Title' : 'Subtitle / Description';
    }
    return type === 'title' ? 'Product Name (e.g. Wheat Seeds)' : 'Price (e.g. ₹450/kg)';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBg}>
        <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
               <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Content Manager</Text>
        </View>
      </View>

      {/* ✅ TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'highlights' && styles.activeTab]} 
            onPress={() => setActiveTab('highlights')}
        >
            <Text style={[styles.tabText, activeTab === 'highlights' && styles.activeTabText]}>Highlights</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'products' && styles.activeTab]} 
            onPress={() => setActiveTab('products')}
        >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* --- FORM SECTION --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>
            Add New {activeTab === 'highlights' ? 'Highlight' : 'Product'}
          </Text>
          
          <View style={styles.formCard}>
              {/* Image Upload */}
              <TouchableOpacity 
                  style={[styles.uploadZone, imageUrl && styles.uploadZoneActive]} 
                  onPress={pickImage} disabled={uploading}
              >
                  {uploading ? <ActivityIndicator color="#2E7D32" /> : imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.uploadedThumbnail} />
                  ) : (
                      <View style={{ alignItems: 'center' }}>
                          <Ionicons name="cloud-upload-outline" size={30} color="#2E7D32" />
                          <Text style={styles.uploadText}>Upload Image</Text>
                      </View>
                  )}
              </TouchableOpacity>

              {/* Inputs */}
              <Text style={styles.inputLabel}>{getLabel('title')}</Text>
              <TextInput 
                  style={styles.modernInput} 
                  value={title} onChangeText={setTitle} 
                  placeholder="Type here..."
              />
              
              <Text style={styles.inputLabel}>{getLabel('subtitle')}</Text>
              <TextInput 
                  style={styles.modernInput} 
                  value={subtitle} onChangeText={setSubtitle} 
                  placeholder="Type here..."
              />

              {/* Add Button */}
              <TouchableOpacity style={styles.addBtn} onPress={handleAddItem} disabled={loading || uploading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>+ Publish Item</Text>}
              </TouchableOpacity>
          </View>
        </View>

        {/* --- LIST SECTION --- */}
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Active {activeTab}</Text>
            
            {(activeTab === 'highlights' ? highlights : products).map((item) => (
                <View key={item.id} style={styles.listItem}>
                    <Image source={{ uri: item.imageUrl }} style={styles.listImage} />
                    <View style={styles.listContent}>
                        <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.listSub} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                    </TouchableOpacity>
                </View>
            ))}
            
            {(activeTab === 'highlights' ? highlights : products).length === 0 && (
                <Text style={styles.emptyText}>No items found.</Text>
            )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F4' },
  headerBg: { backgroundColor: '#1B5E20', paddingTop: 50, paddingBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 15 },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },

  // Tabs
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#2E7D32' },
  tabText: { fontSize: 16, fontWeight: '600', color: '#999' },
  activeTabText: { color: '#2E7D32' },

  sectionContainer: { padding: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#1B5E20', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },

  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 15, elevation: 3 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: 4, textTransform: 'uppercase' },
  modernInput: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 10, fontSize: 15, borderWidth: 1, borderColor: '#EDF2F7' },
  
  uploadZone: { height: 120, backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 5, overflow: 'hidden' },
  uploadZoneActive: { borderColor: '#2E7D32', borderStyle: 'solid' },
  uploadedThumbnail: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadText: { marginTop: 5, color: '#666', fontSize: 12 },

  addBtn: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  listItem: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 10, alignItems: 'center', elevation: 2 },
  listImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
  listContent: { flex: 1, marginLeft: 12 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  listSub: { fontSize: 14, color: '#2E7D32', fontWeight: '500' },
  deleteBtn: { padding: 10 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 10, fontStyle: 'italic' }
});