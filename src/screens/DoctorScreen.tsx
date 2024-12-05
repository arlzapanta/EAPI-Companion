import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import moment from "moment";
import { getCurrentDatePH } from "../utils/dateUtils";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoctorNotes,
  deleteDoctorNotes,
  getDoctorRecordsLocalDb,
  getUpdatedDoctorRecordsLocalDb,
  updateDoctorNotes,
} from "../utils/localDbUtils";

import { showConfirmAlert } from "../utils/commonUtil";
import { customToast } from "../utils/customToast";
import { getStyleUtil } from "../utils/styleUtil";
import Loading from "../components/Loading";
import { useDataContext } from "../context/DataContext";
import LoadingSub from "../components/LoadingSub";
export const useStyles = (theme: string) => {
  const { configData } = useDataContext();
  return getStyleUtil(configData);
};
const dynamicStyles = getStyleUtil([]);

const DoctorScreen = ({ doc }: { doc: DoctorRecord }) => {
  const { isDoctorLoading } = useDataContext();
  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  const [isInternalDoctorLoading, setIsInternalDoctorLoading] =
    useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const { authState } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [doctorList, setDoctorList] = useState<DoctorRecord[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecord | null>(
    null
  );
  const [userInfo, setUserInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    sales_portal_id: string;
    territory_id: string;
    territory_name: string;
    district_id: string;
    division: string;
    user_type: string;
    created_at: string;
    updated_at: string;
  } | null>(null);

  useEffect(() => {
    if (authState.authenticated && authState.user) {
      const {
        first_name,
        last_name,
        email,
        sales_portal_id,
        territory_id,
        user_type,
        division,
      } = authState.user;
      setUserInfo({
        first_name,
        last_name,
        email,
        sales_portal_id,
        territory_id,
        territory_name: "",
        district_id: "",
        division,
        user_type,
        created_at: "",
        updated_at: "",
      });
    }
  }, [authState]);

  const fetchDoctorData = async () => {
    try {
      const getDate = await getCurrentDatePH();
      setCurrentDate(moment(getDate).format("MMMM DD, dddd"));

      if (!userInfo) {
        console.log("User info is not available yet.");
        return;
      }

      const data = (await getDoctorRecordsLocalDb()) as DoctorRecord[];
      const mappedDoctors: DoctorRecord[] = data.map((doc) => ({
        ...doc,
        full_name: `${doc.first_name} ${doc.last_name}`,
      }));

      setDoctorList(mappedDoctors);
      // const updatedDoctors = await getUpdatedDoctorRecordsLocalDb();
    } catch (error) {
      console.log("fetchDoctorData error", error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchDoctorData();
    }
  }, [userInfo]);

  const handleCallClick = (doc: DoctorRecord) => {
    setSelectedDoctor(doc);
    setIsInternalDoctorLoading(true);
    setTimeout(() => setIsInternalDoctorLoading(false), 200);
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={dynamicStyles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  const DoctorDetails = ({ doc }: { doc: DoctorRecord }) => {
    const [notesNamesArray, setNotesNamesArray] = useState<string[]>(
      doc?.notes_names ? doc.notes_names.split(",") : []
    );
    const [notesValuesArray, setNotesValuesArray] = useState<string[]>(
      doc?.notes_values ? doc.notes_values.split(",") : []
    );

    const [tagName, setTagName] = useState<string>("");
    const [tag, setTag] = useState<string>("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editName, setEditName] = useState<string>("");
    const [editValue, setEditValue] = useState<string>("");

    const handleAdd = async () => {
      if (tagName && tag) {
        const updatedNames = [...notesNamesArray, tagName].join(",");
        const updatedValues = [...notesValuesArray, tag].join(",");
        setNotesNamesArray((prev) => [...prev, tagName]);
        setNotesValuesArray((prev) => [...prev, tag]);

        const doctorsNotes = {
          doctors_id: doc.doctors_id,
          notes_names: tagName,
          notes_values: tag,
        };

        const updateRecord = await addDoctorNotes(doctorsNotes);
        if (updateRecord) {
          customToast("Doctor notes updated!");
          setNotesNamesArray(updatedNames.split(","));
          setNotesValuesArray(updatedValues.split(","));
          setSelectedDoctor((prev) => ({
            ...doc,
            notes_names: updatedNames,
            notes_values: updatedValues,
          }));
          fetchDoctorData();
        }

        setTagName("");
        setTag("");
      }

      // console.log("Updated notes_names: ", [...notesNamesArray, tagName]);
      // console.log("Updated notes_values: ", [...notesValuesArray, tag]);
    };

    const handleDelete = async (index: number) => {
      const updatedNames = notesNamesArray
        .filter((_, i) => i !== index)
        .join(",");
      const updatedValues = notesValuesArray
        .filter((_, i) => i !== index)
        .join(",");

      const doctorsNotes = {
        doctors_id: doc.doctors_id,
        notes_names: updatedNames,
        notes_values: updatedValues,
      };

      const removeNotes = await deleteDoctorNotes(doctorsNotes);
      if (removeNotes) {
        customToast("Doctor notes updated!");
        setNotesNamesArray(updatedNames.split(","));
        setNotesValuesArray(updatedValues.split(","));
        setSelectedDoctor((prev) => ({
          ...doc,
          notes_names: updatedNames,
          notes_values: updatedValues,
        }));
        fetchDoctorData();
      }
    };

    const handleSaveEdit = async (index: number) => {
      const updatedNames = [...notesNamesArray];
      const updatedValues = [...notesValuesArray];
      updatedNames[index] = editName;
      updatedValues[index] = editValue;

      const doctorsNotes = {
        doctors_id: doc.doctors_id,
        notes_names: updatedNames.join(","),
        notes_values: updatedValues.join(","),
      };

      const updateRecord = await updateDoctorNotes(doctorsNotes);
      if (updateRecord) {
        customToast("Doctor notes updated!");
        setNotesNamesArray(updatedNames);
        setNotesValuesArray(updatedValues);
        setSelectedDoctor((prev) => ({
          ...doc,
          notes_names: doctorsNotes.notes_names,
          notes_values: doctorsNotes.notes_values,
        }));
        fetchDoctorData();
      }
    };

    const handleEdit = (index: number) => {
      setEditingIndex(index);
      setEditName(notesNamesArray[index]);
      setEditValue(notesValuesArray[index]);
    };

    return (
      <ScrollView>
        <View key={doc.doctors_id} style={styles.callDetailsContainer}>
          <Text style={[dynamicStyles.mainTextBig, dynamicStyles.textBlack]}>
            Doctor details and{" "}
            <Text
              style={[dynamicStyles.mainTextBig, dynamicStyles.textSubColor]}>
              Custom Notes
            </Text>
          </Text>
          <View style={[dynamicStyles.row, { marginTop: 10 }]}>
            <TextInput
              style={dynamicStyles.inputDoctors}
              placeholder="Enter Custom Note Name"
              value={tagName}
              onChangeText={setTagName}
            />
            <TextInput
              style={dynamicStyles.inputDoctors}
              placeholder="Enter Value"
              value={tag}
              onChangeText={setTag}
            />
            <TouchableOpacity
              style={dynamicStyles.buttonContainerDoctors}
              onPress={handleAdd}>
              <Ionicons name="add" size={16} style={dynamicStyles.textWhite} />
            </TouchableOpacity>
          </View>
          {notesNamesArray.map((noteName, index) => (
            <View key={`note-${noteName}-${index}`}>
              {editingIndex === index ? (
                <View style={dynamicStyles.rowItem}>
                  <TextInput
                    style={dynamicStyles.inputDoctors}
                    value={editName}
                    onChangeText={setEditName}
                  />

                  <TextInput
                    style={dynamicStyles.inputDoctors}
                    value={editValue}
                    onChangeText={setEditValue}
                  />

                  <TouchableOpacity onPress={() => handleSaveEdit(index)}>
                    <Ionicons
                      name="checkmark-outline"
                      size={50}
                      color="green"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={dynamicStyles.detailCustomRow}>
                    <Text style={styles.detailLabel}>
                      {`${noteName.trim()} : `}
                      <Text style={{ fontWeight: "400" }}>{`${notesValuesArray[
                        index
                      ]?.trim()}`}</Text>
                    </Text>
                    <Text style={styles.detailValue}>
                      <TouchableOpacity onPress={() => handleEdit(index)}>
                        <Ionicons
                          name="pencil-outline"
                          size={24}
                          style={dynamicStyles.mainColor}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          showConfirmAlert(
                            () => handleDelete(index),
                            "delete this item"
                          )
                        }>
                        <Ionicons name="trash-outline" size={24} color="red" />
                      </TouchableOpacity>
                    </Text>
                  </View>
                </>
              )}
            </View>
          ))}
          {[
            { label: "First Name", value: doc.first_name },
            { label: "Last Name", value: doc.last_name },
            { label: "Specialization", value: doc.specialization },
            { label: "Classification", value: doc.classification },
            { label: "Birthday", value: doc.birthday },
            { label: "Address 1", value: doc.address_1 },
            { label: "Address 2", value: doc.address_2 },
            { label: "City/Municipality", value: doc.municipality_city },
            { label: "Province", value: doc.province },
            { label: "Mobile Phone", value: doc.phone_mobile },
            { label: "Office Phone", value: doc.phone_office },
            { label: "Secretary Phone", value: doc.phone_secretary },
          ].map(
            (detail, index) =>
              detail.value && (
                <DetailRow
                  key={`detail-${detail.label}-${index}`}
                  label={`${detail.label}`}
                  value={detail.value}
                />
              )
          )}
        </View>
      </ScrollView>
    );
  };

  const NoDoctorSelected = () => (
    <View style={styles.containerNoCallData}>
      <Ionicons
        name="information-circle"
        size={24}
        color="#007BFF"
        style={styles.iconNoSched}
      />
      <Text style={styles.messageNoCallData}>
        Select a doctor to view profile
      </Text>
    </View>
  );

  return (
    <View style={dynamicStyles.container}>
      {(isDoctorLoading || timeOutLoading) && <LoadingSub />}
      {!isDoctorLoading && !timeOutLoading && (
        <View style={styles.row}>
          <View style={styles.column1}>
            <View style={dynamicStyles.card1Col}>
              <Text style={styles.columnTitle}>Doctors</Text>
              <Text style={styles.columnSubTitle}>{currentDate}</Text>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {doctorList.length > 0 ? (
                  doctorList.map((doc) => (
                    <TouchableOpacity
                      key={`${doc.doctors_id}`}
                      onPress={() => handleCallClick(doc)}
                      style={dynamicStyles.cardItems}>
                      <Text
                        style={
                          styles.callText
                        }>{`${doc.first_name} ${doc.last_name} - ${doc.specialization}`}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text>No doctors available</Text>
                )}
              </ScrollView>
            </View>
          </View>
          <View style={styles.column2}>
            <View style={dynamicStyles.card2Col}>
              {selectedDoctor && !isInternalDoctorLoading ? (
                <DoctorDetails doc={selectedDoctor} />
              ) : isInternalDoctorLoading ? (
                <LoadingSub />
              ) : (
                <NoDoctorSelected />
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DoctorScreen;

const styles = StyleSheet.create({
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  noteLabel: {
    flex: 1,
    fontWeight: "bold",
    color: "#343a40",
  },
  noteValue: {
    flex: 2,
    color: "#6c757d",
  },
  input: {
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    minWidth: 200,
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  column1: {
    width: "30%",
  },
  column2: {
    width: "70%",
  },
  columnTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
  },
  columnSubTitle: {
    fontSize: 16,
    color: "#6c757d",
  },
  callItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 1,
    marginVertical: 4,
  },
  callText: {
    fontSize: 16,
    color: "#343a40",
  },

  containerNoCallData: {
    flex: 1,
    alignItems: "center",
    padding: 50,
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    borderColor: "#046E37",
    borderWidth: 1,
  },
  messageNoCallData: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#046E37",
    textAlign: "center",
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  iconNoSched: {
    marginBottom: 10,
    color: "#046E37",
  },
  callDetailsContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    margin: 10,
    justifyContent: "flex-start",
    backgroundColor: "#e9ecef",
    borderColor: "#046E37",
    borderWidth: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343a40",
  },
  detailValue: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "400",
    textAlign: "right",
  },
});
