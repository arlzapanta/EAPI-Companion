import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated  } from 'react-native';
import {Dashboard, SettingsScreen, NavLinkComponent} from '../index';
import { getStyleUtil } from '../index';

// import { useNavigation } from '@react-navigation/native';
// import { RootStackParamList } from '../type/navigation';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Home = () => {
	const [selectedScreen, setSelectedScreen] = useState<'dashboard' | 'settings'>('dashboard');
	const [fadeAnim] = useState(new Animated.Value(1));

	const dynamicStyles = getStyleUtil({
	});

	const renderContent = () => {
		switch (selectedScreen) {
			case 'dashboard':
				return <Dashboard />;
			case 'settings':
				return <SettingsScreen />;
			default:
				return <Dashboard />;
		}
	};

	useEffect(() => {
		Animated.timing(fadeAnim, {
			toValue: .8, 
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
			onPress={() => setSelectedScreen('dashboard')}
			active={selectedScreen === 'dashboard'}
		/>
		<NavLinkComponent
			iconName="settings"
			onPress={() => setSelectedScreen('settings')}
			active={selectedScreen === 'settings'}
		/>
		</View>
		<Animated.View style={[dynamicStyles.contentContainer_home, { opacity: fadeAnim }]}>
		{renderContent()}
		</Animated.View>
	</View>
	);
};
export default Home;