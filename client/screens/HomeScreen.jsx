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
import HomeContentScreen from "./HomeContentScreen"; // Import HomeTabContent
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
      mainContent = <HomeContentScreen />;
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
            Updates
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
    //marginBottom: 10,
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
    //marginBottom: 5,
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