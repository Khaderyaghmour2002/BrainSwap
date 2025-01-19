import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function WelcomeScreen({ navigation }) {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const currentUser = FirebaseAuth.currentUser;

        if (currentUser) {
          const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.firstName || "User");
          } else {
            console.error("No user data found in Firestore.");
            setUserName("User");
          }
        } else {
          console.error("No user is logged in.");
          setUserName("User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName("User");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>Nice to meet you, {userName}!</Text>
      <Text style={styles.descriptionText}>
        You must be excited to start practicing and learning skills with others
        on our platform.
      </Text>
      <Text style={styles.descriptionText}>
        We have a few questions to help you find the right people in our large
        community.
      </Text>

      <TouchableOpacity
        style={styles.letsGoButton}
        onPress={() => navigation.navigate("LanguagePickerScreen")}
      >
        <Text style={styles.letsGoText}>LET'S GO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  letsGoButton: {
    marginTop: 20,
    backgroundColor: "#00BFFF",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: "center",
  },
  letsGoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
