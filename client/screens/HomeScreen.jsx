import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// 1) Import your separate Profile screen here:
import ProfileScreen from "./ProfileScreen"; 
import MatchingScreen from "./MatchingScreen";
import ChatsScreen from "./ChatsScreen";
import RequestsScreen from "./RequestsScreen";

const { width } = Dimensions.get("window");



// ----------- Home Tab Content -----------
import { doc, getDoc,query,collection,where,getDocs } from "firebase/firestore"; // Firestore imports
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig"; // Import Firebase instances


function HomeTabContent() {
  const [userName, setUserName] = useState("User"); // Default name is "User"
  const [loading, setLoading] = useState(true); // Loading state for fetching user name
  const upcomingSessions = [
    { date: "Oct 14", title: "Teaching: French Basics" },
    { date: "Oct 20", title: "Learning: Advanced Guitar" },
  ];
  const recommendedMentors = [
    { name: "John", skill: "Machine Learning" },
    { name: "Maria", skill: "Graphic Design" },
  ];

  
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const currentUser = FirebaseAuth.currentUser;

        if (currentUser) {
          // Fetch the user's name from Firestore
          const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.firstName || currentUser.displayName || "User");
          } else {
            // Fallback to Firebase Auth displayName
            setUserName(currentUser.displayName || "User");
          }
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Greeting / Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName}!</Text>
        <Text style={styles.subGreeting}>Welcome back to Brain Swap</Text>
      </View>

      {/* Upcoming Sessions Section */}
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

      {/* Recommended Mentors Section */}
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


// ----------- Chat Tab Content -----------
function ChatTabContent() {
  return (
    <View style={styles.center}>
      <Text style={styles.placeholderTitle}>Chat Screen</Text>
      <Text>This is a placeholder for Chat.</Text>
    </View>
  );
}

// ----------- Matches Tab Content -----------
function MatchesTabContent() {
  return (
    <View style={styles.center}>
      <Text style={styles.placeholderTitle}>Matches Screen</Text>
      <Text>This is a placeholder for Matches / Community.</Text>
    </View>
  );
}

// ----------- Requests Tab Content -----------
function RequestsTabContent() {
  return (
    <View style={styles.center}>
      <Text style={styles.placeholderTitle}>Requests Screen</Text>
      <Text>This is a placeholder for user requests or sessions.</Text>
    </View>
  );
}

/* ---------------------------------------------------------------------------
    3) The Main Screen with a custom bottom bar that conditionally renders 
       the content based on activeTab. Now, profile: <ProfileScreen />
--------------------------------------------------------------------------- */
export default function HomeScreenWithCustomNav() {
  const [activeTab, setActiveTab] = useState("home");

  let mainContent;
  switch (activeTab) {
    case "chat":
      mainContent = <ChatsScreen />;
      break;
    case "matches":
      mainContent = <MatchingScreen />;
      break;
    
    case "profile":
      mainContent = <ProfileScreen />;
      break;
    case "requests":
      mainContent = <RequestsScreen />;
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
              activeTab === "home" && styles.moreBoldText,
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

// ---------------------------------------------------------------------------
// 4) Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#f3f6ff",
  },
  body: {
    flex: 1,
  },

  /* Bottom bar in light grayish style or white */
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
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
    backgroundColor: "#f9f9f9",
  },
  bottomBarButtonActive: {
    backgroundColor: "#f2f2f2",
  },
  bottomBarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 4,
  },
  /* Extra bold text on active tab */
  moreBoldText: {
    fontWeight: "900",
  },

  // Remove any default text shadow in Ionicons
  iconNoShadow: {
    textShadowColor: "transparent",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },

  // --- Home Tab / Others (unchanged) ---
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

  // Center placeholders for other screens
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
