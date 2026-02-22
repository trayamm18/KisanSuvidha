import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from '@react-native-firebase/firestore';

const db = getFirestore();

// ==========================================
// 👤 USER MANAGEMENT
// ==========================================

// Save or Update User
export async function saveUser(userData) {
  try {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, userData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving user:", error);
    return { success: false, error };
  }
}

// Get User Data by Phone Number
export async function getUserData(phoneNumber) {
  try {
    const formattedPhone = phoneNumber.includes('+91') ? phoneNumber : `+91${phoneNumber}`;
    
    const q = query(
      collection(db, 'users'), 
      where('phoneNumber', '==', formattedPhone), 
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      return { success: true, data: { uid: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error };
  }
}

// Update User Location
export async function updateUserLocation(uid, locationData) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      location: locationData,
      lastActive: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating location:", error);
    return { success: false, error };
  }
}

// Get All Suvidhaks
export async function getAllSuvidhaks() {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'suvidhak'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

// Get Suvidhak Performance Stats
export async function getSuvidhakPerformance(suvidhakId) {
    try {
        const deliveredQuery = query(
          collection(db, 'orders'),
          where('suvidhakId', '==', suvidhakId),
          where('status', '==', 'delivered')
        );
        const deliveredSnapshot = await getDocs(deliveredQuery);

        const selfSalesQuery = query(
          collection(db, 'orders'),
          where('suvidhakId', '==', suvidhakId),
          where('type', '==', 'self_sale')
        );
        const selfSalesSnapshot = await getDocs(selfSalesQuery);

        const deliveredTotal = deliveredSnapshot.docs.reduce((sum, d) => sum + (parseFloat(d.data().totalAmount) || 0), 0);
        const selfSalesTotal = selfSalesSnapshot.docs.reduce((sum, d) => sum + (parseFloat(d.data().totalAmount) || 0), 0);

        return {
            success: true,
            data: {
                deliveredOrders: { count: deliveredSnapshot.size, amount: deliveredTotal },
                selfSales: { count: selfSalesSnapshot.size, amount: selfSalesTotal },
                total: { count: deliveredSnapshot.size + selfSalesSnapshot.size, amount: deliveredTotal + selfSalesTotal }
            }
        };
    } catch (error) {
        console.error("Error getting performance:", error);
        return { success: false, error };
    }
}

// ==========================================
// 📦 PRODUCT MANAGEMENT
// ==========================================

export async function addProduct(productData) {
  try {
    await addDoc(collection(db, 'products'), productData);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getAllProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
}

// ==========================================
// 🚚 ORDER MANAGEMENT
// ==========================================

// ✅ NEW FUNCTION: Specifically for Suvidhak Sales (Returns Order ID & Number)
export async function addOrder(orderData) {
  try {
    // Generate a unique Order Number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

    const finalOrder = {
      ...orderData,
      orderNumber,
      status: orderData.status || 'assigned', // Default status if not provided
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), finalOrder);
    
    // Return success with the new ID and Number (needed for the Success Screen)
    return { success: true, orderId: docRef.id, orderNumber };
  } catch (error) {
    console.error("Error inside addOrder:", error);
    return { success: false, error };
  }
}

// Standard Create Order (Keep for backward compatibility/other flows)
export async function createOrder(orderData) {
    try {
        await addDoc(collection(db, 'orders'), {
            ...orderData,
            createdAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export async function getAllOrders() {
    try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return { success: true, data };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
}

export async function getOrdersBySuvidhak(suvidhakId, type = null) {
    try {
        let q;
        if (type) {
           q = query(
             collection(db, 'orders'), 
             where('suvidhakId', '==', suvidhakId),
             where('type', '==', type)
           );
        } else {
           q = query(
             collection(db, 'orders'), 
             where('suvidhakId', '==', suvidhakId)
           );
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Manual sort since compound queries need complex indexes
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        return { success: true, data };
    } catch (error) {
        console.error(error);
        return { success: false, error };
    }
}

export async function assignOrderToSuvidhak(orderId, suvidhakId, suvidhakName) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'assigned',
            suvidhakId: suvidhakId,
            suvidhakName: suvidhakName,
            assignedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

export async function updateOrderStatus(orderId, status, deliveredAt = null) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const updateData = {
            status: status,
            updatedAt: serverTimestamp()
        };

        // If delivered date is passed (for delivery completion)
        if (deliveredAt) {
            updateData.deliveredAt = deliveredAt; 
        }

        await updateDoc(orderRef, updateData);
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}