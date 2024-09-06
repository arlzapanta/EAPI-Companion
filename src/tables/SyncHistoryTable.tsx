import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Provider, Card, DataTable, Button, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { format, parseISO } from "date-fns";

interface SyncHistoryRecord {
  id: number;
  date: string;
  email: string;
  sales_portal_id: string;
  type: number;
}

interface SyncHistoryTableProps {
  data: SyncHistoryRecord[];
}

const SyncHistoryTable: React.FC<SyncHistoryTableProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Format the date in 'YYYY-MM-DD' format from the fetched data
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy EEEE");
  };

  // Extract unique dates from the data
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
      <View style={styles.mainbox}>
        <View style={styles.rowContainer}>
          <Picker
            selectedValue={selectedDate}
            onValueChange={(itemValue) => setSelectedDate(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Select Date" value="" />
            {uniqueDates.map((date) => (
              <Picker.Item label={date} value={date} key={date} />
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
                  {user.type === 1
                    ? "Morning Sync"
                    : user.type === 2
                    ? "Mid Sync"
                    : "Evening Sync"}
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
            style={styles.paginationButton}>
            Previous
          </Button>
          <Text style={styles.paginationText}>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            mode="outlined"
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={styles.paginationButton}>
            Next
          </Button>
        </View>
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
  picker: {
    width: Dimensions.get("window").width * 0.3,
    height: 30,
    backgroundColor: "lightgray",
  },
  clearButton: {
    marginLeft: 10,
    width: Dimensions.get("window").width * 0.1,
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
  },
});

export default SyncHistoryTable;
