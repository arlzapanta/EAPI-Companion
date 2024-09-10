import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "../index";
import { getStyleUtil } from "../index";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../type/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { dropLocalTablesDb, insertDummyRecords } from "../utils/localDbUtils";

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const Settings = () => {
  const { onLogout } = useAuth();
  // const styles = getStyleUtil({});
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await onLogout();
            } catch (error) {
              Alert.alert(
                "Logout failed",
                "There was an error while logging out."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSyncSettingsOnPress = () => {
    navigation.navigate("Sync");
  };

  const handleAttendanceOnPress = () => {
    navigation.navigate("Attendance");
  };

  const dropLocalTables = async () => {
    // await insertDummyRecords();
    await dropLocalTablesDb();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSyncSettingsOnPress}>
          <Text style={styles.buttonText}>Sync History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAttendanceOnPress}>
          <Text style={styles.buttonText}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
          <Text style={styles.buttonTextLogout}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonTest} onPress={dropLocalTables}>
          <Text style={styles.buttonTextTest}>
            DROP ALL LOCAL DB TABLES (FOR TESTING ONLY)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingEnd: 20,
    paddingStart: 3,
    backgroundColor: "#F0F0F0",
  },
  card: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#046E37",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonLogout: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextLogout: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTest: {
    backgroundColor: "#ffc107",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextTest: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Settings;
