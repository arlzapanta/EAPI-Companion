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
import SpecialistTool from "./SpecialistTool";
import NavLinkComponent from "../components/NavLink";
import RBSheet from "react-native-raw-bottom-sheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { getStyleUtil } from "../utils/styleUtil";
import QuickCallBottomSheet from "./call/QuickCallBottomSheet";
import QuickCallLightning from "./call/LightningQuickCall";

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
  SecretaryPhone: "",
  OfficePhone: "",
  MobilePhone: "",
  City_Municipality: "",
};

const Home = () => {
  const refRBSheet = useRef<RBSheet>(null);
  const [selectedScreen, setSelectedScreen] = useState<
    | "dashboard"
    | "settings"
    | "schedules"
    | "actualcalls"
    | "quickcall"
    | "specialisttool"
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
      case "specialisttool":
        return <SpecialistTool doc={defaultDoctor} />;
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
          text={"Home"}
        />
        <NavLinkComponent
          iconName="user-gear"
          onPress={() => setSelectedScreen("settings")}
          active={selectedScreen === "settings"}
          text={"Account & Settings"}
        />
        <NavLinkComponent
          iconName="calendar-alt"
          onPress={() => setSelectedScreen("schedules")}
          active={selectedScreen === "schedules"}
          text={"Schedules"}
        />

        <NavLinkComponent
          iconName="calendar-check"
          onPress={() => setSelectedScreen("actualcalls")}
          active={selectedScreen === "actualcalls"}
          text={"Actual Calls"}
        />

        <NavLinkComponent
          iconName="hospital-user"
          onPress={() => setSelectedScreen("specialisttool")}
          active={selectedScreen === "specialisttool"}
          text={"Specialist Toolkit"}
        />

        <NavLinkComponent
          iconName="bolt-lightning"
          onPress={() => setSelectedScreen("quickcall")}
          active={selectedScreen === "quickcall"}
          text={"Quick Call"}
        />
      </View>
      <View style={dynamicStyles.components_container}>{renderContent()}</View>
      <TouchableOpacity
        onLongPress={() => {
          setSelectedScreen("dashboard");
          openSheet();
        }}
        style={dynamicStyles.floatingButtonContainer}>
        <View style={dynamicStyles.floatingButton}>
          {/* <MaterialIcons name="add-call" size={24} color="white" /> */}
          <MaterialCommunityIcons
            name="lightning-bolt-circle"
            size={24}
            color="white"
          />
          <Text style={dynamicStyles.textWhite}>QUICK CALL</Text>
          <Text style={dynamicStyles.textWhite}>[hold]</Text>
        </View>
      </TouchableOpacity>
      <RBSheet
        ref={refRBSheet}
        height={900}
        closeOnPressBack={true}
        // draggable={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: "rgba(0, 0, 0, .5)",
          },
          // draggableIcon: {
          //   backgroundColor: "#046E37",
          // },
        }}
        customModalProps={{
          animationType: "slide",
          statusBarTranslucent: true,
        }}>
        <QuickCallLightning closeSheet={closeSheet} />
      </RBSheet>
    </View>
  );
};
export default Home;
