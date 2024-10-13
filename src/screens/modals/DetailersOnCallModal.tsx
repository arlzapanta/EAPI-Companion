import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { createShimmerPlaceHolder } from "expo-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { fetchAllDetailers } from "../../utils/localDbUtils";
// todo : fix on detailers design and API
const ShimmerPlaceHolder = createShimmerPlaceHolder(LinearGradient);
interface DetailerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const DetailerModal: React.FC<DetailerModalProps> = ({
  isVisible,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState<number[]>([0, 0, 0]); // For tracking time spent per category
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    const start = Date.now();
    setTimer(
      setInterval(() => {
        const diff = Math.floor((Date.now() - start) / 1000);
        setTimeSpent((prev) => {
          const updated = [...prev];
          updated[categoryIndex] = diff;
          return updated;
        });
      }, 1000)
    );
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const handleImageLoad = (index: number) => {
    const updatedLoadingStates = [...loadingStates];
    updatedLoadingStates[index] = false;
    setLoadingStates(updatedLoadingStates);
  };

  const handleNextCategory = () => {
    stopTimer();
    if (categoryIndex < categories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
    } else {
      console.log("Time spent per category:", timeSpent);
      onClose();
    }
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
        const fetchedData = await fetchAllDetailers();
        const allCategories = fetchedData.map((record) => record.category);
        setCategories(allCategories);
        setImageUrls(fetchedData[0]?.images || []);
        setLoadingStates(Array(fetchedData[0]?.images.length || 0).fill(true));
        startTimer();
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

    return () => stopTimer(); // Clean up timer on unmount or close
  }, [isVisible]);

  useEffect(() => {
    // Change images when category changes
    const fetchImages = async () => {
      stopTimer();
      const fetchedData = await fetchAllDetailers();
      const images = fetchedData[categoryIndex]?.images || [];
      setImageUrls(images);
      setLoadingStates(Array(images.length).fill(true));
      startTimer();
    };

    if (isVisible && categories.length > 0) {
      fetchImages();
    }
  }, [categoryIndex]);

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
          <TouchableOpacity
            onPress={handleNextCategory}
            style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {categoryIndex < categories.length - 1 ? "Next" : "Finish"}
            </Text>
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
  nextButton: {
    backgroundColor: "#046E37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    position: "absolute",
    bottom: 60,
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DetailerModal;
