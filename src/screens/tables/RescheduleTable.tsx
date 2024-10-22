import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Provider, Card, DataTable, Button, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { format, parseISO } from "date-fns";
import {
  deleteRescheduleReqLocalDb,
  dropLocalTablesDb,
} from "../../utils/localDbUtils";
import { getStatusText, showConfirmAlert } from "../../utils/commonUtil";
import { Ionicons } from "@expo/vector-icons";
import { customToast } from "../../utils/customToast";
import { AntDesign } from "@expo/vector-icons";

const RescheduleTable: React.FC<
  RescheduleTableProps & {
    onDelete: (id: string) => void;
    onCancel: (id: string) => void;
    onCancelUndo: (id: string, request_id: string) => void;
  }
> = ({ data, onDelete, onCancel, onCancelUndo }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy EEEE");
  };
  const formatShortDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "M/dd/yy");
  };

  const uniqueDates = Array.from(
    new Set(data.map((item) => formatDate(item.date_from)))
  );

  const filteredData = data.filter(
    (user) => !selectedDate || formatDate(user.date_from) === selectedDate
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearDateSelection = () => {
    setSelectedDate("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = (id: string) => {
    showConfirmAlert(() => {
      onDelete(id);
    }, "delete this request");
  };

  const handleCancel = (id: string) => {
    showConfirmAlert(() => {
      onCancel(id);
    }, "cancel this request");
  };

  const handleCancelUndo = (id: string, request_id: string) => {
    showConfirmAlert(() => {
      onCancelUndo(id, request_id);
    }, "Undo cancel request");
  };

  return (
    <Provider>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#046E37" />
          </View>
        ) : (
          <>
            <View style={styles.filterContainer}>
              <Picker
                selectedValue={selectedDate}
                onValueChange={(itemValue) => setSelectedDate(itemValue)}
                style={styles.picker}>
                <Picker.Item
                  label="Select Date"
                  value=""
                  style={styles.pickerInitialLabel}
                />
                {uniqueDates.map((date) => (
                  <Picker.Item
                    label={date}
                    value={date}
                    key={date}
                    style={styles.pickerLabel}
                  />
                ))}
              </Picker>
              <Button
                mode="contained"
                onPress={clearDateSelection}
                style={styles.resetButton}>
                Reset
              </Button>
            </View>
            <Card style={styles.card}>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={{ flex: 1.5 }}>
                    Doctor Name
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 1 }}>
                    Scheduled
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 1.5 }}>
                    Reschedule to
                  </DataTable.Title>
                  <DataTable.Title style={{ flex: 1 }}>Type</DataTable.Title>
                  <DataTable.Title style={{ flex: 1 }}>Status</DataTable.Title>
                  <DataTable.Title style={{ flex: 1 }}>Created</DataTable.Title>
                  <DataTable.Title style={{ flex: 0.5 }}>
                    Action
                  </DataTable.Title>
                </DataTable.Header>
                {currentData.map((data, index) => (
                  <DataTable.Row
                    style={styles.dataTableRow}
                    key={data.request_id ? data.request_id : `row-${index}`}>
                    <DataTable.Cell style={{ flex: 1.5 }}>
                      {data.full_name}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }}>
                      {formatShortDate(data.date_from)}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1.3 }}>
                      {formatShortDate(data.date_to)}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }}>
                      {data.type}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }}>
                      {getStatusText(data.status)}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }}>
                      {formatShortDate(data.created_at)}
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 0.5 }}>
                      {new Date(data.created_at).toDateString() ===
                      new Date().toDateString() ? (
                        <TouchableOpacity onPress={() => handleDelete(data.id)}>
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color="red"
                          />
                        </TouchableOpacity>
                      ) : (
                        <>
                          {data.status == "0" || data.status == "1" ? (
                            <TouchableOpacity
                              onPress={() => handleCancel(data.id)}>
                              <Ionicons name="close" size={24} color="red" />
                            </TouchableOpacity>
                          ) : (
                            <>
                              {data.status == "3" && (
                                <Ionicons
                                  name="cloud-done"
                                  size={24}
                                  color="lightgray"
                                />
                              )}

                              {data.status == "2" && (
                                <Ionicons
                                  name="cloud-done"
                                  size={24}
                                  color="lightgray"
                                />
                              )}

                              {data.status == "4" && (
                                <TouchableOpacity
                                  onPress={() =>
                                    handleCancelUndo(data.id, data.request_id)
                                  }>
                                  <Ionicons
                                    name="refresh"
                                    size={24}
                                    color="red"
                                  />
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card>
            <View style={styles.paginationContainer}>
              <Button
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={[
                  styles.paginationButton,
                  currentPage === 1 && styles.disabledButton,
                ]}>
                <AntDesign name="leftcircle" size={20} color="#046E37" />
              </Button>
              <Text style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={[
                  styles.paginationButton,
                  currentPage === totalPages && styles.disabledButton,
                ]}>
                <AntDesign name="rightcircle" size={20} color="#046E37" />
              </Button>
            </View>
          </>
        )}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  picker: {
    width: Dimensions.get("window").width * 0.25,
    height: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  pickerInitialLabel: {
    color: "lightgray",
  },
  pickerLabel: {
    color: "black",
  },
  deleteButton: {
    backgroundColor: "red",
  },
  resetButton: {
    backgroundColor: "#046E37",
    marginLeft: 10,
    width: Dimensions.get("window").width * 0.1,
    borderRadius: 5,
  },
  card: {
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  dataTableHeader: {
    backgroundColor: "#f9f9f9",
  },
  dataTableRow: {
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  paginationButton: {
    flex: 1,
    marginHorizontal: 5,
    borderColor: "#046E37",
  },
  paginationText: {
    flex: 2,
    textAlign: "center",
    color: "black",
  },
  disabledButton: {
    borderColor: "gray",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});

export default RescheduleTable;
