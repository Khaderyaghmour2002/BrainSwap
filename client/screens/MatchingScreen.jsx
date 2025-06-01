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
} from "react-native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FirestoreDB, FirebaseAuth } from "../../server/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function MatchingScreen() {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) return;

      // Fetch user profile
      const userDoc = await getDoc(doc(FirestoreDB, "users", currentUser.uid));
      const userData = userDoc.data();

      // Fetch matching users
      const matchesQuery = query(
        collection(FirestoreDB, "users"),
        where("skillsToTeach", "array-contains-any", userData.skillsToLearn || [])
      );

      const querySnapshot = await getDocs(matchesQuery);
      const fetched = querySnapshot.docs
        .filter((doc) => doc.id !== currentUser.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setMatches(fetched);

      // Fetch sent requests with status "pending"
      const requestsSnapshot = await getDocs(
        query(
          collection(FirestoreDB, "requests"),
          where("from", "==", currentUser.uid),
          where("status", "==", "pending")
        )
      );
      const sentTo = new Set(requestsSnapshot.docs.map((doc) => doc.data().to));
      setPendingRequests(sentTo);
    } catch (err) {
      console.error("Error fetching matches:", err);
      Alert.alert("Error", "Failed to fetch matches.");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (targetUser) => {
    try {
      const currentUser = FirebaseAuth.currentUser;
      const requestRef = doc(FirestoreDB, "requests", `${currentUser.uid}_${targetUser.id}`);

      await setDoc(requestRef, {
        from: currentUser.uid,
        to: targetUser.id,
        status: "pending",
        timestamp: serverTimestamp(),
      });

      setPendingRequests((prev) => new Set(prev).add(targetUser.id));
      Alert.alert("Request Sent", `You have sent a request to ${targetUser.firstName}.`);
    } catch (err) {
      console.error("Failed to send request:", err);
      Alert.alert("Error", "Could not send request. Try again.");
    }
  };

 const renderMatchItem = ({ item }) => {
  const isPending = pendingRequests.has(item.id);

  return (
    <View style={styles.matchCard}>
      <Image source={{ uri: item.photoUrl }} style={styles.profileImage} />

      <View style={styles.matchContent}>
        <Text style={styles.name}>{item.firstName}</Text>
        <Text style={styles.skills}>
          🎓 Teaching: {item.skillsToTeach.join(", ")}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() =>
              navigation.navigate("ProfileViewScreen", { userId: item.id })
            }
          >
            <Text style={styles.buttonText}>👀 View</Text>
          </TouchableOpacity>

          {isPending ? (
            <View style={styles.pendingButton}>
              <Text style={styles.buttonText}>⏳ Pending</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
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
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: "#ddd",
  },
  matchContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  skills: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  viewButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  requestButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  pendingButton: {
    backgroundColor: "#aaa",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});


