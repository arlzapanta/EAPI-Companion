import * as Location from 'expo-location';

export const getLocation = async (): Promise<any> => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, 
      timeInterval: 10000
    });
    // const { coords } = await Location.getCurrentPositionAsync({
    //   accuracy: Location.Accuracy.High, 
    //   timeInterval: 10000
    // });

    // return {
    //   latitude: coords.latitude,
    //   longitude: coords.longitude,
    // };
    return `${loc.coords.latitude},${loc.coords.longitude}`;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const getLocationAttendance = async (): Promise<any> => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
    
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, 
      timeInterval: 10000
    });

    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};
