import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { doc, getDoc, query, collection, where, getDocs, addDoc } from "firebase/firestore";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";

export default function HomeTabContent() {
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [mutualMatches, setMutualMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [proposedSkill, setProposedSkill] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      console.log("▶ Fetching user data...");
      try {
        const currentUser = FirebaseAuth.currentUser;
        if (!currentUser) {
          console.warn("⚠ No user logged in");
          setLoading(false);
          return;
        }
        console.log("✅ Logged-in user UID:", currentUser.uid);

        const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          console.warn("⚠ User document does not exist");
          setLoading(false);
          return;
        }
        const userData = userDocSnap.data();
        console.log("✅ User data:", userData);

        setUserName(userData.firstName || "User");

        const myTeach = userData.skillsToTeach?.map(s => s.name) || [];
        const myLearn = userData.skillsToLearn || [];

        console.log("📝 My teach skills:", myTeach);
        console.log("📝 My learn skills:", myLearn);

        const connectionsQuery = query(
          collection(FirestoreDB, "connections"),
          where("users", "array-contains", currentUser.uid)
        );
        const connectionsSnap = await getDocs(connectionsQuery);

        const connectionIds = [];
        connectionsSnap.forEach(docSnap => {
          const users = docSnap.data().users;
          const otherUid = users.find(uid => uid !== currentUser.uid);
          if (otherUid) connectionIds.push(otherUid);
        });

        console.log("🔗 Connection UIDs:", connectionIds);

        const mutual = [];
        for (const connId of connectionIds) {
          console.log("📌 Checking connection:", connId);
          const connDocSnap = await getDoc(doc(FirestoreDB, "users", connId));
          if (!connDocSnap.exists()) {
            console.warn(`⚠ Connection user ${connId} not found`);
            continue;
          }
          const connData = connDocSnap.data();
          console.log(`✅ Data for ${connId}:`, connData);

          const connTeach = connData.skillsToTeach?.map(s => s.name) || [];
          const connLearn = connData.skillsToLearn || [];

          const teachesWhatILearn = connTeach.some(skill => myLearn.includes(skill));
          const wantsWhatITeach = connLearn.some(skill => myTeach.includes(skill));

          if (teachesWhatILearn && wantsWhatITeach) {
            mutual.push({
              id: connId,
              name: connData.firstName || "Unknown",
              teaches: connTeach.filter(skill => myLearn.includes(skill)),
              wants: connLearn.filter(skill => myTeach.includes(skill)),
            });
          }
        }

        console.log("🎯 Mutual matches found:", mutual);
        setMutualMatches(mutual);
      } catch (err) {
        console.error("❌ Error during fetchData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const submitProposal = async () => {
    console.log("▶ Submit proposal with values:", { proposedDate, proposedTime, proposedSkill, selectedMatch });

    if (!proposedDate || !proposedTime || !proposedSkill) {
      Alert.alert("Missing info", "Please fill all fields.");
      return;
    }

    try {
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      await addDoc(collection(FirestoreDB, "proposals"), {
        from: currentUser.uid,
        to: selectedMatch.id,
        date: proposedDate,
        time: proposedTime,
        skill: proposedSkill,
        createdAt: new Date(),
      });

      console.log("✅ Proposal saved to Firestore");
      Alert.alert("Proposal Sent", `Session proposed with ${selectedMatch.name}.`);
      setShowModal(false);
      setProposedDate("");
      setProposedTime("");
      setProposedSkill("");
    } catch (err) {
      console.error("❌ Error saving proposal:", err);
      Alert.alert("Error", "Failed to send proposal. Try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName}!</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mutual Skill Exchanges</Text>
        {mutualMatches.length === 0 ? (
          <Text>No mutual exchanges found yet.</Text>
        ) : (
          mutualMatches.map((m, i) => (
            <View key={i} style={styles.matchCard}>
              <Text>{m.name}</Text>
              <Text>They can teach: {m.teaches.join(", ")}</Text>
              <Text>They want: {m.wants.join(", ")}</Text>
              <TouchableOpacity onPress={() => {
                console.log("▶ Opening proposal modal for:", m);
                setSelectedMatch(m);
                setShowModal(true);
              }}>
                <Text style={{ color: "blue" }}>Propose Exchange</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Modal visible={showModal} transparent>
        <View style={styles.center}>
          <View style={styles.modal}>
            <Text>Propose to {selectedMatch?.name}</Text>
            <TextInput placeholder="Date" value={proposedDate} onChangeText={setProposedDate} style={styles.input}/>
            <TextInput placeholder="Time" value={proposedTime} onChangeText={setProposedTime} style={styles.input}/>
            <TextInput placeholder="Skill" value={proposedSkill} onChangeText={setProposedSkill} style={styles.input}/>
            <TouchableOpacity onPress={submitProposal}>
              <Text style={{ color: "green" }}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { alignItems: "center", marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: "bold" },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  matchCard: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginTop: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modal: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, marginTop: 8, borderRadius: 6 },
});
