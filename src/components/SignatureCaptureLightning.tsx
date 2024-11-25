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
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { formatTimeHoursMinutes } from "../utils/dateUtils";
import { customToast } from "../utils/customToast";
const dynamicStyle = getStyleUtil({});

const { width, height } = Dimensions.get("window");
const SignatureCaptureLightning: React.FC<SignatureCaptureProps> = ({
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
  const canvasHeight = 450;
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [callStartTime, setCallStartTime] = useState<string>("");
  const [callEndTime, setCallEndTime] = useState<string>("");
  const [duringScreenshot, setDuringScreenshot] = useState<boolean>(false);

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
    if (viewRef.current && paths.length != 0) {
      stopTimer();
      setIsSignatureLoading(true);
      setDuringScreenshot(true);
      try {
        const uri = await captureRef(viewRef.current, {
          format: "png",
          quality: 1.0,
          result: "base64",
        });
        const base64Signature = `${uri}`;
        setSignature(base64Signature);
        try {
          onSignatureUpdate(base64Signature, loc, attemptCount);
          setDuringScreenshot(false);
        } catch (error) {
          console.error("Error updating signature:", error);
        }
      } catch (error) {
        console.error("Error capturing the view:", error);
      }
    } else {
      customToast("No signature");
    }
  };

  return (
    <View>
      <View
        ref={viewRef}
        style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}
        {...panResponder.panHandlers}>
        {!duringScreenshot && (
          <View style={dynamicStyle.centerItems}>
            <Text style={dynamicStyle.mainTextBig}>Signature pad</Text>
            <TouchableOpacity
              style={[
                dynamicStyle.subBgColor,
                {
                  justifyContent: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  zIndex: 999,
                  borderRadius: 8,
                },
              ]}
              onPress={clearSignature}>
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

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
      <View style={[dynamicStyle.centerItems]}>
        <TouchableOpacity
          style={[
            styles.takePhotoButton,
            dynamicStyle.mainBgColor,
            dynamicStyle.rowItem,
            { justifyContent: "center" },
          ]}
          onPress={() => showConfirmAlert(captureSignature, "save quick call")}>
          <FontAwesome5 name="signature" size={30} color="white" />
          <Text style={[dynamicStyle.buttonText, { marginLeft: 10 }]}>
            Save Signature
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacitye
          style={dynamicStyle.buttonContainer1}
          onPress={() => showConfirmAlert(captureSignature, "save quick call")}>
          <Text style={dynamicStyle.buttonText}>Save Signature</Text>
        </TouchableOpacitye> */}
      </View>

      <View style={dynamicStyle.centerItems}>
        <Text style={dynamicStyle.textBlack}>OR</Text>
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
    marginBottom: 40,
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

export default SignatureCaptureLightning;
