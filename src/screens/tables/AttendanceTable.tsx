import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Provider, Card, DataTable, Button, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { format, parseISO } from "date-fns";
import { AntDesign } from "@expo/vector-icons";
import { getStyleUtil } from "../../utils/styleUtil";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
const dynamicStyles = getStyleUtil({ theme: "light" });

const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const itemsPerPage = 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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
      <View style={dynamicStyles.subContainer}>
        {loading ? (
          <View style={dynamicStyles.loadingOverlay}>
            <ActivityIndicator size="large" color="#046E37" />
          </View>
        ) : (
          <>
            <View style={dynamicStyles.filterContainer}>
              <Picker
                selectedValue={selectedDate}
                onValueChange={(itemValue) => setSelectedDate(itemValue)}
                style={dynamicStyles.picker}>
                <Picker.Item
                  label="Select Date"
                  value=""
                  style={dynamicStyles.pickerInitialLabel}
                />
                {uniqueDates.map((date) => (
                  <Picker.Item
                    label={date}
                    value={date}
                    key={date}
                    style={dynamicStyles.pickerLabel}
                  />
                ))}
              </Picker>
              <Button
                mode="contained"
                onPress={clearDateSelection}
                style={dynamicStyles.resetButton}>
                Clear Filter
              </Button>
            </View>
            <Card style={dynamicStyles.tableCard}>
              <DataTable>
                <DataTable.Header style={dynamicStyles.tableHeader}>
                  <DataTable.Title>Type</DataTable.Title>
                  <DataTable.Title>Date Time</DataTable.Title>
                </DataTable.Header>
                {currentData.map((user) => (
                  <DataTable.Row style={dynamicStyles.tableRow} key={user.id}>
                    <DataTable.Cell>
                      {user.type === "in" ? "Time In" : "Time Out"}
                    </DataTable.Cell>
                    <DataTable.Cell>
                      {/* {formatDateTime(user.dateTime)} */}
                      {user.dateTime}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card>
            <View style={dynamicStyles.paginationContainer}>
              <Button
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={[
                  dynamicStyles.paginationButton,
                  currentPage === 1 && dynamicStyles.disabledButton,
                ]}>
                <AntDesign name="leftcircle" size={20} color="#046E37" />
              </Button>
              <Text style={dynamicStyles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={[
                  dynamicStyles.paginationButton,
                  currentPage === totalPages && dynamicStyles.disabledButton,
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

export default AttendanceTable;
