import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import styles from '../StyleSheets/ProfileScreenStyle'; 

export default function ProfileScreen({ navigation }) {
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
      >
        {/* Settings Icon */}
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

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
          <View style={styles.bioContainer}>
            <Text style={styles.profileBio}>{user.bio || "No bio available."}</Text>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => navigation.navigate("EditBio", { bio: user.bio })}
            >
              <Ionicons name="pencil-outline" size={20} color="#6a11cb" />
            </TouchableOpacity>
          </View>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills to Teach</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("EditSkills", {
                  skills: user.skillsToTeach,
                  type: "teach",
                })
              }
            >
              <Ionicons name="pencil-outline" size={20} color="#6a11cb" />
            </TouchableOpacity>
          </View>
          <View style={styles.skillsPillContainer}>
            {user.skillsToTeach?.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            )) || <Text>No skills added yet.</Text>}
          </View>
        </View>

        <View style={styles.skillsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills to Learn</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("EditSkills", {
                  skills: user.skillsToLearn,
                  type: "learn",
                })
              }
            >
              <Ionicons name="pencil-outline" size={20} color="#6a11cb" />
            </TouchableOpacity>
          </View>
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

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
          
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

