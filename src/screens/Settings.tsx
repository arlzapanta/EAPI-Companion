import { View, Text, Button, Alert } from 'react-native';
import React from 'react';
import { useAuth } from '../index';

const Settings = () => {
  const { onLogout } = useAuth();
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
    <View>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default Settings;
