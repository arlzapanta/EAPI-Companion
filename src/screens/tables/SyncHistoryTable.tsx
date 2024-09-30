import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Provider, Card, DataTable, Button, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { format, parseISO } from "date-fns";
import { dropLocalTablesDb } from "../../utils/localDbUtils";
import Icon from "react-native-vector-icons/Ionicons";

const SyncHistoryTable: React.FC<SyncHistoryTableProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true); // Added loading state
  const itemsPerPage = 8;

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Adjust the time as needed

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy EEEE");
  };

  const uniqueDates = Array.from(
    new Set(data.map((item) => formatDate(item.date)))
  );

  const filteredData = data.filter(
    (user) => !selectedDate || formatDate(user.date) === selectedDate
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

  return (
    <Provider>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#046E37" />
          </View>
        ) : (
          <>
            <View style={styles.rowContainer}>
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
                style={styles.clearButton}>
                Reset
              </Button>
            </View>
            <Card style={styles.card}>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title>Type</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                </DataTable.Header>
                {currentData.map((user) => (
                  <DataTable.Row style={styles.tableRow} key={user.id}>
                    <DataTable.Cell>
                      {user.type === 1 ? (
                        <>
                          <Text>Time in Sync</Text>
                          <Icon name="arrow-down" size={20} color="green" />
                        </>
                      ) : user.type === 2 ? (
                        <>
                          <Text>Time Out Sync</Text>
                          <Icon name="arrow-up" size={20} color="green" />
                        </>
                      ) : (
                        <Text>Mid Sync</Text>
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell>{formatDate(user.date)}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card>
            <View style={styles.paginationContainer}>
              <Button
                mode="outlined"
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={[
                  styles.paginationButton,
                  currentPage === 1 && styles.disabledButton,
                ]}>
                <Text
                  style={[
                    styles.paginationText,
                    currentPage === 1 && styles.disabledText,
                  ]}>
                  Previous
                </Text>
              </Button>
              <Text style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                mode="outlined"
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={[
                  styles.paginationButton,
                  currentPage === totalPages && styles.disabledButton,
                ]}>
                <Text
                  style={[
                    styles.paginationText,
                    currentPage === totalPages && styles.disabledText,
                  ]}>
                  Next
                </Text>
              </Button>
            </View>
          </>
        )}
        {loading && <View style={styles.overlay}></View>}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  pickerInitialLabel: {
    color: "lightgray",
  },
  pickerLabel: {
    color: "black",
  },
  picker: {
    width: Dimensions.get("window").width * 0.55,
    height: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  clearButton: {
    backgroundColor: "#046E37",
    marginLeft: 10,
    width: Dimensions.get("window").width * 0.2,
    borderRadius: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tableHeader: {
    backgroundColor: "#f9f9f9",
  },
  tableRow: {
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
    color: "#046E37",
  },
  disabledButton: {
    borderColor: "gray",
  },
  disabledText: {
    color: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: Dimensions.get("window").height * 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});

export default SyncHistoryTable;
