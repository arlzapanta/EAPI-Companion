import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { RefreshFetchDataProvider } from "./src/context/RefreshFetchDataContext";
import { RootStackParamList } from "./src/type/navigation";
import Home from "./src/screens/Home";
import Login from "./src/screens/Login";
import SyncSettingsScreen from "./src/screens/settings/SyncSettingsScreen";
import RescheduleScreen from "./src/screens/RescheduleScreen";
import AttendanceScreen from "./src/screens/settings/AttendanceScreen";
import OnCallScreen from "./src/screens/call/OnCallScreen";
import { DataProvider } from "./src/context/DataContext";

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
            <Stack.Screen name="Reschedule" component={RescheduleScreen} />
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
    backgroundColor: "#046E37",
  },
});

export default App;
