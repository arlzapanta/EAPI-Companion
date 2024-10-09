import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentDatePH } from "../utils/dateUtils";
import moment from "moment";

const { width } = Dimensions.get("window");
const numColumns = 7;
let currentMonth = 0;
let currentYear = 0;
let currentDate = "";
const mainColor = "#046E37";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CalendarComponent: React.FC<CalendarProps> = ({ data }) => {
  const [monthArray, setMonthArray] = useState<(number | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      currentDate = await getCurrentDatePH();
      currentMonth = moment(currentDate).tz("Asia/Manila").month();
      currentYear = moment(currentDate).tz("Asia/Manila").year();
      setMonthArray(createMonthArray());
    };

    fetchData();
  }, []);

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

    let firstDayIndex = firstDay.getDay();

    for (let i = 0; i < firstDayIndex; i++) {
      daysInMonth.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      daysInMonth.push(day);
    }

    while (daysInMonth.length % numColumns !== 0) {
      daysInMonth.push(null);
    }

    return daysInMonth;
  };

  const renderDay = (day: number | null, index: number) => {
    const isLastColumn = (index + 1) % numColumns === 0;
    const isFirstColumn = index % numColumns === 0;
    const isLastRow = index >= monthArray.length - numColumns;
    const isFirstRow = index < numColumns;
    const isSunday = index % numColumns === 0;
    const isSaturday = (index + 1) % numColumns === 0;

    const borderStyles = [
      isFirstColumn ? styles.leftBorder : null,
      isLastColumn ? styles.rightBorder : null,
      isLastRow ? styles.bottomBorder : null,
      isFirstRow ? styles.topBorder : null,
    ];

    if (!day) {
      return (
        <View
          key={index}
          style={[
            styles.dayContainer,
            ...borderStyles, // Apply the border styles conditionally
          ]}
        />
      );
    }

    const dayString = day.toString();

    let isPlotDay = false;
    let isAdvanceDay = false;
    let isMakeupDay = false;
    let isActualDay = false;

    data.forEach((record) => {
      if (record.plotData.includes(dayString)) isPlotDay = true;
      if (record.advanceData.includes(dayString)) isAdvanceDay = true;
      if (record.makeupData.includes(dayString)) isMakeupDay = true;
      if (record.actualData.includes(dayString)) isActualDay = true;
    });

    return (
      <View
        key={index}
        style={[
          styles.dayContainer,
          ...borderStyles, // Apply the border styles conditionally
        ]}>
        <Text
          style={[
            styles.dayText,
            isSunday || isSaturday ? styles.weekendText : null,
          ]}>
          {day}
        </Text>
        <View style={styles.logoContainer}>
          {isPlotDay && (
            <Ionicons
              style={styles.logoLegend}
              name="square"
              size={22}
              color="green"
            />
          )}
          {isAdvanceDay && (
            <Ionicons
              style={styles.logoLegend}
              name="square"
              size={22}
              color="purple"
            />
          )}
          {isMakeupDay && (
            <Ionicons
              style={styles.logoLegend}
              name="square"
              size={22}
              color="red"
            />
          )}
          {isActualDay && (
            <Ionicons
              style={styles.logoLegend}
              name="square"
              size={22}
              color="gray"
            />
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return daysOfWeek.map((day, index) => {
      const isSaturday = index === 6;
      const isSunday = index === 0;

      return (
        <View key={index} style={styles.dayHeader}>
          <Text
            style={[
              styles.dayHeaderText,
              (isSaturday || isSunday) && styles.weekendHeaderText,
            ]}>
            {day}
          </Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.headerContainer}>{renderHeader()}</View>
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
    padding: 10,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: mainColor, // Adjust as necessary
    shadowColor: "rgba(0, 0, 0, 0.09)",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  calendarHeader: {
    fontSize: 32, // 2em converted to pixels
    color: mainColor, // Use main color
    fontWeight: "600",
  },
  cstsDays: {
    gap: 5,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    marginVertical: 20,
  },
  dayHeaderText: {
    fontSize: 20,
    fontWeight: "bold", // Adjusted to a common React Native weight
    color: "white", // Use main color
  },
  dayContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 10,
    minHeight: 100,
    borderWidth: 1,
    borderColor: mainColor,
    fontFamily: "monospace",
  },
  leftBorder: {
    borderLeftWidth: 1.5,
    borderLeftColor: mainColor, // Use main color
  },
  rightBorder: {
    borderRightWidth: 1.5,
    borderRightColor: mainColor, // Use main color
  },
  bottomBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: mainColor, // Use main color
  },
  topBorder: {
    borderTopWidth: 1.5,
    borderTopColor: mainColor, // Use main color
  },
  dayText: {
    fontSize: 18,
    color: "#55544",
    fontWeight: "400", // Adjusted to a common React Native weight
  },
  inactiveDate: {
    color: "#cacaca",
    backgroundColor: "#00000009",
  },
  logoContainer: {
    flexDirection: "row",
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  logoLegend: {
    marginHorizontal: 2,
  },
  emptyDay: {
    flex: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: "#fff",
  },
  weekendText: {
    color: "lightgray",
  },
  weekendHeaderText: {
    color: "white",
  },
  calendarBorder: {
    borderColor: mainColor, // Use main color for outer calendar border
    borderWidth: 1,
  },
  calendarTHead: {
    backgroundColor: mainColor, // Adjust as necessary
    shadowColor: "rgba(0, 0, 0, 0.09)",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  calendarBtnHeader: {
    minWidth: 96, // 6em converted to pixels
  },
});

export default CalendarComponent;
