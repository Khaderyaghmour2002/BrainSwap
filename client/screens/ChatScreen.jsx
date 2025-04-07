import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";

export default function ChatScreen({ navigation, route }) {
    const { recipientId, recipientName } = route?.params || {};

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const currentUser = FirebaseAuth.currentUser;
 

  const chatId = [currentUser.uid, recipientId].sort().join("_");

  useEffect(() => {
    const q = query(
      collection(FirestoreDB, "chats", chatId, "messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (input.trim() === "") return;

    await addDoc(collection(FirestoreDB, "chats", chatId, "messages"), {
      text: input,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || "User",
      createdAt: new Date(),
    });

    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with {recipientName}</Text>

      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.senderId === currentUser.uid
                ? styles.myMessage
                : styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E0E0",
  },
  messageText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f0f0f0",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
});
