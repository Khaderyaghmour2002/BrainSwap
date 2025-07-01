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

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#6a11cb" />
          </TouchableOpacity>

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
});
