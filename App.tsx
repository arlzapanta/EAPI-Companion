import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Ensure you have this library installed
import Home from './src/screens/Home';
import Settings from './src/screens/Settings';
import Login from './src/screens/Login';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Settings: undefined;
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const HomeHeaderRight = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleGearIconPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <TouchableOpacity onPress={handleGearIconPress} style={{ marginRight: 10 }}>
      <Ionicons name="menu" size={30} color="#000" />
    </TouchableOpacity>
  );
};

const Layout = () => {
  const { authState, onLogout } = useAuth();

  return (
    <Stack.Navigator>
      {authState.authenticated ? (
        <>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              headerRight: () => (
                <HomeHeaderRight />
              ),
            }}
          />
          <Stack.Screen name="Settings" component={Settings} />
        </>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
