import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Provider, Card, DataTable, Button, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { format, parseISO } from "date-fns";
import { AntDesign } from "@expo/vector-icons";

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

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
                  <DataTable.Title>Type</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                </DataTable.Header>
                {currentData.map((user) => (
                  <DataTable.Row style={styles.dataTableRow} key={user.id}>
                    <DataTable.Cell>
                      {user.type === "in" ? "Time In" : "Time Out"}
                    </DataTable.Cell>
                    <DataTable.Cell>{formatDate(user.date)}</DataTable.Cell>
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
    width: Dimensions.get("window").width * 0.55,
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
  resetButton: {
    backgroundColor: "#046E37",
    marginLeft: 10,
    width: Dimensions.get("window").width * 0.2,
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
    marginTop: 15,
  },
  paginationButton: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
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

export default AttendanceTable;
