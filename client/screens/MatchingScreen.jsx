// MatchingScreen.jsx (Upgraded with request-based connection logic)
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
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FirestoreDB, FirebaseAuth } from "../../server/firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function MatchingScreen() {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) return;

      const userDoc = await getDoc(doc(FirestoreDB, "users", currentUser.uid));
      const userData = userDoc.data();

      const matchesQuery = query(
        collection(FirestoreDB, "users"),
        where("skillsToTeach", "array-contains-any", userData.skillsToLearn || [])
      );

      const querySnapshot = await getDocs(matchesQuery);
      const fetched = querySnapshot.docs
        .filter((doc) => doc.id !== currentUser.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setMatches(fetched);
    } catch (err) {
      console.error("Error fetching matches:", err);
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

      Alert.alert("Request Sent", `You have sent a request to ${targetUser.firstName}.`);
    } catch (err) {
      console.error("Failed to send request:", err);
      Alert.alert("Error", "Could not send request. Try again.");
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const renderMatchItem = ({ item }) => (
    <View style={styles.matchCard}>
      <Image source={{ uri: item.photoUrl }} style={styles.profileImage} />
      <View style={styles.matchDetails}>
        <Text style={styles.name}>{item.firstName}</Text>
        <Text style={styles.matchSkills}>
          Skills to Teach: {item.skillsToTeach.join(", ")}
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate("ProfileViewScreen", { userId: item.id })}
          >
            <Text style={styles.actionText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => sendRequest(item)}
          >
            <Text style={styles.actionText}>Send Request</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
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
    alignItems: "center",
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  matchDetails: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  matchSkills: {
    fontSize: 14,
    color: "#777",
    marginVertical: 5,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  viewButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  requestButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});