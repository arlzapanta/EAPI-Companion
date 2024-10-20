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
  ActivityIndicator,
} from "react-native";
import { useDataContext } from "../../context/DataContext";
import { getStyleUtil } from "../../utils/styleUtil";
import { getBase64StringFormat } from "../../utils/commonUtil";
const dynamicStyles = getStyleUtil({});

const CustomLoading = () => {
  return (
    <View style={styles.noImagesContainer}>
      <ActivityIndicator size="large" color="#046E37" />
      <Text style={styles.noImagesText}>
        Image is loading or the{" "}
        <Text style={dynamicStyles.mainTextRed}>image format is invalid</Text>.
        Please contact your DSM or admin for assistance.
      </Text>
    </View>
  );
};

const DetailerModal: React.FC<DetailerModalProps> = ({
  isVisible,
  onClose,
  detailerNumber,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { detailersRecord } = useDataContext();

  const handleImageLoad = (index: number) => {
    const updatedLoadingStates = [...loadingStates];
    updatedLoadingStates[index] = true;
    setLoadingStates(updatedLoadingStates);
  };

  useEffect(() => {
    if (isVisible) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      const fetchDetailers = async () => {
        const matchingDetailer = detailersRecord.find(
          (test) => test.category === detailerNumber.toString()
        );

        if (matchingDetailer) {
          const detailersArray = matchingDetailer.detailers.split(",");
          if (detailersArray.length === 0 || detailersArray[0] === "") {
            setImageUrls([]);
          } else {
            setImageUrls(detailersArray);
          }
        } else {
          setImageUrls([]);
        }
      };
      fetchDetailers();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, detailerNumber]);

  useEffect(() => {
    if (imageUrls.length > 0) {
      const initialStates = new Array(imageUrls.length).fill(true);
      setLoadingStates(initialStates);
    }
  }, [imageUrls]);

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
                  {loadingStates[index] && (
                    <View style={styles.imageContainer}>
                      <CustomLoading />
                    </View>
                  )}
                  <Image
                    source={{ uri: `${getBase64StringFormat()}${url}` }}
                    style={styles.fullImage}
                    onLoadStart={() => handleImageLoad(index)}
                    onLoad={() => handleImageLoad(index)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noImagesContainer}>
              <Text style={styles.noImagesText}>
                No images available. Please contact your DSM or admin for
                assistance.
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
    resizeMode: "stretch",
    position: "absolute",
  },
  shimmerPlaceholder: {
    width: width,
    height: height,
    borderRadius: 8,
  },
  circularShimmer: {
    height: 100,
    width: 100,
    borderRadius: 50, // Circular shimmer
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
    // backgroundColor: "#046E37",
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 10,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DetailerModal;
