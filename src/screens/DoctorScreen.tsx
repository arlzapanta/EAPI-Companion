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

const DoctorScreen = ({ doc }: { doc: DoctorRecord }) => {
  const { authState } = useAuth();
  const dynamicStyles = getStyleUtil({});
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
        user_type: "",
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
      const updatedDoctors = await getUpdatedDoctorRecordsLocalDb();
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
  };

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailRow}>
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
      <View key={doc.doctors_id} style={styles.callDetailsContainer}>
        <Text>{`Doctor: ${doc.first_name} ${doc.last_name}`}</Text>
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
                label={detail.label}
                value={detail.value}
              />
            )
        )}

        {notesNamesArray.map((noteName, index) => (
          <View key={`note-${noteName}-${index}`} style={styles.noteRow}>
            {editingIndex === index ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                />

                <TextInput
                  style={styles.input}
                  value={editValue}
                  onChangeText={setEditValue}
                />

                <TouchableOpacity onPress={() => handleSaveEdit(index)}>
                  <Ionicons name="checkmark-outline" size={24} color="green" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text>{`${noteName.trim()}: ${
                  notesValuesArray[index]?.trim() || "N/A"
                }`}</Text>

                <TouchableOpacity onPress={() => handleEdit(index)}>
                  <Ionicons name="pencil-outline" size={24} color="blue" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() =>
                showConfirmAlert(() => handleDelete(index), "delete this item")
              }>
              <Ionicons name="trash-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        <TextInput
          style={styles.input}
          placeholder="Enter Tag Name"
          value={tagName}
          onChangeText={setTagName}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Tag"
          value={tag}
          onChangeText={setTag}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
          <Ionicons name="save-outline" size={24} />
          <Text>Add</Text>
        </TouchableOpacity>
      </View>
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
                    style={styles.callItem}>
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
            {selectedDoctor ? (
              <DoctorDetails doc={selectedDoctor} />
            ) : (
              <NoDoctorSelected />
            )}
          </View>
        </View>
      </View>
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
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
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
  signImage: {
    marginVertical: 15,
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  removeButtonInline: {
    backgroundColor: "transparent",
    padding: 2,
    marginVertical: 5,
  },
  takePhotoButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    width: 200,
    alignItems: "center",
  },
  removeButtonText: {
    color: "red",
    fontWeight: "bold",
  },
  callItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 14,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
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
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#007bff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 20,
    right: 20,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 25,
    color: "#ffffff",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderColor: "#046E37",
    borderWidth: 1,
  },
  callDetailText: {
    fontSize: 16,
    color: "#343a40",
    marginBottom: 10,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  image: {
    width: 400,
    height: 260,
    marginTop: 10,
    resizeMode: "contain",
  },
  locationText: {
    marginTop: 10,
    fontSize: 9,
    color: "blue",
  },
  noteContainer: {
    marginTop: 20,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  noteInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  dropdownContainer: {
    width: 400,
    padding: 20,
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    padding: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addNotesBtn: {
    backgroundColor: "#046E37",
    color: "#fff",
    fontSize: 24,
    padding: 10,
    borderRadius: 25,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
