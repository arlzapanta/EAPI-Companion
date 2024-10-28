import React, { useRef, useState, useEffect } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
  Text,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import Svg, { Path } from "react-native-svg";
import { getLocation } from "../utils/currentLocation";
import { updateCallPhoto, updateCallSignature } from "../utils/quickCallUtil";
import { getStyleUtil } from "../utils/styleUtil";
import Foundation from "@expo/vector-icons/Foundation";
import Loading from "./Loading";
import { getBase64StringFormat, showConfirmAlert } from "../utils/commonUtil";
import { useImagePicker } from "../hook/useImagePicker";
import Octicons from "@expo/vector-icons/Octicons";
import { formatTimeHoursMinutes } from "../utils/dateUtils";
const dynamicStyle = getStyleUtil({});

const { width, height } = Dimensions.get("window");
const SignatureCaptureDisplay: React.FC<SignatureCaptureProps> = ({
  callId,
  onSignatureUpdate,
}) => {
  const [isSignatureLoading, setIsSignatureLoading] = useState<boolean>(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>(
    []
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const viewRef = useRef<View>(null);
  const canvasWidth = width - 50;
  const canvasHeight = 300;
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [callStartTime, setCallStartTime] = useState<string>("");
  const [callEndTime, setCallEndTime] = useState<string>("");

  const [photoVal, setPhotoVal] = useState<string>("");

  const handlePhotoCaptured = async (
    base64: string,
    location: { latitude: number; longitude: number }
  ) => {
    try {
      const loc = await getLocation();
      setPhotoVal(base64);
      await updateCallPhoto(callId, base64, loc);
    } catch (error) {
      console.log("handlePhotoCaptured error", error);
    }
  };

  const { imageBase64, location, handleImagePicker } = useImagePicker({
    onPhotoCaptured: handlePhotoCaptured,
  });

  const startTimer = () => {
    setCallStartTime(formatTimeHoursMinutes(new Date()));
    const id = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    setCallEndTime(formatTimeHoursMinutes(new Date()));
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const SpacerW = ({ size }: { size: number }) => (
    <View style={{ width: size }} />
  );

  const SpacerH = ({ size }: { size: number }) => (
    <View style={{ height: size }} />
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Start a new path when the user touches the screen
        setPaths((prevPaths) => [...prevPaths, []]);
      },
      onPanResponderMove: (_, { moveX, moveY }) => {
        // Add the current point to the latest path
        setPaths((prevPaths) => {
          const updatedPaths = [...prevPaths];
          const currentPath = updatedPaths[updatedPaths.length - 1];
          updatedPaths[updatedPaths.length - 1] = [
            ...currentPath,
            { x: moveX, y: moveY },
          ];
          return updatedPaths;
        });
      },
      onPanResponderRelease: () => {
        // End of stroke, no further action needed for now
      },
    })
  ).current;

  const clearSignature = () => {
    setAttemptCount((prevCount) => prevCount + 1);
    setPaths([]);
    setSignature(null);
  };

  const createPathString = (path: Array<{ x: number; y: number }>) => {
    if (path.length < 2) return "";
    return path
      .map((point, index) => {
        return index === 0
          ? `M ${point.x} ${point.y}` // Move to the start
          : `L ${point.x} ${point.y}`; // Draw lines to the next point
      })
      .join(" ");
  };

  const captureSignature = async () => {
    const loc = await getLocation();
    stopTimer();
    if (viewRef.current) {
      setIsSignatureLoading(true);
      try {
        const uri = await captureRef(viewRef.current, {
          format: "png",
          quality: 1.0,
          result: "base64",
        });
        const base64Signature = `${uri}`;
        setSignature(base64Signature);
        try {
          if (callId !== 12340000) {
            await updateCallSignature(
              callId,
              uri,
              loc,
              attemptCount,
              callStartTime,
              callEndTime ? callEndTime : formatTimeHoursMinutes(new Date())
            );
          }
          onSignatureUpdate(base64Signature, loc, attemptCount);
        } catch (error) {
          console.error("Error updating signature:", error);
        }
      } catch (error) {
        console.error("Error capturing the view:", error);
      }
    } else {
      onSignatureUpdate("", loc, 0);
    }
  };

  return (
    <View>
      {!photoVal ? (
        <View
          ref={viewRef}
          style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}
          {...panResponder.panHandlers}>
          <Svg
            width={canvasWidth}
            height={canvasHeight}
            style={{ position: "absolute", top: 0, left: 0 }}>
            {paths.map((path, index) => (
              <Path
                key={index}
                d={createPathString(path)}
                stroke="black"
                strokeWidth="2"
                fill="none"
              />
            ))}
          </Svg>
        </View>
      ) : null}

      <View style={dynamicStyle.centerItems}>
        {!photoVal ? (
          <>
            <Text style={dynamicStyle.mainTextBig}>Signature pad</Text>
            <View style={dynamicStyle.centerItems}>
              <Text style={dynamicStyle.textBlack}>Or ..</Text>
            </View>
          </>
        ) : null}

        <View
          style={[
            styles.noteContainer,
            dynamicStyle.centerItems,
            { marginBottom: 10 },
            { marginTop: 5 },
          ]}>
          {!photoVal ? (
            <TouchableOpacity
              style={[styles.takePhotoButton, dynamicStyle.mainBgColor]}
              onPress={handleImagePicker}>
              <Octicons name="device-camera" size={30} color="white" />
              <Text style={dynamicStyle.buttonText}>Take a photo</Text>
            </TouchableOpacity>
          ) : (
            <View style={dynamicStyle.imageContainer}>
              <Text style={dynamicStyle.mainText}>Photo Capture</Text>
              <Image
                source={{ uri: `${getBase64StringFormat()}${photoVal}` }}
                style={dynamicStyle.image}
              />
            </View>
          )}
        </View>
        <SpacerH size={5} />
      </View>
      <View style={dynamicStyle.centerItems}>
        <View style={[dynamicStyle.trioBtnRow]}>
          {!photoVal ? (
            <TouchableOpacity
              style={[
                dynamicStyle.buttonContainer1,
                { marginEnd: 5 },
                dynamicStyle.subBgColor,
              ]}
              onPress={clearSignature}>
              <Text style={dynamicStyle.buttonText}>Clear Signature</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={dynamicStyle.buttonContainer1}
            onPress={() =>
              showConfirmAlert(captureSignature, "save quick call")
            }>
            <Text style={dynamicStyle.buttonText}>Save Quick Call</Text>
          </TouchableOpacity>
        </View>
        <SpacerH size={20} />
      </View>

      <Modal
        visible={signature !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSignature(null)}>
        <View style={styles.signatureModalContainer}>
          {signature && (
            <Image source={{ uri: signature }} style={styles.signatureImage} />
          )}
          <SpacerH size={30} />
          {isSignatureLoading ? <Loading /> : null}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    borderWidth: 1,
    marginBottom: 5,
    backgroundColor: "#FFF",
  },
  signatureImage: {
    width: width - 40,
    height: height / 4,
    borderWidth: 1,
    backgroundColor: "#FFF",
  },

  signatureModalContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
  },
  takePhotoButton: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    width: 300,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  noteContainer: {
    flexDirection: "row",
  },
  noteInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    maxWidth: 500,
    marginStart: 90,
  },
  updateButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default SignatureCaptureDisplay;
