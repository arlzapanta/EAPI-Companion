// Login.tsx
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth, getStyleUtil } from '../index';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { onLogin } = useAuth();

  const dynamicStyles = getStyleUtil({
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and Password are required.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    try {
      const result = await onLogin!(email, password);
      if (result && result.error) {
        Alert.alert('Login Error', result.msg);
      }
    } catch (error) {
      Alert.alert('Login Error', 'An error occurred during login. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <TextInput
        value="Login"
        editable={false}
        style={dynamicStyles.title}
      />
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={dynamicStyles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={dynamicStyles.input}
        
      />
      <TouchableOpacity style={dynamicStyles.buttonContainer} onPress={handleLogin}>
        <Text style={dynamicStyles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
