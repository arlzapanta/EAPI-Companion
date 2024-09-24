import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RefreshFetchDataProvider } from "./context/RefreshFetchDataContext";
import { RootStackParamList } from "./type/navigation";
import Home from "./screens/Home";
import Login from "./screens/Login";
import SyncSettingsScreen from "./screens/settings/SyncSettingsScreen";
import AttendanceScreen from "./screens/settings/AttendanceScreen";
import OnCallScreen from "./screens/call/OnCallScreen";

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
            <Stack.Screen
              name="OnCall"
              component={OnCallScreen}
              options={{ headerShown: false }}
            />
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
      <RefreshFetchDataProvider>
        <NavigationContainer>
          <Layout />
        </NavigationContainer>
      </RefreshFetchDataProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default App;
