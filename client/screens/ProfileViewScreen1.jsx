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
    query,
    orderBy,
    where,
    updateDoc,
    arrayRemove,
  } from "firebase/firestore";
  import { FirestoreDB, FirebaseAuth } from "../../server/firebaseConfig";

  export default function ProfileViewScreen({ route, navigation }) {
    const { userId } = route.params;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedScore, setSelectedScore] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const docRef = doc(FirestoreDB, "users", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser(docSnap.data());
          }

          const reviewerId = FirebaseAuth.currentUser?.uid;
          const reviewsRef = collection(FirestoreDB, "users", userId, "reviews");
          const reviewsQuery = query(reviewsRef, orderBy("timestamp", "desc"));
          const reviewsSnap = await getDocs(reviewsQuery);

          const reviewList = await Promise.all(
            reviewsSnap.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const reviewerDoc = await getDoc(doc(FirestoreDB, "users", data.reviewerId));
              return {
                ...data,
                reviewerName: reviewerDoc?.data()?.firstName || "Anonymous",
                reviewerPhoto: reviewerDoc?.data()?.photoUrl || null,
              };
            })
          );

          setReviews(reviewList);
          const already = reviewList.some(r => r.reviewerId === reviewerId);
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

    useEffect(() => {
      const fetchUserPosts = async () => {
        try {
          const postsRef = collection(FirestoreDB, "posts");
          const q = query(
            postsRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);

          const posts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setUserPosts(posts);
        } catch (error) {
          console.error("Error fetching user posts:", error);
        }
      };

      fetchUserPosts();
    }, [userId]);

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
const removeConnection = async (otherUserId) => {
  const currentUser = FirebaseAuth.currentUser;
  if (!currentUser || !otherUserId) return;

  try {
    const userRef = doc(FirestoreDB, 'users', currentUser.uid);
    const otherRef = doc(FirestoreDB, 'users', otherUserId);

    await updateDoc(userRef, {
      connections: arrayRemove(otherUserId), // remove from current user's array
    });

    await updateDoc(otherRef, {
      connections: arrayRemove(currentUser.uid), // remove from other user's array
    });

    Alert.alert("Removed", "Connection successfully removed.");
  } catch (err) {
    console.error("Error removing connection:", err);
    Alert.alert("Error", "Failed to remove the connection.");
  }
};

const blockUser = async (otherUserId) => {
  const currentUser = FirebaseAuth.currentUser;
  if (!currentUser || !otherUserId) return;

  try {
    // Block each other
    await setDoc(doc(FirestoreDB, 'users', currentUser.uid, 'blocked', otherUserId), {
      blockedAt: serverTimestamp(),
    });

    await setDoc(doc(FirestoreDB, 'users', otherUserId, 'blocked', currentUser.uid), {
      blockedAt: serverTimestamp(),
    });

    // Remove connection from both
    const userRef = doc(FirestoreDB, 'users', currentUser.uid);
    const otherRef = doc(FirestoreDB, 'users', otherUserId);

    await updateDoc(userRef, {
      connections: arrayRemove(otherUserId),
    });

    await updateDoc(otherRef, {
      connections: arrayRemove(currentUser.uid),
    });

    Alert.alert("Blocked", "User has been blocked and removed from connections.");
  } catch (err) {
    console.error("Error blocking user:", err);
    Alert.alert("Error", "Failed to block user.");
  }
};
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
     <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={26} color="#6a11cb" />
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
    <Ionicons name="ellipsis-vertical" size={24} color="#6a11cb" />
  </TouchableOpacity>
</View>

{menuVisible && (
  <View style={styles.dropdownMenu}>
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setMenuVisible(false);
        removeConnection(userId);
      }}
    >
      <Text style={styles.dropdownText}>Remove Contact</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setMenuVisible(false);
        Alert.alert("Block User", "Are you sure you want to block this user?", [
          { text: "Cancel" },
          { text: "Block", onPress: () => blockUser(userId) },
        ]);
      }}
    >
      <Text style={styles.dropdownText}>Block User</Text>
    </TouchableOpacity>
  </View>
)}


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

          {reviews.length > 0 && (
            <View style={styles.reviewSection}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviews.map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                  <Image
                    source={{ uri: review.reviewerPhoto || "https://via.placeholder.com/100" }}
                    style={styles.reviewerImage}
                  />
                  <View style={styles.reviewTextContainer}>
                    <Text style={{ fontWeight: "bold" }}>{review.reviewerName}</Text>
                    <Text style={{ color: "#555" }}>{review.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {userPosts.length > 0 && (
            <View style={styles.postsSection}>
              <Text style={styles.sectionTitle}>Posts</Text>
              {userPosts.map((post) => (
                <View key={post.id} style={styles.postCard}>
                  {post.imageUrl ? (
                    <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
                  ) : null}

                  <Text style={styles.postContent}>{post.caption || "No content"}</Text>
                  <Text style={styles.postTime}> {post.createdAt?.toDate().toLocaleDateString() || "Just now"}</Text>
                </View>
              ))}
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
  backIcon: {
    alignSelf: "flex-start",
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    marginTop: 10,
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
  reviewItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewTextContainer: {
    flex: 1,
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
  postsSection: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  postCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: "#333",
  },
  postTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  menuWrapper: {
  position: 'absolute',
  top: 25,
  right: 20,
  zIndex: 10,
    paddingTop: 16,

},

dropdownMenu: {
  position: 'absolute',
  top: 30,
  right: 0,
  backgroundColor: '#fff',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
  
},

dropdownItem: {
  paddingVertical: 6,
},

dropdownText: {
  fontSize: 14,
  color: '#333',
},
headerRow: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 10,
  marginTop: 20,
  marginBottom: 10,
},

dropdownMenu: {
  position: 'absolute',
  top: 60,
  right: 20,
  backgroundColor: '#fff',
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 6,
  zIndex: 1000,
},

dropdownItem: {
  paddingVertical: 8,
},

dropdownText: {
  fontSize: 14,
  color: '#333',
}


});
