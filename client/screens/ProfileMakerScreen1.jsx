import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
// If using Expo, replace with: import { LinearGradient } from 'expo-linear-gradient';
import { LinearGradient } from "expo-linear-gradient";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig"; 

export default function SkillsToTeachScreen({ navigation }) {
  const predefinedSkills = [
    "3D Modelling", "Accounting", "AI", "App Development", "Chess",
    "Cinematography", "Content Writing", "Cooking", "Copywriting", "Cycling",
    "Data Analysis", "Data Science", "Digital Marketing", "Drawing", "Entrepreneurship",
    "Excel", "Film Making", "Finance", "Fitness Training", "Foreign Languages",
    "French", "Game Design", "Gardening", "German", "Graphic Design",
    "Guitar", "Horseback Riding", "Knitting", "Leadership", "Machine Learning",
    "Mandarin Chinese", "Music Production", "Networking", "Painting", "Piano",
    "PowerPoint", "Programming", "Project Management", "Public Speaking", "SEO",
    "Singing", "Social Media Marketing", "Spanish", "Sports", "Time Management",
    "UI/UX Design", "Video Editing", "Vocal Training", "Voice Acting", "Web Design",
    "Web Development", "Writing", "Yoga",
  ].sort();

  // Scale animations for subtle "pop" effect on press
  const scaleAnimations = useMemo(() => {
    return predefinedSkills.reduce((map, skill) => {
      map[skill] = new Animated.Value(1);
      return map;
    }, {});
  }, [predefinedSkills]);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const onNextPressed = async () => {
    try {
      // get the currently logged-in user ID
      const currentUser = FirebaseAuth.currentUser;  
      if (!currentUser) {
        Alert.alert("Error", "No user is logged in!");
        return;
      }
  
      // reference to the user’s doc in Firestore (assuming "users" collection)
      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
  
      // Save or merge the selected skills into that doc
      await setDoc(
        userDocRef, 
        { skillsToLearn: selectedSkills },  // field name in Firestore
        { merge: true }                     // merges instead of overwriting entire doc
      );
  
      // Then navigate or do any success action
      navigation.replace("HomeScreen");
    } catch (error) {
      console.error("Error saving skills to Firestore:", error);
      Alert.alert("Error", "Unable to save skills. Please try again.");
    }
  };
  const toggleSkill = (skill) => {
    // Subtle bounce animation on tap
    Animated.sequence([
      Animated.timing(scaleAnimations[skill], {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[skill], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Update the selected skills array
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <LinearGradient
      colors={["#eef2f3", "#8e9eab"]} // Subtle gradient background
      style={styles.gradientContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>What skills can you teach?</Text>
        <Text style={styles.subtitle}>Tap to select your skills</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollableList}>
        {predefinedSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          const animatedStyle = {
            transform: [{ scale: scaleAnimations[skill] }],
          };

          return (
            <Animated.View key={skill} style={animatedStyle}>
              <TouchableOpacity
                style={[
                  styles.skillBlock,
                  isSelected && styles.selectedSkillBlock,
                ]}
                onPress={() => toggleSkill(skill)}
                activeOpacity={0.9}
              >
                <Text
                  style={[
                    styles.skillText,
                    isSelected && styles.selectedSkillText,
                  ]}
                >
                  {skill}
                </Text>
                {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      <Pressable
  style={({ pressed }) => [
    styles.nextButton,
    pressed && { opacity: 0.85 },
  ]}
  onPress={onNextPressed} // <-- call the function above
>
  <Text style={styles.nextButtonText}>Next</Text>
</Pressable>
      </ScrollView> 

      
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    // Increase top padding here:
    paddingTop: 60,         // more space at the top
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2b3a67",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6e7d9b",
    textAlign: "center",
    marginBottom: 16,
  },
  scrollableList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 24,
  },
  skillBlock: {
    backgroundColor: "#ffffffcc",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#aaa",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    // Let the block auto-size by text length
    alignSelf: "flex-start",
  },
  selectedSkillBlock: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
    elevation: 5,
  },
  skillText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  selectedSkillText: {
    color: "#fff",
    fontWeight: "700",
  },
  selectedCheck: {
    position: "absolute",
    bottom: 0,
    right: 4,
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  nextButton: {
  
    marginRight:84,
    marginLeft:65,
    marginTop:30,

    bottom: 10,          // how far from bottom
    alignSelf: "center", // center horizontally
    backgroundColor: "#4caf50",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: "#444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  


  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});
