import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { getStyleUtil } from "../utils/styleUtil";
const dynamicStyles = getStyleUtil({});
const NavLink: React.FC<NavLinkProps> = ({ iconName, onPress, active }) => {
  return (
    <View
      style={[
        dynamicStyles.navLinkBox,
        active && dynamicStyles.navLinkBoxActive,
      ]}>
      <View
        style={[
          dynamicStyles.navLinkBoxTopDesign,
          active && dynamicStyles.navLinkBoxTopDesignActive,
        ]}></View>
      <TouchableOpacity
        style={[dynamicStyles.navLink, active && dynamicStyles.activeNavLink]}
        onPress={onPress}>
        <FontAwesome6
          name={iconName}
          style={[dynamicStyles.navIcon, active && dynamicStyles.activeNavIcon]}
        />
      </TouchableOpacity>
      <View
        style={[
          dynamicStyles.navLinkBoxBottomDesign,
          active && dynamicStyles.navLinkBoxBottomDesignActive,
        ]}></View>
    </View>
  );
};

export default NavLink;
