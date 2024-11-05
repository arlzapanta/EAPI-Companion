// Login.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getStyleUtil } from "../utils/styleUtil";
import { API_URL_ENV, TOKEN_PASSWORD_ENV, TOKEN_USERNAME_ENV } from "@env";
import Ionicons from "react-native-vector-icons/Ionicons";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { onLogin } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
        Alert.alert("Login Error", result.msg);
      }
    } catch (error: any) {
      const result = await onLogin!(email, password);
      Alert.alert(
        "Login Error",
        `${API_URL_ENV} ${result} An error occurred during login. Please try again.`
        // `${TOKEN_USERNAME_ENV} ${TOKEN_PASSWORD_ENV} ${API_URL_ENV} ${result} An error occurred during login. Please try again.`
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

          <View style={styles.passwordContainer}>
            <TextInput
              style={dynamicStyles.inputPWicon}
              secureTextEntry={!isPasswordVisible}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.iconContainer}>
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>

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

const styles = StyleSheet.create({
  passwordContainer: {
    flexDirection: "row",
  },
  iconContainer: {
    position: "absolute",
    right: 15,
    top: 12,
    zIndex: 100,
  },
});
