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
  const styles = getStyleUtil({});
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
    await insertDummyRecords();
    await dropLocalTablesDb();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.centerItems}>
          <Text style={styles.title_settings}>Settings</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSyncSettingsOnPress}>
            <Text style={styles.buttonText_settings}>Sync History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAttendanceOnPress}>
            <Text style={styles.buttonText_settings}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button_logout} onPress={handleLogout}>
            <Text style={styles.buttonText_settings}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button_logout}
            onPress={dropLocalTables}>
            <Text style={styles.buttonText_settings}>
              DROP ALL LOCAL DB TABLES (FORTESTINGONLY)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Settings;
