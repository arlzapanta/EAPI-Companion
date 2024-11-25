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
import { updateCallSignature } from "../utils/quickCallUtil";
import { getStyleUtil } from "../utils/styleUtil";
import Loading from "./Loading";
import { getBase64StringFormat, showConfirmAlert } from "../utils/commonUtil";
import { formatTimeHoursMinutes } from "../utils/dateUtils";
import { customToast } from "../utils/customToast";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
const dynamicStyle = getStyleUtil({});

const { width, height } = Dimensions.get("window");
const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  callId,
  onSignatureUpdate,
}) => {
  const [duringScreenshot, setDuringScreenshot] = useState<boolean>(false);
  const [isSignatureLoading, setIsSignatureLoading] = useState<boolean>(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>(
    []
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const viewRef = useRef<View>(null);
  const canvasWidth = width - 40;
  const canvasHeight = 600;
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [callStartTime, setCallStartTime] = useState<string>("");
  const [callEndTime, setCallEndTime] = useState<string>("");

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
    setDuringScreenshot(true);
    if (viewRef.current && paths.length > 0) {
      stopTimer();
      setIsSignatureLoading(true);
      try {
        const uri = await captureRef(viewRef.current, {
          format: "png",
          quality: 1.0,
          result: "base64",
        });
        const base64Signature = `${uri}`;
        setSignature(base64Signature);

        const loc = await getLocation();
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
          setDuringScreenshot(false);
        } catch (error) {
          console.error("Error updating signature:", error);
        }
      } catch (error) {
        console.error("Error capturing the view:", error);
      }
    } else {
      customToast("Please sign first");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          dynamicStyle.buttonContainer,
          dynamicStyle.mainBgColor,
          dynamicStyle.rowItem,
          { justifyContent: "center" },
        ]}
        onPress={() => setIsModalVisible(true)}>
        <FontAwesome5 name="signature" size={30} color="white" />
        <Text style={[dynamicStyle.buttonText, { marginLeft: 10 }]}>
          Open Signature Pad
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View
            ref={viewRef}
            style={[
              styles.canvas,
              { width: canvasWidth, height: canvasHeight },
            ]}
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
          <View style={[dynamicStyle.trioRow]}>
            <TouchableOpacity
              style={[
                dynamicStyle.buttonContainer1,
                dynamicStyle.mainBgColor,
                dynamicStyle.rowItem,
                { justifyContent: "center" },
              ]}
              onPress={() =>
                showConfirmAlert(captureSignature, "Signature save")
              }>
              <FontAwesome5 name="signature" size={30} color="white" />
              <Text style={[dynamicStyle.buttonText, { marginLeft: 10 }]}>
                Save Signature
              </Text>
            </TouchableOpacity>

            <View
              style={[
                dynamicStyle.rowItem,
                { position: "absolute", bottom: -70, left: -20 },
              ]}>
              <TouchableOpacity
                style={dynamicStyle.buttonCancelContainer}
                onPress={() => setIsModalVisible(false)}>
                <Text style={dynamicStyle.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  container: {
    padding: 20,
  },
  buttonContainer1: {
    backgroundColor: "#046E37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 5,
    maxWidth: 200,
    minWidth: 200,
    marginBottom: 2,
    alignItems: "center",
  },
  buttonText1: {
    color: "#FFF",
    fontWeight: "bold",
    alignSelf: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255,1)",
    padding: 20,
  },
  canvas: {
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  signatureImage: {
    width: width - 40,
    height: height / 4,
    borderWidth: 1,
    backgroundColor: "#FFF",
  },
  clearButton: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FF5722",
    padding: 10,
    borderRadius: 5,
  },
  saveButton: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 5,
  },
  signatureModalContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: "#046E37",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 5,
    elevation: 5,
  },
});

export default SignatureCapture;
