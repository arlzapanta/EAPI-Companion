import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  GestureResponderEvent,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../type/navigation";
import { RouteProp } from "@react-navigation/native";
type HomeScreenRouteProp = RouteProp<RootStackParamList, "Home">;
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";
import DetailerModal from "../modals/DetailerModal";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useDataContext } from "../../context/DataContext";
import {
  formatTimeHoursMinutes,
  getCurrentDatePH,
} from "../../utils/dateUtils";
import {
  savePreCallNotesLocalDb,
  savePostCallNotesLocalDb,
  getPreCallNotesLocalDb,
  getPostCallNotesLocalDb,
  getPreCallProdIdsLocalDb,
  savePreCallProdIdsLocalDb,
} from "../../utils/callComponentsUtil";
import { customToast } from "../../utils/customToast";
import { getActualCallsCount, uploadImage } from "../../utils/localDbUtils";
import { getStyleUtil } from "../../utils/styleUtil";
const dynamicStyles = getStyleUtil({ theme: "light" });

type OnCallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SharedCallScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const CallComponents: React.FC<CallComponentsProps> = ({
  scheduleId,
  docName,
  canStartCall,
}) => {
  const { productRecord } = useDataContext();
  const navigation = useNavigation<OnCallScreenNavigationProp>();
  const navigation1 = useNavigation<SharedCallScreenNavigationProp>();
  const [note, setNote] = useState<string>("");
  const [notes, setNotes] = useState<string[]>([]);
  const [prodIds, setProdIds] = useState<string[]>([]);

  const [selectedMood, setSelectedMood] = useState<string>("cold");
  const [feedback, setFeedback] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDetailer, setSelectedDetailer] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [callEndTimeValue, setCallEndTimeValue] = useState<Date | null>(null);
  const [base64Image, setBase64Image] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentDate, setCurrentDate] = useState<string>();

  const [coreProductVal, setCoreProductVal] = useState<
    ProductWoDetailsRecord | undefined[]
  >([]);
  const [secProductVal, setSecProductVal] = useState<
    ProductWoDetailsRecord | undefined[]
  >([]);
  const [remindProductVal, setRemindProductVal] = useState<
    ProductWoDetailsRecord | undefined[]
  >([]);

  const [selectedProduct1, setSelectedProduct1] =
    useState<ProductWoDetailsRecord | null>(null);
  const [selectedProduct2, setSelectedProduct2] =
    useState<ProductWoDetailsRecord | null>(null);
  const [selectedProduct3, setSelectedProduct3] =
    useState<ProductWoDetailsRecord | null>(null);

  useEffect(() => {
    const fetchPreCallNotes = async () => {
      const fetchedNotes = await getPreCallNotesLocalDb(scheduleId);
      setNotes(fetchedNotes.map((note) => note.notesArray).flat());
      setCurrentDate(await getCurrentDatePH());
    };

    const fetchPreCallProdIds = async () => {
      const fetchedProdIds = await getPreCallProdIdsLocalDb(scheduleId);
      setProdIds(fetchedProdIds.map((prodId) => prodId.prodIds).flat());
    };

    fetchPreCallNotes();
    fetchPreCallProdIds();
  }, [scheduleId]);

  useEffect(() => {
    if (prodIds.length > 0 && productRecord) {
      const selectedProducts = prodIds.slice(0, 3).map((prodId) => {
        const foundProduct = productRecord.find(
          (product) => product.id === prodId
        );
        return foundProduct || null;
      });
      setSelectedProduct1(selectedProducts[0]);
      setSelectedProduct2(selectedProducts[1]);
      setSelectedProduct3(selectedProducts[2]);
    } else {
      setSelectedProduct1(null);
      setSelectedProduct2(null);
      setSelectedProduct3(null);
    }
  }, [prodIds, productRecord]);

  const addNote = async () => {
    if (note.trim()) {
      setNotes([...notes, note]);
      setNote("");
    }
  };

  const removeNote = (index: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            const updatedNotes = notes.filter((_, i) => i !== index);
            setNotes(updatedNotes);
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    if (notes.length > 0) {
      savePreCallNotes();
    }
  }, [notes]);

  const savePreCallNotes = async () => {
    await savePreCallNotesLocalDb({ notesArray: notes, scheduleId });
  };

  const savePreCallProdIds = async () => {
    const prodIds: string[] = [];

    if (selectedProduct1) {
      prodIds.push(selectedProduct1.id);
    } else {
      prodIds.push("0");
    }
    if (selectedProduct2) {
      prodIds.push(selectedProduct2.id);
    } else {
      prodIds.push("0");
    }
    if (selectedProduct3) {
      prodIds.push(selectedProduct3.id);
    } else {
      prodIds.push("0");
    }

    setProdIds(prodIds);
    await savePreCallProdIdsLocalDb({ prodIds: prodIds, scheduleId });
  };

  const startTimer = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const executeStartCall = () => {
    const formatNewTime = formatTimeHoursMinutes(new Date());
    navigation.navigate("OnCall", {
      scheduleIdValue: scheduleId,
      notesArray: notes,
      prodIds: prodIds,
      docName,
    });
    startTimer();
  };

  const executeSharedCall = async () => {
    const checkActual = await getActualCallsCount();
    if (checkActual.length === 0) {
      Alert.alert(
        "No Previous Call Found",
        "Shared calls require a previous actual call with a photo of you and the doctor"
      );
      return;
    }

    navigation1.navigate("SharedCall", {
      scheduleIdValue: scheduleId,
      doctorsName: docName,
    });
  };

  const savePostCallNotes = async () => {
    await savePostCallNotesLocalDb({
      mood: selectedMood,
      feedback,
      scheduleId,
    });
  };

  const defaultDetailerNumber = 0;
  const openModal = (detailerNumber: number) => {
    setSelectedDetailer(detailerNumber);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDetailer(null);
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const imageUris = result.assets.map((asset) => asset.uri);
      const base64Images = await Promise.all(
        imageUris.map(async (uri) => {
          const manipulatedImage = await processImage(uri);
          return handleImageSelection(manipulatedImage.uri);
        })
      );
      setBase64Image(base64Images);
    }
  };

  const processImage = async (uri: string) => {
    const maxWidth = 1024;
    const maxHeight = 1024;

    const { width: originalWidth, height: originalHeight } =
      await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = Math.round((maxWidth / width) * height);
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = Math.round((maxHeight / height) * width);
      height = maxHeight;
    }

    const { uri: manipulatedUri } = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width, height } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    return { uri: manipulatedUri };
  };

  const handleImageSelection = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleUploadImages = async () => {
    if (base64Image.length > 0) {
      await uploadImage({
        base64Images: base64Image,
        category: "category3",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.startCallContainer}>
        {/* //TODO : ADD CONDITION SANDWICH OF DOCTORS NAME ABLE TO START CALL  */}
        {canStartCall && (
          <>
            <TouchableOpacity
              style={[styles.buttonStartCall, dynamicStyles.mainBgColor]}
              onPress={executeStartCall}>
              <Text style={styles.buttonTextSave}>START CALL</Text>
            </TouchableOpacity>
            <View style={[dynamicStyles.centerItems]}>
              <Text style={dynamicStyles.mainTextBig}>or</Text>
            </View>
            <TouchableOpacity
              style={[styles.buttonSharedCall, dynamicStyles.mainBgColor]}
              onPress={executeSharedCall}>
              <Text style={styles.buttonTextSave}>Set shared call</Text>
            </TouchableOpacity>
          </>
        )}
        {/* <TouchableOpacity
          style={styles.buttonStartCall}
          onPress={executeStartCall}>
          <Text style={styles.buttonTextSave}>START CALL</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
        </View>

        <View style={styles.noteInputContainer}>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Enter note"
            placeholderTextColor={styles.placeholder.color}
          />

          <TouchableOpacity onPress={addNote}>
            <Icon
              style={[styles.addNotesBtn, dynamicStyles.subBgColor]}
              name="add"
            />
          </TouchableOpacity>
        </View>

        {notes.map((item, index) => (
          <View key={index} style={styles.noteItem}>
            <Text
              style={styles.noteText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item}
            </Text>
            <TouchableOpacity onPress={() => removeNote(index)}>
              <Icon style={styles.removeText} name="close-circle-outline" />
            </TouchableOpacity>
          </View>
        ))}

        {/* {notes.length > 0 && (
          <TouchableOpacity
            style={styles.buttonSave}
            onPress={savePreCallNotes}>
            <Icon
              name="bookmark-outline"
              size={20}
              color="#fff"
              style={styles.iconSave}
            />
            <Text style={styles.buttonTextSave}>Save</Text>
          </TouchableOpacity>
        )} */}
      </View>

      <View style={styles.cardContainer}>
        <View
          style={[
            dynamicStyles.row,
            styles.headerContainer,
            { justifyContent: "space-between" },
          ]}>
          <Text style={styles.sectionTitle}>Set Detailers</Text>
          <TouchableOpacity onPress={savePreCallProdIds}>
            <Icon
              style={[styles.addNotesBtn, dynamicStyles.subBgColor]}
              name="save"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.detailerButtonsContainer}>
          <View>
            <Text style={dynamicStyles.mainText}>Core Product</Text>
            <Picker
              style={dynamicStyles.pickerProd}
              selectedValue={selectedProduct1}
              onValueChange={async (
                itemValue: ProductWoDetailsRecord | null | undefined
              ) => {
                if (
                  itemValue &&
                  itemValue.item_code !== selectedProduct1?.item_code
                ) {
                  setCoreProductVal(itemValue);
                  setSelectedProduct1(itemValue);
                }
              }}>
              <Picker.Item label="Select product" value="selectproduct1" />
              {productRecord
                .filter((prod) => prod.item_code !== null)
                .map((prod) => (
                  <Picker.Item
                    key={prod.id}
                    label={`${prod.item_code} - ${prod.item_description}`}
                    value={prod}
                  />
                ))}
            </Picker>
          </View>
          <View>
            <Text style={[dynamicStyles.mainText, { marginTop: 30 }]}>
              Secondary Product
            </Text>
            <Picker
              style={dynamicStyles.pickerProd}
              selectedValue={selectedProduct2}
              onValueChange={async (
                itemValue: ProductWoDetailsRecord | null | undefined
              ) => {
                if (
                  itemValue &&
                  itemValue.item_code !== selectedProduct2?.item_code
                ) {
                  setSecProductVal(itemValue);
                  setSelectedProduct2(itemValue);
                }
              }}>
              <Picker.Item label="Select product" value="selectproduct1" />
              {productRecord
                .filter((prod) => prod.item_code !== null)
                .map((prod) => (
                  <Picker.Item
                    key={prod.id}
                    label={`${prod.item_code} - ${prod.item_description}`}
                    value={prod}
                  />
                ))}
            </Picker>
          </View>
          <View>
            <Text style={[dynamicStyles.mainText, { marginTop: 30 }]}>
              Reminder
            </Text>
            <Picker
              style={dynamicStyles.pickerProd}
              selectedValue={selectedProduct3}
              onValueChange={async (
                itemValue: ProductWoDetailsRecord | null | undefined
              ) => {
                if (
                  itemValue &&
                  itemValue.item_code !== selectedProduct3?.item_code
                ) {
                  setRemindProductVal(itemValue);
                  setSelectedProduct3(itemValue);
                }
              }}>
              <Picker.Item label="Select product" value="selectproduct1" />
              {productRecord
                .filter((prod) => prod.item_code !== null)
                .map((prod) => (
                  <Picker.Item
                    key={prod.id}
                    label={`${prod.item_code} - ${prod.item_description}`}
                    value={prod}
                  />
                ))}
            </Picker>
          </View>
        </View>

        {modalVisible && selectedDetailer !== null && (
          <DetailerModal
            isVisible={modalVisible}
            detailerNumber={selectedDetailer}
            onClose={closeModal}
          />
        )}
      </View>
      {/* <Button
        title="select images (for testing only)"
        color="#FFA500"
        onPress={pickImages}
      />
      <Button
        title="Upload (for testing only)"
        color="#FFA500"
        onPress={handleUploadImages}
      /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  cardContainer: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  startCallContainer: {
    marginVertical: 10,
    backgroundColor: "transparent",
    borderRadius: 8,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.2,
    // shadowRadius: 8,
    // elevation: 5,
    // borderWidth: 1,
    // borderColor: "lightgray",
    marginBottom: 10,
  },
  headerContainer: {
    marginBottom: 15,
  },
  noteInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginRight: 10,
  },
  placeholder: {
    color: "#aaa",
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    flexShrink: 1,
    marginRight: 10,
  },
  removeText: {
    color: "#d9534f",
    fontSize: 20,
  },
  addNotesBtn: {
    backgroundColor: "#046E37",
    color: "#fff",
    fontSize: 16,
    padding: 10,
    borderRadius: 25,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  radioGroup: {
    flexDirection: "row",
    marginVertical: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  buttonSave: {
    marginTop: 10,
    backgroundColor: "#046E37",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonStartDetail: {
    marginTop: 10,
    backgroundColor: "#046E37",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonStartCall: {
    color: "white",
    padding: 30,
    elevation: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSharedCall: {
    color: "white",
    marginTop: 10,
    padding: 10,
    elevation: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextSave: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextStartDetail: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  iconSave: {
    marginRight: 10,
  },
  detailerButtonsContainer: {
    padding: 20,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  detailerButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailerButtonText: {
    fontSize: 16,
    color: "#046E37",
  },
  timerText: {
    fontSize: 18,
    color: "#333",
  },
  marginBottom: {
    marginBottom: 10,
  },
});

export default CallComponents;
