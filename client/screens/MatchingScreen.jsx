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
} from "firebase/firestore";
import { FirestoreDB, FirebaseAuth } from "../../server/firebaseConfig";

export default function MatchingScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch matches from Firestore
  const fetchMatches = async () => {
    try {
      const currentUser = FirebaseAuth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      // Fetch the current user's data using UID as document ID
      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        Alert.alert("Error", "User data not found.");
        return;
      }

      const userData = userDocSnap.data();

      // Query for matches based on skills to learn
      const usersCollection = collection(FirestoreDB, "users");
      const matchesQuery = query(
        usersCollection,
        where("skillsToTeach", "array-contains-any", userData.skillsToLearn || [])
      );

      const querySnapshot = await getDocs(matchesQuery);

      const fetchedMatches = querySnapshot.docs
        .filter((doc) => doc.id !== currentUser.uid) // Exclude the current user
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setMatches(fetchedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      Alert.alert("Error", "Failed to fetch matches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const renderMatchItem = ({ item }) => (
    <View style={styles.matchCard}>
      <Image
        source={{ uri: item.photoUrl || "https://via.placeholder.com/100" }}
        style={styles.profileImage}
      />
      <View style={styles.matchDetails}>
        <Text style={styles.name}>{item.firstName || "Unknown User"}</Text>
        <Text style={styles.matchSkills}>
          Skills to Teach: {item.skillsToTeach.join(", ")}
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("ProfileView", {
              userId: item.id,
            })
          }
        >
          <Text style={styles.actionButtonText}>View Profile</Text>
        </TouchableOpacity>
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

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyMessage}>
          No matches found. Try updating your skills!
        </Text>
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
    marginTop: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyMessage: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
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
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
