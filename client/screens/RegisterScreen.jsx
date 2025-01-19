import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text } from "react-native-paper";

import Background from "../components/Layout/Background";
import Logo from "../components/Branding/Logo";
import Header from "../components/Layout/Header";
import Button from "../components/UI/Button";
import TextInput from "../components/UI/TextInput";
import BackButton from "../components/Navigation/BackButton";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { nameValidator } from "../helpers/nameValidator";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig"; // Import FirestoreDB
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Firestore imports

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState({ value: "", error: "" });
  const [familyName, setFamilyName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });

  const onSignUpPressed = async () => {
    const firstNameError = nameValidator(firstName.value);
    const familyNameError = nameValidator(familyName.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
  
    if (firstNameError || familyNameError || emailError || passwordError) {
      setFirstName({ ...firstName, error: firstNameError });
      setFamilyName({ ...familyName, error: familyNameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(
        FirebaseAuth,
        email.value,
        password.value
      );
      const user = userCredential.user;
  
      
      await updateProfile(user, {
        displayName: `${firstName.value} ${familyName.value}`,
      });
  
      const userDocRef = doc(FirestoreDB, "users", user.uid); 
      await setDoc(userDocRef, {
        firstName: firstName.value,
        familyName: familyName.value,
        email: email.value
            });
  
      navigation.reset({
        index: 0,
        routes: [{ name: "PhotoUploadScreen" }],
      });
    } catch (error) {
     
      Alert.alert("Registration Failed", error.message);
    }
  };
  

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome</Header>
      <TextInput
        label="First Name"
        returnKeyType="next"
        value={firstName.value}
        onChangeText={(text) => setFirstName({ value: text, error: "" })}
        error={!!firstName.error}
        errorText={firstName.error}
      />
      <TextInput
        label="Family Name"
        returnKeyType="next"
        value={familyName.value}
        onChangeText={(text) => setFamilyName({ value: text, error: "" })}
        error={!!familyName.error}
        errorText={familyName.error}
      />
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24 }}
      >
        Create Account
      </Button>
      <View style={styles.row}>
        <Text>I already have an account!</Text>
        <TouchableOpacity onPress={() => navigation.replace("LocationPickerScreen")}>
          <Text style={styles.link}> Log in</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
