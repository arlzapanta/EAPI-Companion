import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Animated,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Dashboard from "./Dashboard";
import SettingsScreen from "./SettingsScreen";
import Schedules from "./Schedules";
import ActualCalls from "./ActualCalls";
import QuickCall from "./call/QuickCall";
import DoctorScreen from "./DoctorScreen";
import NavLinkComponent from "../components/NavLink";
import RBSheet from "react-native-raw-bottom-sheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { getStyleUtil } from "../utils/styleUtil";
import QuickCallBottomSheet from "./call/QuickCallBottomSheet";

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
  const refRBSheet = useRef<RBSheet>(null);
  const [selectedScreen, setSelectedScreen] = useState<
    | "dashboard"
    | "settings"
    | "schedules"
    | "actualcalls"
    | "quickcall"
    | "doctors"
  >("dashboard");
  const [fadeAnim] = useState(new Animated.Value(0));

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

  const openSheet = () => refRBSheet.current?.open();
  const closeSheet = () => refRBSheet.current?.close();

  return (
    <View style={dynamicStyles.homeContainer_home}>
      <View style={dynamicStyles.navContainer_home}>
        <NavLinkComponent
          iconName="house-circle-exclamation"
          onPress={() => setSelectedScreen("dashboard")}
          active={selectedScreen === "dashboard"}
        />
        <NavLinkComponent
          iconName="user-gear"
          onPress={() => setSelectedScreen("settings")}
          active={selectedScreen === "settings"}
        />
        <NavLinkComponent
          iconName="calendar-alt"
          onPress={() => setSelectedScreen("schedules")}
          active={selectedScreen === "schedules"}
        />

        <NavLinkComponent
          iconName="calendar-check"
          onPress={() => setSelectedScreen("actualcalls")}
          active={selectedScreen === "actualcalls"}
        />

        <NavLinkComponent
          iconName="user-doctor"
          onPress={() => setSelectedScreen("doctors")}
          active={selectedScreen === "doctors"}
        />

        <NavLinkComponent
          iconName="pen"
          onPress={() => setSelectedScreen("quickcall")}
          active={selectedScreen === "quickcall"}
        />
      </View>
      <ScrollView>{renderContent()}</ScrollView>
      <TouchableOpacity
        onLongPress={() => {
          setSelectedScreen("dashboard");
          openSheet();
        }}
        style={dynamicStyles.floatingButtonContainer}>
        <View style={dynamicStyles.floatingButton}>
          <MaterialIcons name="add-call" size={24} color="white" />
          <Text>(hold)</Text>
        </View>
      </TouchableOpacity>
      <RBSheet
        ref={refRBSheet}
        height={900}
        closeOnPressBack={true}
        draggable={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: "rgba(0, 0, 0, .5)",
          },
          draggableIcon: {
            backgroundColor: "#046E37",
          },
        }}
        customModalProps={{
          animationType: "slide",
          statusBarTranslucent: true,
        }}>
        <QuickCallBottomSheet closeSheet={closeSheet} />
      </RBSheet>
    </View>
  );
};
export default Home;
