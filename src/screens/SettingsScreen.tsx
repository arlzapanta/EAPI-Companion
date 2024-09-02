import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "../index";
import { getStyleUtil } from "../index";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../type/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

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

  const handleSyncSettings = () => {
    navigation.navigate("Sync");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.centerItems}>
          <Text style={styles.title_settings}>Settings</Text>
          <TouchableOpacity style={styles.button} onPress={handleSyncSettings}>
            <Text style={styles.buttonText_settings}>Sync Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button_logout} onPress={handleLogout}>
            <Text style={styles.buttonText_settings}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Settings;
