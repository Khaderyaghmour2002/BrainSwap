import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { FirestoreDB } from "../../server/firebaseConfig";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ProfileViewScreen({ route }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(FirestoreDB, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  if (!user) {
    return (
      <Text style={{ textAlign: "center", marginTop: 40 }}>
        User data not available.
      </Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileCard}>
        <Image
          source={{ uri: user.photoUrl || "https://via.placeholder.com/150" }}
          style={styles.image}
        />
        <Text style={styles.name}>{user.firstName}</Text>
        <Text style={styles.bio}>{user.bio || "No bio provided."}</Text>
      </View>

      <View style={styles.infoSection}>
        <ProfileInfo icon="location-outline" label="Location">
          {user.city && user.country ? `${user.city}, ${user.country}` : "Not specified"}
        </ProfileInfo>

        <ProfileInfo icon="language-outline" label="Language">
          {user.language || "Not specified"}
        </ProfileInfo>

        <ProfileInfo icon="ribbon-outline" label="Skill Points">
          {user.skillPoints || 0}
        </ProfileInfo>
      </View>

      <View style={styles.skillsSection}>
        <Text style={styles.sectionTitle}>Skills to Teach</Text>
        <Text style={styles.sectionText}>
          {user.skillsToTeach?.length > 0 ? user.skillsToTeach.join(", ") : "No skills added."}
        </Text>
      </View>

      <View style={styles.skillsSection}>
        <Text style={styles.sectionTitle}>Skills to Learn</Text>
        <Text style={styles.sectionText}>
          {user.skillsToLearn?.length > 0 ? user.skillsToLearn.join(", ") : "No skills added."}
        </Text>
      </View>
    </ScrollView>
  );
}

const ProfileInfo = ({ icon, label, children }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={20} color="#6a11cb" style={{ marginRight: 10 }} />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    marginTop: 30,
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    elevation: 3,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#6a11cb",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  infoSection: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#555",
    flexShrink: 1,
  },
  skillsSection: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2b3a67",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#555",
  },
});
