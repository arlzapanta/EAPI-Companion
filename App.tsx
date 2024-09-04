import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { RootStackParamList } from "./src/type/navigation";
import Home from "./src/screens/Home";
import Login from "./src/screens/Login";
import SyncSettingsScreen from "./src/screens/settings/SyncSettingsScreen";
import AttendanceScreen from "./src/screens/settings/AttendanceScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const Layout = () => {
  const { authState } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {authState.authenticated ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Sync" component={SyncSettingsScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: "transparent",
  },
});

export default App;
