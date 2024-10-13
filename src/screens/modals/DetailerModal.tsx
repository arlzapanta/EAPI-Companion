import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
  ScrollView,
  Dimensions,
  Button,
} from "react-native";
import { createShimmerPlaceHolder } from "expo-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { fetchDetailerImages } from "../../utils/localDbUtils";

// todo : fix on detailers design and API
const ShimmerPlaceHolder = createShimmerPlaceHolder(LinearGradient);

const DetailerModal: React.FC<DetailerModalProps> = ({
  isVisible,
  onClose,
  detailerNumber,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageLoad = (index: number) => {
    setTimeout(() => {
      const updatedLoadingStates = [...loadingStates];
      updatedLoadingStates[index] = false;
      setLoadingStates(updatedLoadingStates);
    }, 100);
  };

  useEffect(() => {
    if (isVisible) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      const fetchImages = async () => {
        const fetchedImages = await fetchDetailerImages(
          detailerNumber.toString()
        );
        setImageUrls(fetchedImages);
        setLoadingStates(Array(fetchedImages.length).fill(true));
      };

      fetchImages();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, detailerNumber]);

  return (
    <Modal
      transparent={false}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="fade">
      <View style={styles.modalBackground}>
        <Animated.View style={[styles.modalContainer]}>
          {imageUrls.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              contentContainerStyle={styles.imageGallery}>
              {imageUrls.map((url, index) => (
                <View key={index} style={styles.imageContainer}>
                  {loadingStates[index] ? (
                    <ShimmerPlaceHolder
                      visible={true}
                      style={styles.shimmerPlaceholder}
                    />
                  ) : null}
                  <Image
                    source={{ uri: url }}
                    style={styles.fullImage}
                    onLoadStart={() => handleImageLoad(index)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noImagesContainer}>
              <Text style={styles.noImagesText}>
                No images available. Please contact your DSM for further
                details.
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  imageGallery: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fullImage: {
    width: width,
    height: height,
    resizeMode: "cover",
    position: "absolute",
  },
  shimmerPlaceholder: {
    width: width,
    height: height,
    position: "absolute",
  },
  noImagesContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.8,
  },
  noImagesText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#046E37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    position: "absolute",
    bottom: 60, // Adjusted to fit above the upload button
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DetailerModal;
