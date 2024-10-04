// Login.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getStyleUtil } from "../utils/styleUtil";
import { API_URL_ENV, TOKEN_PASSWORD_ENV, TOKEN_USERNAME_ENV } from "@env";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { onLogin } = useAuth();

  const dynamicStyles = getStyleUtil({});

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      const result = await onLogin!(email, password);
      if (result && result.error) {
        Alert.alert("Login Error", result.msg, result.error);
      }
    } catch (error: any) {
      const result = await onLogin!(email, password);
      Alert.alert(
        "Login Error",
        `${TOKEN_USERNAME_ENV} ${TOKEN_PASSWORD_ENV} ${API_URL_ENV} ${result} An error occurred during login. Please try again.`
      );
      console.error(error);
    }
  };

  return (
    <View style={dynamicStyles.containerLogin}>
      <View style={dynamicStyles.cardLogin}>
        <View style={dynamicStyles.centerItems}>
          <TextInput
            value="EAPI - CMMS "
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
          <TouchableOpacity
            style={dynamicStyles.buttonContainer}
            onPress={handleLogin}>
            <Text style={dynamicStyles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Login;
