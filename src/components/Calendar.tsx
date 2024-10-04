import React from "react";
import { View, Text, StyleSheet, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentDatePH } from "../utils/dateUtils";
import moment from "moment";

const { width } = Dimensions.get("window");
const numColumns = 7;
let currentMonth = 0;
let currentYear = 0;
let currentDate = "";

const CalendarComponent: React.FC<CalendarProps> = ({ data }) => {
  const fetchData = async () => {
    currentDate = await getCurrentDatePH();
    currentMonth = moment(currentDate).tz("Asia/Manila").month();
    currentYear = moment(currentDate).tz("Asia/Manila").year();
  };

  const getFirstDayOfMonth = (year: number, month: number): Date => {
    return new Date(year, month, 1);
  };

  const getLastDayOfMonth = (year: number, month: number): Date => {
    return new Date(year, month + 1, 0);
  };

  const createMonthArray = (): (number | null)[] => {
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const lastDay = getLastDayOfMonth(currentYear, currentMonth);
    const daysInMonth = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      daysInMonth.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      daysInMonth.push(day);
    }

    return daysInMonth;
  };

  const monthArray = createMonthArray();

  const renderDay = (day: number | null, index: number) => {
    if (!day) {
      return <View key={index} style={styles.emptyDay} />;
    }

    const dayString = day.toString();

    // Initialize flags for whether the day is included in any data array
    let isPlotDay = false;
    let isAdvanceDay = false;
    let isMakeupDay = false;
    let isActualDay = false;

    // Loop through each CalendarRecord in the data array
    data.forEach((record) => {
      if (record.plotData.includes(dayString)) isPlotDay = true;
      if (record.advanceData.includes(dayString)) isAdvanceDay = true;
      if (record.makeupData.includes(dayString)) isMakeupDay = true;
      if (record.actualData.includes(dayString)) isActualDay = true;
    });

    return (
      <View key={index} style={styles.dayContainer}>
        <Text style={styles.dayText}>{day}</Text>

        <View style={styles.logoContainer}>
          {isPlotDay && <Ionicons name="logo-react" size={14} color="green" />}
          {isAdvanceDay && (
            <Ionicons name="logo-react" size={14} color="purple" />
          )}
          {isMakeupDay && <Ionicons name="logo-react" size={14} color="red" />}
          {isActualDay && <Ionicons name="logo-react" size={14} color="gray" />}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.calendarContainer}>
      <FlatList
        data={monthArray}
        renderItem={({ item, index }) => renderDay(item, index)}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },
  dayContainer: {
    width: (width * 0.37) / numColumns,
    height: (width * 0.37) / numColumns,
    alignItems: "center",
    justifyContent: "flex-start",
    // borderWidth: 1,
    // borderColor: "#e0e0e0",
  },
  dayText: {
    fontSize: 14,
  },
  logo: {
    marginTop: 5,
  },
  emptyDay: {
    width: (width * 0.37) / numColumns,
    height: (width * 0.37) / numColumns,
    // borderWidth: 1,
    // borderColor: "#e0e0e0",
  },
  logoContainer: {
    flexDirection: "row", // Arrange logos in a horizontal line
    marginTop: 5,
  },
});

export default CalendarComponent;
