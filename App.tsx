import React from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  UIManager,
  BackHandler,
  Alert,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { RefreshFetchDataProvider } from "./src/context/RefreshFetchDataContext";
import { RootStackParamList } from "./src/type/navigation";
import Home from "./src/screens/Home";
import Login from "./src/screens/Login";
import SyncSettingsScreen from "./src/screens/settings/SyncSettingsScreen";
import RescheduleScreen from "./src/screens/settings/RescheduleScreen";
import AttendanceScreen from "./src/screens/settings/AttendanceScreen";
import OnCallScreen from "./src/screens/call/OnCallScreen";
import SharedCallScreen from "./src/screens/call/SharedCallScreen";
import { DataProvider } from "./src/context/DataContext";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import * as NavigationBar from "expo-navigation-bar";

const Stack = createNativeStackNavigator<RootStackParamList>();

const Layout = () => {
  const { authState } = useAuth();
  const requestPermissions = async () => {
    try {
      // Request Camera Permission
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();

      // Request Location Permission
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (cameraStatus !== "granted" || locationStatus !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Camera and Location access are required to use this app.",
          [{ text: "Exit", onPress: () => BackHandler.exitApp() }]
        );
      }
    } catch (error) {
      console.error("Permission request failed:", error);
    }
  };
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  React.useEffect(() => {
    console.log("Layout initialized");
    NavigationBar.setBackgroundColorAsync("black");
    requestPermissions();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" backgroundColor="black" animated />

      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {authState.authenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Sync"
              component={SyncSettingsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Reschedule"
              component={RescheduleScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Attendance"
              component={AttendanceScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="OnCall"
              component={OnCallScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SharedCall"
              component={SharedCallScreen}
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
        <DataProvider>
          <NavigationContainer>
            <Layout />
          </NavigationContainer>
        </DataProvider>
      </RefreshFetchDataProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
