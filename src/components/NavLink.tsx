import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const NavLink: React.FC<NavLinkProps> = ({ iconName, onPress, active }) => {
  return (
    <TouchableOpacity
      style={[styles.navLink, active && styles.activeNavLink]}
      onPress={onPress}>
      <Icon
        name={iconName}
        style={[styles.navIcon, active && styles.activeNavIcon]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navLink: {
    backgroundColor: "#F0F0F0",
    padding: 13,
    borderRadius: 20,
    margin: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  activeNavLink: {
    backgroundColor: "rgba(4, 110, 55, 0.9)",
    shadowColor: "#046E37",
    shadowOpacity: 0.3,
    borderWidth: 3,
  },
  navIcon: {
    fontSize: 30,
    color: "lightgray",
  },
  activeNavIcon: {
    color: "#FFFFFF",
  },
});

export default NavLink;
