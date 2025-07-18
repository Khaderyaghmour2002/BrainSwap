import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  setDoc,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { FirestoreDB, FirebaseAuth } from "../../server/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function MatchingScreen() {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ sent: new Set(), received: new Set() });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

 const fetchMatches = async () => {
  try {
    const currentUser = FirebaseAuth.currentUser;
    if (!currentUser) return;

    const userDoc = await getDoc(doc(FirestoreDB, "users", currentUser.uid));
    const userData = userDoc.data();
    const userConnections = new Set(userData.connections || []);

    const allUsersSnap = await getDocs(collection(FirestoreDB, "users"));

    const fetched = allUsersSnap.docs
      .filter(docSnap => {
        if (docSnap.id === currentUser.uid) return false;
        if (userConnections.has(docSnap.id)) return false;
        const data = docSnap.data();
        const teachNames = (data.skillsToTeach || []).map(s => s.name);
        return teachNames.some(skill => (userData.skillsToLearn || []).includes(skill));
      })
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

    setMatches(fetched);

    // Fetch sent pending requests
    const sentSnapshot = await getDocs(
      query(
        collection(FirestoreDB, "requests"),
        where("from", "==", currentUser.uid),
        where("status", "==", "pending")
      )
    );
    const sentTo = new Set(sentSnapshot.docs.map(d => d.data().to));

    // Fetch received pending requests
    const receivedSnapshot = await getDocs(
      query(
        collection(FirestoreDB, "requests"),
        where("to", "==", currentUser.uid),
        where("status", "==", "pending")
      )
    );
    const receivedFrom = new Set(receivedSnapshot.docs.map(d => d.data().from));

    setPendingRequests({ sent: sentTo, received: receivedFrom });

  } catch (err) {
    console.error("Error fetching matches:", err);
    Alert.alert("Error", "Failed to fetch matches.");
  } finally {
    setLoading(false);
  }
};


  const sendRequest = async (targetUser) => {
    const currentUser = FirebaseAuth.currentUser;
    if (pendingRequests.received.has(targetUser.id)) {
      Alert.alert("Already Requested", `${targetUser.firstName} already sent you a request.`);
      return;
    }

    try {
      const requestRef = doc(FirestoreDB, "requests", `${currentUser.uid}_${targetUser.id}`);
      await setDoc(requestRef, {
        from: currentUser.uid,
        to: targetUser.id,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      setPendingRequests(prev => ({
        ...prev,
        sent: new Set(prev.sent).add(targetUser.id)
      }));

      Alert.alert("Request Sent", `You have sent a request to ${targetUser.firstName}.`);
    } catch (err) {
      console.error("Failed to send request:", err);
      Alert.alert("Error", "Could not send request. Try again.");
    }
  };

  const renderMatchItem = ({ item }) => {
  const isSentPending = pendingRequests.sent.has(item.id);
  const isReceivedPending = pendingRequests.received.has(item.id);

  const teachNames = (item.skillsToTeach || []).map(s => s.name).join(", ");

  return (
    <View style={styles.matchCard}>
      <TouchableOpacity onPress={() => navigation.navigate("ProfileViewScreen", { userId: item.id })}>
        <Image source={{ uri: item.photoUrl || "https://via.placeholder.com/64" }} style={styles.profileImage} />
      </TouchableOpacity>

      <View style={styles.matchContent}>
        <Text style={styles.name}>{item.firstName}</Text>
        <Text style={styles.skills}>🎓 Teaching: {teachNames || "N/A"}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate("ProfileViewScreen", { userId: item.id })}
          >
            <Text style={styles.buttonText}>👀 View</Text>
          </TouchableOpacity>

          {isSentPending ? (
            <View style={styles.pendingButton}>
              <Text style={styles.buttonText}>⏳ Pending</Text>
            </View>
          ) : isReceivedPending ? (
            <View style={styles.pendingButton}>
              <Text style={styles.buttonText}>💬 Respond</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => sendRequest(item)}
            >
              <Text style={styles.buttonText}>🤝 Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8", paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#222", textAlign: "center", marginTop: Platform.OS === 'ios' ? 30 : 0 , marginBottom: Platform.OS === 'ios' ? 15 : 8, },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContainer: { paddingBottom: 20 },
  matchCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    alignItems: "center",
  },
  profileImage: { width: 64, height: 64, borderRadius: 32, marginRight: 14, backgroundColor: "#ddd" },
  matchContent: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600", color: "#333" },
  skills: { fontSize: 14, color: "#555", marginTop: 4, marginBottom: 10 },
  actionsRow: { flexDirection: "row", gap: 12 },
  viewButton: { backgroundColor: "#2196F3", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  requestButton: { backgroundColor: "#4CAF50", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  pendingButton: { backgroundColor: "#aaa", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});