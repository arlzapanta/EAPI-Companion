import React, { useRef, useState } from "react";
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

const { width, height } = Dimensions.get("window");

const SignatureCapture: React.FC = () => {
  const [signature, setSignature] = useState<string | null>(null);
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>(
    []
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const viewRef = useRef<View>(null);
  const canvasWidth = width - 40;
  const canvasHeight = 300;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
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
    if (viewRef.current) {
      try {
        const uri = await captureRef(viewRef.current, {
          format: "png",
          quality: 1.0,
        });
        setSignature(uri);
        setIsSignatureModalVisible(true);
      } catch (error) {
        console.error("Error capturing the view:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.openModalButton}
        onPress={() => setIsModalVisible(true)}>
        <Text style={styles.buttonText}>Open Signature Modal</Text>
      </TouchableOpacity>

      {/* Signature Drawing Modal */}
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
            <Svg
              width={canvasWidth}
              height={canvasHeight}
              style={{ position: "absolute", top: 0, left: 0 }}>
              {/* Draw each stroke as a separate Path */}
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

          {/* Clear and Capture buttons */}
          <TouchableOpacity style={styles.clearButton} onPress={clearSignature}>
            <Text style={styles.buttonText}>Clear Signature</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={captureSignature}>
            <Text style={styles.buttonText}>Capture Signature</Text>
          </TouchableOpacity>

          {/* Close Modal Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Captured Signature Preview Modal */}
      <Modal
        visible={isSignatureModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSignatureModalVisible(false)}>
        <View style={styles.signatureModalContainer}>
          {signature && (
            <Image source={{ uri: signature }} style={styles.signatureImage} />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsSignatureModalVisible(false)}>
            <Text style={styles.buttonText}>Close Signature</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  openModalButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
  },
  canvas: {
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  signatureImage: {
    width: width - 40,
    height: height / 4,
    borderWidth: 1,
    borderColor: "#000",
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
});

export default SignatureCapture;
