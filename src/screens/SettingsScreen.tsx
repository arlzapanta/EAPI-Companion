import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useAuth } from '../index';
import { getStyleUtil } from '../index'; // Update the path accordingly

const Settings = () => {
  const { onLogout } = useAuth();
  const styles = getStyleUtil({});

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await onLogout();
            } catch (error) {
              Alert.alert('Logout failed', 'There was an error while logging out.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container_settings}>
      <Text style={styles.title_settings}>Settings</Text>
      <TouchableOpacity style={styles.button_settings} onPress={handleLogout}>
        <Text style={styles.buttonText_settings}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;
