import React from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import LottieView from "lottie-react-native";
import { getStyleUtil } from "../utils/styleUtil";
import * as Progress from "react-native-progress";
import { useDataContext } from "../context/DataContext";
export const useStyles = (theme: string) => {
  const { configData } = useDataContext();
  return getStyleUtil(configData);
};
const dynamicStyles = getStyleUtil([]);

const LoadingProgressBar: React.FC<LoadingSubProps> = ({ data }) => {
  return (
    <View style={[dynamicStyles.containerSubLoading]}>
      {data && (
        <>
          <Progress.Bar
            progress={data.progress}
            width={500}
            height={20}
            style={dynamicStyles.mainTextWhite}
            color={"#046E37"}
            borderColor="#046E37"
          />
          <Text style={dynamicStyles.mainColor}>{data.text}</Text>
        </>
      )}

      <LottieView
        source={require("../../assets/test.json")}
        autoPlay
        loop
        style={{ height: 400, width: 700 }}
      />
    </View>
  );
};

export default LoadingProgressBar;
