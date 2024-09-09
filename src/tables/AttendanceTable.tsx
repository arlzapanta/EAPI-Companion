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
import { dropLocalTablesDb } from "../utils/localDbUtils";

interface AttendanceRecord {
  id: number;
  date: string;
  email: string;
  sales_portal_id: string;
  type: string;
}

interface AttendanceTableProps {
  data: AttendanceRecord[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
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
    dropLocalTablesDb();
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
      <View style={styles.mainbox}>
        {loading ? (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#046E37" />
            </View>
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
            <Card>
              <DataTable>
                <DataTable.Header style={styles.databeHeader}>
                  <DataTable.Title>Type</DataTable.Title>
                  <DataTable.Title>Date</DataTable.Title>
                </DataTable.Header>
                {currentData.map((user) => (
                  <DataTable.Row style={styles.databeBox} key={user.id}>
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
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  mainbox: {
    margin: 15,
    flex: 1,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  pickerInitialLabel: {
    color: "lightgray",
  },
  pickerLabel: {
    color: "black",
  },
  picker: {
    width: Dimensions.get("window").width * 0.4,
    height: 30,
    backgroundColor: "#f9f9f9",
  },
  clearButton: {
    backgroundColor: "#046E37",
    marginLeft: 10,
    width: Dimensions.get("window").width * 0.2,
  },
  databeBox: {
    margin: 1,
    alignItems: "center",
  },
  databeHeader: {
    margin: 2,
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 2,
  },
  backButtonText: {
    fontSize: 16,
    color: "#046E37",
  },
});

export default AttendanceTable;
