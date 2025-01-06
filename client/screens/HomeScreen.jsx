import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

function HomeTabContent() {
  const userName = "Alice";
  const upcomingSessions = [
    { date: "Oct 14", title: "Teaching: French Basics" },
    { date: "Oct 20", title: "Learning: Advanced Guitar" },
  ];
  const recommendedMentors = [
    { name: "John", skill: "Machine Learning" },
    { name: "Maria", skill: "Graphic Design" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName}!</Text>
        <Text style={styles.subGreeting}>Welcome back to SkillShare</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {upcomingSessions.length === 0 ? (
          <Text style={styles.placeholderText}>No scheduled sessions yet.</Text>
        ) : (
          upcomingSessions.map((session, index) => (
            <View key={index} style={styles.sessionCard}>
              <Text style={styles.sessionDate}>{session.date}</Text>
              <Text style={styles.sessionTitle}>{session.title}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Mentors</Text>
        {recommendedMentors.length === 0 ? (
          <Text style={styles.placeholderText}>No recommendations at this time.</Text>
        ) : (
          recommendedMentors.map((item, index) => (
            <View key={index} style={styles.matchCard}>
              <Text style={styles.matchName}>{item.name}</Text>
              <Text style={styles.matchSkill}>Expert in {item.skill}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ChatTabContent() {
  return (
    <View style={styles.center}>
      <Text style={styles.placeholderTitle}>Chat Screen</Text>
      <Text>This is a placeholder for Chat.</Text>
    </View>
  );
}

function MatchesTabContent() {
  return (
    <View style={styles.center}>
      <Text style={styles.placeholderTitle}>Matches Screen</Text>
      <Text>This is a placeholder for Matches / Community.</Text>
    </View>
  );
}

function ProfileTabContent() {
  return (
    <View style={styles.center}>
      <Text style={styles.placeholderTitle}>Profile Screen</Text>
      <Text>This is a placeholder for the user’s profile.</Text>
    </View>
  );
}

function RequestsTabContent() {
  return (
    <View style={styles.center}>
      <Text style={styles.placeholderTitle}>Requests Screen</Text>
      <Text>This is a placeholder for user requests or sessions.</Text>
    </View>
  );
}

export default function HomeScreenWithCustomNav() {
  const [activeTab, setActiveTab] = useState("home");

  let mainContent;
  switch (activeTab) {
    case "chat":
      mainContent = <ChatTabContent />;
      break;
    case "matches":
      mainContent = <MatchesTabContent />;
      break;
    case "profile":
      mainContent = <ProfileTabContent />;
      break;
    case "requests":
      mainContent = <RequestsTabContent />;
      break;
    default:
      mainContent = <HomeTabContent />;
      break;
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.body}>{mainContent}</View>

      {/* Custom bottom bar */}
      <View style={styles.bottomBar}>
        {/* Home Button */}
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            activeTab === "home" && styles.bottomBarButtonActive,
          ]}
          onPress={() => setActiveTab("home")}
        >
          <Ionicons
            style={styles.iconNoShadow}
            name="home-outline"
            size={24}
            color={activeTab === "home" ? "#333" : "#333"}
          />
          <Text
            style={[
              styles.bottomBarText,
              activeTab === "home" && styles.moreBoldText, // 900 weight if active
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Chat Button */}
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            activeTab === "chat" && styles.bottomBarButtonActive,
          ]}
          onPress={() => setActiveTab("chat")}
        >
          <Ionicons
            style={styles.iconNoShadow}
            name="chatbubble-outline"
            size={24}
            color={activeTab === "chat" ? "#333" : "#333"}
          />
          <Text
            style={[
              styles.bottomBarText,
              activeTab === "chat" && styles.moreBoldText,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>

        {/* Matches Button */}
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            activeTab === "matches" && styles.bottomBarButtonActive,
          ]}
          onPress={() => setActiveTab("matches")}
        >
          <Ionicons
            style={styles.iconNoShadow}
            name="people-circle-outline"
            size={24}
            color={activeTab === "matches" ? "#333" : "#333"}
          />
          <Text
            style={[
              styles.bottomBarText,
              activeTab === "matches" && styles.moreBoldText,
            ]}
          >
            Matches
          </Text>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            activeTab === "profile" && styles.bottomBarButtonActive,
          ]}
          onPress={() => setActiveTab("profile")}
        >
          <Ionicons
            style={styles.iconNoShadow}
            name="person-outline"
            size={24}
            color={activeTab === "profile" ? "#333" : "#333"}
          />
          <Text
            style={[
              styles.bottomBarText,
              activeTab === "profile" && styles.moreBoldText,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>

        {/* Requests Button */}
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            activeTab === "requests" && styles.bottomBarButtonActive,
          ]}
          onPress={() => setActiveTab("requests")}
        >
          <Ionicons
            style={styles.iconNoShadow}
            name="notifications-outline"
            size={24}
            color={activeTab === "requests" ? "#333" : "#333"}
          />
          <Text
            style={[
              styles.bottomBarText,
              activeTab === "requests" && styles.moreBoldText,
            ]}
          >
            Requests
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#f3f6ff",
  },
  body: {
    flex: 1,
  },

  /* 
   * Lighter Gray Bottom Bar
   * #eee background
   * #ddd for active button
   */
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#eee",
    borderTopColor: "#ccc",
    borderTopWidth: 1,
  },
  bottomBarButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 25,
    backgroundColor: "transparent",
  },
  bottomBarButtonActive: {
    backgroundColor: "#ddd",
  },
  bottomBarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 4,
  },
  moreBoldText: {
    fontWeight: "900",
  },

  // Remove any default text shadow in Ionicons
  iconNoShadow: {
    textShadowColor: "transparent",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },

  // Original Home content / placeholders
  container: {
    flex: 1,
    backgroundColor: "#f3f6ff",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: "#555",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2b3a67",
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 13,
    color: "#666",
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  matchName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  matchSkill: {
    fontSize: 13,
    color: "#777",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
});
