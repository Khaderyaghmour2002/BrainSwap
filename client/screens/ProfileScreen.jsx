import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const user = {
    name: "Alice",
    bio: "Passionate guitarist and French teacher. Always excited to learn something new!",
    skillPoints: 125,
    location: "San Francisco, CA",
    skillsToTeach: ["Guitar", "French", "Cooking"],
    skillsToLearn: ["Digital Marketing", "Piano"],
  };

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
            <Ionicons
              name="person-circle-outline"
              size={100}
              color="#fff"
              style={styles.profileAvatarIcon}
            />
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileBio}>{user.bio}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.profileStatsCard}>
          <View style={styles.profileStatsRow}>
            <View style={styles.profileStatItem}>
              <Ionicons name="ribbon-outline" size={22} color="#4caf50" />
              <Text style={styles.profileStatValue}>{user.skillPoints}</Text>
              <Text style={styles.profileStatLabel}>Skill Points</Text>
            </View>
            <View style={styles.profileStatItem}>
              <Ionicons name="location-outline" size={22} color="#4caf50" />
              <Text style={styles.profileStatValue}>{user.location}</Text>
              <Text style={styles.profileStatLabel}>Location</Text>
            </View>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills to Teach</Text>
          <View style={styles.skillsPillContainer}>
            {user.skillsToTeach.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills to Learn</Text>
          <View style={styles.skillsPillContainer}>
            {user.skillsToLearn.map((skill, index) => (
              <View key={index} style={styles.skillPill}>
                <Text style={styles.skillPillText}>{skill}</Text>
              </View>
            ))}
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

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewerName}>John</Text>
            <Text style={styles.reviewText}>
              "Alice was a great mentor! Learned a lot about French basics."
            </Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewerName}>Maria</Text>
            <Text style={styles.reviewText}>
              "Super helpful and patient. Guitar lessons were fun!"
            </Text>
          </View>
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
});
