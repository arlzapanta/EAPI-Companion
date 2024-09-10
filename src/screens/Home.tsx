import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import {
  Dashboard,
  SettingsScreen,
  NavLinkComponent,
  Schedules,
  ActualCalls,
} from "../index";
import { getStyleUtil } from "../index";

const Home = () => {
  const [selectedScreen, setSelectedScreen] = useState<
    "dashboard" | "settings" | "schedules" | "actualcalls"
  >("dashboard");
  const [fadeAnim] = useState(new Animated.Value(1));

  const dynamicStyles = getStyleUtil({});

  const renderContent = () => {
    switch (selectedScreen) {
      case "dashboard":
        return <Dashboard />;
      case "schedules":
        return <Schedules />;
      case "settings":
        return <SettingsScreen />;
      case "actualcalls":
        return <ActualCalls />;
      default:
        return <Dashboard />;
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedScreen]);

  return (
    <View style={dynamicStyles.homeContainer_home}>
      <View style={dynamicStyles.navContainer_home}>
        <NavLinkComponent
          iconName="home"
          onPress={() => setSelectedScreen("dashboard")}
          active={selectedScreen === "dashboard"}
        />
        <NavLinkComponent
          iconName="settings"
          onPress={() => setSelectedScreen("settings")}
          active={selectedScreen === "settings"}
        />
        <NavLinkComponent
          iconName="calendar"
          onPress={() => setSelectedScreen("schedules")}
          active={selectedScreen === "schedules"}
        />

        <NavLinkComponent
          iconName="list"
          onPress={() => setSelectedScreen("actualcalls")}
          active={selectedScreen === "actualcalls"}
        />
      </View>
      <Animated.View
        style={[dynamicStyles.contentContainer_home, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {renderContent()}
        </ScrollView>
      </Animated.View>
    </View>
  );
};
export default Home;
