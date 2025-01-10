import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { FirebaseAuth, FirestoreDB } from "../../firebaseConfig"; // Import Firebase instances
import { doc, getDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = FirebaseAuth.currentUser;
        if (currentUser) {
          const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setUser(userDocSnap.data());
          } else {
            console.error("No such user data found in Firestore!");
          }
        } else {
          console.error("No user is currently logged in.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Failed to load user data.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]}
        style={styles.headerCurvedBackground}
      />

      <ScrollView contentContainerStyle={styles.profileContainer}>
        {/* Avatar + Name + Bio */}
        <View style={styles.profileAvatarContainer}>
          <View style={styles.avatarBackground}>
            {user.photoUrl ? (
              <Image
                source={{ uri: user.photoUrl }}
                style={styles.profileAvatarImage}
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={100}
                color="#fff"
                style={styles.profileAvatarIcon}
              />
            )}
          </View>
          <Text style={styles.profileName}>{user.firstName || "Unknown User"}</Text>
          <Text style={styles.profileBio}>{user.bio || "No bio available."}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.profileStatsCard}>
          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <Ionicons name="ribbon-outline" size={22} color="#4caf50" />
              <Text style={styles.profileStatValue}>
                {user.skillPoints || 0}
              </Text>
              <Text style={styles.profileStatLabel}>Skill Points</Text>
            </View>
            <View style={styles.profileStatItem}>
              <Ionicons name="location-outline" size={22} color="#4caf50" />
              <Text style={styles.profileStatValue}>
                {user.location || "Unknown"}
              </Text>
              <Text style={styles.profileStatLabel}>Location</Text>
            </View>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills to Teach</Text>
          <View style={styles.skillsPillContainer}>
            {user.skillsToTeach?.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            )) || <Text>No skills added yet.</Text>}
          </View>
        </View>
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills to Learn</Text>
          <View style={styles.skillsPillContainer}>
            {user.skillsToLearn?.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            )) || <Text>No skills added yet.</Text>}
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badge}>
              <Ionicons name="trophy-outline" size={30} color="#ffd700" />
              <Text style={styles.badgeText}>First Lesson</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="star-outline" size={30} color="#ffd700" />
              <Text style={styles.badgeText}>100 Skill Points</Text>
            </View>
          </ScrollView>
        </View>

        {/* Buttons / Profile Actions */}
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.profileActionButton}>
            <Text style={styles.profileActionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileActionButton}>
            <Text style={styles.profileActionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCurvedBackground: {
    position: "absolute",
    width: "100%",
    height: 200,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },

  profileContainer: {
    paddingTop: 140,
    paddingBottom: 40,
    alignItems: "center",
  },

  profileAvatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarBackground: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 8,
    elevation: 6,
    shadowColor: "#000",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginHorizontal: 20,
    marginBottom: 10,
  },

  profileStatsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "90%",
    elevation: 2,
  },
  profileStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  profileStatItem: {
    alignItems: "center",
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  skillsSection: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  skillsPillContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  skillPill: {
    backgroundColor: "#e0f7fa",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillPillText: {
    fontSize: 14,
    color: "#00796b",
  },

  badgesSection: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  badge: {
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    marginTop: 5,
    fontSize: 12,
    color: "#666",
  },

  reviewsSection: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
  },
  reviewItem: {
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  reviewText: {
    fontSize: 12,
    color: "#555",
  },

  profileActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  profileActionButton: {
    flex: 1,
    backgroundColor: "#6a11cb",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 5,
  },
  profileActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  logoutButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#d32f2f",
    borderRadius: 20,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Other styles remain unchanged
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "red",
  },
  profileAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});