import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Avatar, Checkbox } from 'react-native-paper';
import { FirebaseAuth, FirebaseFirestore } from "../../firebaseConfig";
import { launchImageLibrary } from 'react-native-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const predefinedSkills = [
    "Programming", "Graphic Design", "Cooking", "Public Speaking", "Photography",
    "Video Editing", "Writing", "Digital Marketing", "SEO", "Web Development",
    "UI/UX Design", "Painting", "Music Production", "Piano", "Guitar",
    "Yoga", "Fitness Training", "Data Analysis", "Machine Learning", "AI",
    "English", "French", "Spanish", "German", "Mandarin Chinese",
    "Excel", "PowerPoint", "Leadership", "Project Management", "Time Management",
    "Finance", "Accounting", "Entrepreneurship", "Chess", "Gardening",
    "Baking", "Sewing", "Animation", "Software Testing", "Cloud Computing",
    "Cybersecurity", "Interior Design", "Fashion Design", "Public Relations",
    "Legal Research", "Carpentry", "Event Planning", "Writing Resumes", "Translation",
    "Customer Service", "Meditation",
  ];

  const [name, setName] = useState("");
  const [selectedSkillsToTeach, setSelectedSkillsToTeach] = useState([]);
  const [selectedSkillsToLearn, setSelectedSkillsToLearn] = useState([]);
  const [availability, setAvailability] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  const currentUser = FirebaseAuth.currentUser;

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const userDocRef = doc(FirebaseFirestore, "users", currentUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setName(userData.name || currentUser.displayName || "");
            setProfileImage(userData.profileImage || null);
            setSelectedSkillsToTeach(userData.skillsToTeach || []);
            setSelectedSkillsToLearn(userData.skillsToLearn || []);
            setAvailability(userData.availability || "Not set");
          } else {
            console.log("No profile found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching profile: ", error);
        }
      }
    };

    fetchProfile();
  }, []);

  const toggleSkill = (skill, isTeachList) => {
    const selectedList = isTeachList ? selectedSkillsToTeach : selectedSkillsToLearn;
    const updateList = selectedList.includes(skill)
      ? selectedList.filter(s => s !== skill)
      : [...selectedList, skill];
    isTeachList ? setSelectedSkillsToTeach(updateList) : setSelectedSkillsToLearn(updateList);
  };

  const saveProfileData = async () => {
    if (!name || selectedSkillsToTeach.length === 0 || selectedSkillsToLearn.length === 0) {
      Alert.alert("Please fill in all required fields.");
      return;
    }

    const userData = {
      name,
      skillsToTeach: selectedSkillsToTeach,
      skillsToLearn: selectedSkillsToLearn,
      availability,
      profileImage,
    };

    try {
      if (currentUser) {
        const userDocRef = doc(FirebaseFirestore, "users", currentUser.uid);
        await setDoc(userDocRef, userData, { merge: true });
        Alert.alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile data: ", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const SkillSelection = ({ skills, selectedSkills, toggleSkill, label }) => (
    <View style={styles.skillsContainer}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <FlatList
        data={skills}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.skillItem}
            onPress={() => toggleSkill(item, label === "Skills to Teach")}
          >
            <Checkbox
              status={selectedSkills.includes(item) ? "checked" : "unchecked"}
              onPress={() => toggleSkill(item, label === "Skills to Teach")}
            />
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
        style={styles.skillsList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {profileImage ? (
          <Avatar.Image size={100} source={{ uri: profileImage }} />
        ) : (
          <Avatar.Text size={100} label={name ? name[0] : "U"} />
        )}
        <Button title="Change Profile Picture" onPress={() => launchImageLibrary()} />
      </View>

      <Text style={styles.sectionTitle}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
      />

      {/* Skills to Teach */}
      <SkillSelection
        skills={predefinedSkills}
        selectedSkills={selectedSkillsToTeach}
        toggleSkill={toggleSkill}
        label="Skills to Teach"
      />

      {/* Skills to Learn */}
      <SkillSelection
        skills={predefinedSkills}
        selectedSkills={selectedSkillsToLearn}
        toggleSkill={toggleSkill}
        label="Skills to Learn"
      />

      <Text style={styles.sectionTitle}>Availability</Text>
      <TextInput
        style={styles.input}
        value={availability}
        onChangeText={setAvailability}
        placeholder="E.g., Weekends, Evenings"
      />

      <Button title="Save Profile" onPress={saveProfileData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  skillsContainer: {
    marginBottom: 20,
  },
  skillsList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
});
