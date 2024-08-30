import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getStyleUtil } from '../index';

const dynamicStyles = getStyleUtil({
});

interface NavLinkProps {
  iconName: string;
  onPress: () => void;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ iconName, onPress, active }) => {
  return (
    <TouchableOpacity 
      style={[dynamicStyles.navLink, active && dynamicStyles.activeNavLink]} 
      onPress={onPress}
    >
      <Icon name={iconName} style={[dynamicStyles.navIcon, active && dynamicStyles.activeNavIcon]} />
    </TouchableOpacity>
  );
};

export default NavLink;
