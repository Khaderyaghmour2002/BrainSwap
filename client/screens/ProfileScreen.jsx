import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import styles from "../StyleSheets/ProfileScreenStyle";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
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

  const choosePhotoOption = () => {
    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhotoWithCamera },
        { text: "Choose from Gallery", onPress: pickImageFromLibrary },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const pickImageFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Photo library access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      uploadPhoto(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera access is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri) => {
    try {
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No user is logged in.");
        return;
      }
      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
      await updateDoc(userDocRef, { photoUrl: uri });
      setUser((prev) => ({ ...prev, photoUrl: uri }));
      Alert.alert("Success", "Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    }
  };

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
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]}
        style={styles.headerCurvedBackground}
      >
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.profileContainer}>
        <View style={styles.profileAvatarContainer}>
          <View style={styles.avatarBackground}>
            {selectedImage || user.photoUrl ? (
              <Image
                source={{ uri: selectedImage || user.photoUrl }}
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
          <TouchableOpacity
            style={styles.editPhotoButton}
            onPress={choosePhotoOption}
          >
            <Ionicons name="camera-outline" size={22} color="#6a11cb" />
          </TouchableOpacity>
          <Text style={styles.profileName}>{user.firstName || "Unknown User"}</Text>
          <View style={styles.bioContainer}>
            <Text style={styles.profileBio}>
              {user.bio || "No bio available."}
            </Text>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => navigation.navigate("EditBio", { bio: user.bio })}
            >
              <Ionicons name="pencil-outline" size={20} color="#6a11cb" />
            </TouchableOpacity>
          </View>
        </View>

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
                {user.city && user.country
                  ? `${user.city}, ${user.country}`
                  : "Unknown Location"}
              </Text>
              <Text style={styles.profileStatLabel}>Location</Text>
            </View>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills to Teach</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("EditSkillsScreen", {
                  skills: user.skillsToTeach,
                  type: "teach",
                })
              }
            >
              <Ionicons name="pencil-outline" size={20} color="#6a11cb" />
            </TouchableOpacity>
          </View>
          <View style={styles.skillsPillContainer}>
            {user.skillsToTeach?.length > 0 ? (
              user.skillsToTeach.map((skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text>No skills added yet.</Text>
            )}
          </View>
        </View>

        <View style={styles.skillsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills to Learn</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("EditSkillsScreen", {
                  skills: user.skillsToLearn,
                  type: "learn",
                })
              }
            >
              <Ionicons name="pencil-outline" size={20} color="#6a11cb" />
            </TouchableOpacity>
          </View>
          <View style={styles.skillsPillContainer}>
            {user.skillsToLearn?.length > 0 ? (
              user.skillsToLearn.map((skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text>No skills added yet.</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await FirebaseAuth.signOut();
              navigation.replace("StartScreen");
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
