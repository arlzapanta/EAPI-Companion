import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated, ScrollView } from "react-native";
import Dashboard from "./Dashboard";
import SettingsScreen from "./SettingsScreen";
import Schedules from "./Schedules";
import ActualCalls from "./ActualCalls";
import QuickCall from "./call/QuickCall";
import DoctorScreen from "./DoctorScreen";
import NavLinkComponent from "../components/NavLink";

import { getStyleUtil } from "../utils/styleUtil";

const defaultDoctor: DoctorRecord = {
  doctors_id: "",
  first_name: "",
  last_name: "",
  specialization: "",
  classification: "",
  birthday: "",
  address_1: "",
  address_2: "",
  municipality_city: "",
  province: "",
  phone_mobile: "",
  phone_office: "",
  phone_secretary: "",
  notes_names: "",
  notes_values: "",
  update_date: "",
};

const Home = () => {
  const [selectedScreen, setSelectedScreen] = useState<
    | "dashboard"
    | "settings"
    | "schedules"
    | "actualcalls"
    | "quickcall"
    | "doctors"
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
      case "quickcall":
        return <QuickCall />;
      case "doctors":
        return <DoctorScreen doc={defaultDoctor} />;
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
          iconName="calendar-clear"
          onPress={() => setSelectedScreen("schedules")}
          active={selectedScreen === "schedules"}
        />

        <NavLinkComponent
          iconName="calendar"
          onPress={() => setSelectedScreen("actualcalls")}
          active={selectedScreen === "actualcalls"}
        />

        <NavLinkComponent
          iconName="medkit"
          onPress={() => setSelectedScreen("doctors")}
          active={selectedScreen === "doctors"}
        />

        <NavLinkComponent
          iconName="flame"
          onPress={() => setSelectedScreen("quickcall")}
          active={selectedScreen === "quickcall"}
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
