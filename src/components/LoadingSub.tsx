import React from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";
import { getStyleUtil } from "../utils/styleUtil";
const dynamicStyles = getStyleUtil({});

const Loading = () => (
  <View style={[dynamicStyles.containerSubLoading]}>
    <LottieView
      source={require("../../assets/test.json")}
      autoPlay
      loop
      style={{ height: 500, width: 900 }}
    />
  </View>
);

export default Loading;
