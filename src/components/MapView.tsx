import React from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { StyleSheet, View } from "react-native";

const MapComponent: React.FC<MapProps> = ({
  latitude,
  longitude,
  containerStyle,
  mapStyle,
}) => {
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <MapView style={[styles.map, mapStyle]} initialRegion={initialRegion}>
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default MapComponent;
