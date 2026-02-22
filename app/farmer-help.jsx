import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FarmerHelpChat() {
  const router = useRouter();
  const flatListRef = useRef();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 1. Initial Messages
  const [messages, setMessages] = useState([
    { id: '1', text: "Namaste! 🙏 I am your Kisan Sahayak.", sender: 'bot' },
    { id: '2', text: "How can I help you today?", sender: 'bot' }
  ]);

  // 2. Dynamic Options (The "Domino's" Buttons)
  const [options, setOptions] = useState([
    { id: 'opt1', label: '📦 Where is my Order?', action: 'track_order' },
    { id: 'opt2', label: '📞 Request Call Back', action: 'request_call' },
    { id: 'opt3', label: '💸 Payment Issue', action: 'payment_issue' },
  ]);

  const [inputMode, setInputMode] = useState(false); // If true, show text input instead of buttons
  const [customNumber, setCustomNumber] = useState('');
  const [pendingTicket, setPendingTicket] = useState(null); // Stores data before saving

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem('userData');
    if (data) setUser(JSON.parse(data));
  };

  // 3. Handle User Clicking an Option
  const handleOptionClick = (option) => {
    // A. Add User Message
    addMessage(option.label, 'user');
    setOptions([]); // Hide buttons while thinking

    // B. Bot Logic
    setTimeout(() => {
      switch (option.action) {
        case 'track_order':
          addMessage("You can track all your active orders in the 'My Orders' section.", 'bot');
          setOptions([{ id: 'go_orders', label: 'Go to My Orders', action: 'navigate_orders' }, { id: 'main_menu', label: 'Main Menu', action: 'reset' }]);
          break;

        case 'navigate_orders':
          router.push('/farmer-order-history'); // Change this if your route is different
          break;

        case 'payment_issue':
        case 'request_call':
          addMessage("Sure. Please select the reason for the call back:", 'bot');
          setOptions([
            { id: 'r1', label: 'Product Damaged', action: 'reason_damaged' },
            { id: 'r2', label: 'Suvidhak Issue', action: 'reason_suvidhak' },
            { id: 'r3', label: 'Other', action: 'reason_other' }
          ]);
          break;

        case 'reason_damaged':
        case 'reason_suvidhak':
        case 'reason_other':
          setPendingTicket({ type: option.label }); // Save reason
          addMessage(`Okay. We will call you on your registered number: ${user?.phoneNumber}. Is this correct?`, 'bot');
          setOptions([
            { id: 'yes', label: 'Yes, call this number', action: 'confirm_yes' },
            { id: 'no', label: 'No, use another number', action: 'confirm_no' }
          ]);
          break;

        case 'confirm_yes':
          saveTicket(user?.phoneNumber);
          break;

        case 'confirm_no':
          addMessage("Please enter the mobile number you want us to call.", 'bot');
          setInputMode(true); // Switch to Text Input
          break;

        case 'reset':
          setMessages(prev => [...prev, { id: Date.now().toString(), text: "How else can I help?", sender: 'bot' }]);
          setOptions([
            { id: 'opt1', label: '📦 Where is my Order?', action: 'track_order' },
            { id: 'opt2', label: '📞 Request Call Back', action: 'request_call' },
            { id: 'opt3', label: '💸 Payment Issue', action: 'payment_issue' },
          ]);
          break;
      }
    }, 600); // Small delay to feel like a bot
  };

  // 4. Handle Custom Number Input
  const handleSendNumber = () => {
    if (customNumber.length < 10) return;
    addMessage(customNumber, 'user');
    setInputMode(false);
    saveTicket('+91' + customNumber);
  };

  // 5. Helper to add messages
  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender }]);
  };

  // 6. Save to Firebase
  const saveTicket = async (phone) => {
    setLoading(true);
    addMessage("Generating your support ticket... ⏳", 'bot');
    
    try {
      await firestore().collection('support_requests').add({
        userId: user.uid,
        userName: user.name,
        userPhone: phone,
        type: pendingTicket?.type || 'General Help',
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      setLoading(false);
      addMessage("✅ Request received! Our Admin will call you shortly.", 'bot');
      setOptions([{ id: 'home', label: 'Back to Home', action: 'go_home' }, { id: 'more', label: 'More Help', action: 'reset' }]);
    } catch (error) {
      addMessage("❌ Error saving request. Please try again.", 'bot');
      setOptions([{ id: 'retry', label: 'Try Again', action: 'reset' }]);
      setLoading(false);
    }
  };

  // 7. Special Action Handling (Go Home)
  useEffect(() => {
    if (messages[messages.length-1]?.text === 'Back to Home') router.back();
  }, [messages]);


  // RENDER UI
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Kisan Sahayak</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble, 
            item.sender === 'user' ? styles.userBubble : styles.botBubble
          ]}>
            <Text style={[
              styles.bubbleText,
              item.sender === 'user' ? styles.userText : styles.botText
            ]}>{item.text}</Text>
          </View>
        )}
      />

      {/* Footer Area: Options or Input */}
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator color="#2E7D32" />
        ) : inputMode ? (
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              placeholder="Enter 10-digit number" 
              keyboardType="phone-pad"
              value={customNumber}
              onChangeText={setCustomNumber}
              maxLength={10}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendNumber}>
              <Text style={styles.sendText}>➤</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            {options.map(opt => (
              <TouchableOpacity 
                key={opt.id} 
                style={styles.optionChip} 
                onPress={() => handleOptionClick(opt)}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5DDD5' }, // WhatsApp-ish background color
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 15, paddingTop: 50, backgroundColor: '#075E54', elevation: 4 
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 5 },
  closeText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  chatList: { padding: 15, paddingBottom: 20 },
  
  bubble: { 
    maxWidth: '80%', padding: 12, borderRadius: 10, marginBottom: 10, elevation: 1 
  },
  botBubble: { 
    backgroundColor: '#fff', alignSelf: 'flex-start', borderTopLeftRadius: 0 
  },
  userBubble: { 
    backgroundColor: '#DCF8C6', alignSelf: 'flex-end', borderTopRightRadius: 0 
  },
  
  bubbleText: { fontSize: 16 },
  botText: { color: '#333' },
  userText: { color: '#333' },

  footer: { padding: 10, backgroundColor: '#f0f0f0' },
  
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  optionChip: { 
    backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20, 
    borderRadius: 20, borderWidth: 1, borderColor: '#075E54', elevation: 2 
  },
  optionText: { color: '#075E54', fontWeight: 'bold', fontSize: 14 },

  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  textInput: { 
    flex: 1, backgroundColor: '#fff', borderRadius: 25, padding: 10, 
    fontSize: 16, marginRight: 10, elevation: 1 
  },
  sendBtn: { 
    backgroundColor: '#075E54', width: 45, height: 45, borderRadius: 25, 
    justifyContent: 'center', alignItems: 'center', elevation: 2 
  },
  sendText: { color: '#fff', fontSize: 20 }
});