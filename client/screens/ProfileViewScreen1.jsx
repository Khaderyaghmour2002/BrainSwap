import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { FirestoreDB, FirebaseAuth } from "../../server/firebaseConfig";

export default function ProfileViewScreen({ route }) {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScore, setSelectedScore] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(FirestoreDB, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        }

        const reviewerId = FirebaseAuth.currentUser?.uid;
        if (!reviewerId) return;

        const reviewsRef = collection(FirestoreDB, "users", userId, "reviews");
        const reviewsSnap = await getDocs(reviewsRef);

        const already = reviewsSnap.docs.some(doc => doc.data().reviewerId === reviewerId);
        setAlreadyReviewed(already);
      } catch (error) {
        Alert.alert("Error", "Failed to load user data or check reviews.");
        console.error(error);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
            {user.skillsToTeach?.length > 0 ? user.skillsToTeach.map(s => s.name).join(", ") : "No skills added."}
          </Text>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills to Learn</Text>
          <Text style={styles.sectionText}>
            {user.skillsToLearn?.length > 0 ? user.skillsToLearn.join(", ") : "No skills added."}
          </Text>
        </View>

        {!alreadyReviewed && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Rate this User</Text>

            <View style={styles.scoreContainer}>
              {[...Array(10)].map((_, i) => {
                const num = i + 1;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[styles.scoreButton, selectedScore === num && styles.scoreButtonSelected]}
                    onPress={() => setSelectedScore(num)}
                  >
                    <Text
                      style={[styles.scoreButtonText, selectedScore === num && styles.scoreButtonTextSelected]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedScore !== null && (
              <>
                <TextInput
                  placeholder="Write your review..."
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  style={styles.reviewInput}
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={async () => {
                    if (!reviewText.trim()) {
                      Alert.alert("Error", "Please enter a review.");
                      return;
                    }

                    try {
                      const reviewerId = FirebaseAuth.currentUser?.uid;
                      if (!reviewerId) {
                        Alert.alert("Authentication Error", "You must be logged in to leave a review.");
                        return;
                      }

                      await addDoc(collection(FirestoreDB, "users", userId, "reviews"), {
                        reviewerId,
                        text: reviewText,
                        score: selectedScore,
                        timestamp: serverTimestamp(),
                      });
                      Alert.alert("Success", "Review submitted!");
                      setSelectedScore(null);
                      setReviewText("");
                      setAlreadyReviewed(true);
                    } catch (error) {
                      console.error(error);
                      Alert.alert("Error", "Failed to submit review.");
                    }
                  }}
                >
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  reviewSection: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    backgroundColor: "#6a11cb",
    paddingVertical: 10,
    marginTop: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scoreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  scoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  scoreButtonSelected: {
    backgroundColor: "#6a11cb",
  },
  scoreButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  scoreButtonTextSelected: {
    color: "#fff",
  },
});