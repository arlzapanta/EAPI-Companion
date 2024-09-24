// import "react-native-gesture-handler";
// import React from "react";
import { AppRegistry } from "react-native";
import App from "./App";
import appConfig from "../app.json";

AppRegistry.registerComponent(appConfig.expo.name, () => App);
