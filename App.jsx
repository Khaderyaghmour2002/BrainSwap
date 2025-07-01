import React from "react";
import { Provider } from "react-native-paper"; // Ensure `react-native-paper` is installed
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { theme } from "./client/core/theme";
import AppNavigator from "./client/navigation/AppNavigator"; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainStack"
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Main Navigation: Handles all nested routes */}
          <Stack.Screen name="MainStack" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
