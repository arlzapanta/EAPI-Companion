import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { getStyleUtil } from "../utils/styleUtil";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import { createShimmerPlaceHolder } from "expo-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import CalendarComponent from "../components/Calendar";
import { useRefreshFetchDataContext } from "../context/RefreshFetchDataContext";
import { formatDatev1 } from "../utils/dateUtils";
import { getDatesAndTypeForCalendarView } from "../utils/localDbUtils";

const ShimmerPlaceHolder = createShimmerPlaceHolder(LinearGradient);
const dynamicStyles = getStyleUtil({}); // { theme: 'light' or 'dark' }

const Dashboard = () => {
  const [showLoader, setShowLoader] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");
  const [calendarData, setCalendarData] = useState<CalendarProps>({
    data: [],
  });

  const announcementText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  const actualVTargetData = [
    { value: 75, label: "W1", frontColor: "#4ABFF4" },
    { value: 60, label: "W2", frontColor: "#79C3DB" },
    { value: 70, label: "W3", frontColor: "#28B2B3" },
    { value: 45, label: "W4", frontColor: "#4ADDBA" },
  ];

  const weeklyPerformanceTestData1 = [
    { value: 70 },
    { value: 36 },
    { value: 50 },
    { value: 40 },
    { value: 18 },
    { value: 38 },
  ];

  const weeklyPerformanceTestData2 = [
    { value: 50 },
    { value: 10 },
    { value: 45 },
    { value: 30 },
    { value: 45 },
    { value: 18 },
  ];

  const lineDataSample = [
    { value: 0, dataPointText: "0" },
    { value: 20, dataPointText: "20" },
    { value: 18, dataPointText: "18" },
    { value: 40, dataPointText: "40" },
    { value: 36, dataPointText: "36" },
    { value: 60, dataPointText: "60" },
    { value: 54, dataPointText: "54" },
    { value: 85, dataPointText: "85" },
  ];

  const lineDataSample1 = [
    { value: 0, dataPointText: "0" },
    { value: 10, dataPointText: "10" },
    { value: 8, dataPointText: "8" },
    { value: 58, dataPointText: "58" },
    { value: 56, dataPointText: "56" },
    { value: 78, dataPointText: "78" },
    { value: 74, dataPointText: "74" },
    { value: 98, dataPointText: "98" },
  ];

  const lineDataSample2 = [
    { value: 0, dataPointText: "0" },
    { value: 20, dataPointText: "20" },
    { value: 18, dataPointText: "18" },
    { value: 40, dataPointText: "40" },
    { value: 36, dataPointText: "36" },
    { value: 60, dataPointText: "60" },
    { value: 54, dataPointText: "54" },
    { value: 85, dataPointText: "85" },
  ];

  const dailyData: dailyCompletionData[] = [
    { value: 70, color: "#046E37" },
    { value: 30, color: "lightgray" },
  ];

  const { getCurrentDate } = useRefreshFetchDataContext();

  useEffect(() => {
    const fetchDate = async () => {
      const date = await getCurrentDate();
      setCurrentDate(date);

      const getDates = await getDatesAndTypeForCalendarView(); // Ensure this returns an array
      if (getDates && Array.isArray(getDates)) {
        setCalendarData({
          data: getDates,
        });
      }
    };

    const timer = setTimeout(() => {
      setShowLoader(false);
      setDataLoaded(true);
    }, 10);

    fetchDate();
    return () => clearTimeout(timer);
  }, [getCurrentDate, getDatesAndTypeForCalendarView]);

  return (
    <View style={styles.container}>
      {showLoader ? (
        <ShimmerPlaceHolder visible={false} style={styles.shimmerPlaceholder} />
      ) : (
        <>
          <View style={styles.announcementContainer}>
            <Text style={styles.announcementTitle}>Announcement</Text>
            <Text style={styles.announcementText}>{announcementText}</Text>
            <Image
              source={require("../../assets/testWallpaper.jpg")}
              style={styles.announcementImage}
            />
          </View>
          <View style={styles.chartRow}>
            <View style={styles.chartContainer1}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Daily Completion</Text>
                <View style={styles.centerView}>
                  <PieChart
                    data={dailyData}
                    donut
                    showGradient
                    sectionAutoFocus
                    radius={142.9}
                    innerRadius={85}
                    innerCircleColor={"#fff"}
                    centerLabelComponent={() => (
                      <View style={styles.centerLabelContainer}>
                        <Text style={styles.centerLabelText}>70%</Text>
                      </View>
                    )}
                  />
                </View>
              </View>
            </View>
            <View style={styles.chartContainer2}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>
                  {formatDatev1(currentDate)}
                </Text>
                <CalendarComponent data={calendarData.data} />
              </View>
            </View>
          </View>
          <View style={styles.chartRow}></View>
          <View style={styles.chartRow}>
            <View style={styles.chartContainer1}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Actual VS Target</Text>
                <View style={styles.centerView}>
                  <BarChart
                    showFractionalValues
                    showYAxisIndices
                    noOfSections={3}
                    maxValue={75}
                    data={actualVTargetData}
                    isAnimated
                  />
                </View>
              </View>
            </View>
            <View style={styles.chartContainer2}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Weekly Performance</Text>
                <View style={styles.centerView}>
                  <LineChart
                    areaChart
                    curved
                    data={weeklyPerformanceTestData1}
                    data2={weeklyPerformanceTestData2}
                    hideDataPoints
                    spacing={68}
                    color1="#8a56ce"
                    color2="#56acce"
                    startFillColor1="#8a56ce"
                    startFillColor2="#56acce"
                    endFillColor1="#8a56ce"
                    endFillColor2="#56acce"
                    startOpacity={0.9}
                    endOpacity={0.2}
                    initialSpacing={0}
                    noOfSections={4}
                    yAxisColor="white"
                    yAxisThickness={0}
                    rulesType="solid"
                    rulesColor="gray"
                    yAxisTextStyle={{ color: "gray" }}
                    yAxisLabelSuffix="%"
                    xAxisColor="lightgray"
                    pointerConfig={{
                      pointerStripUptoDataPoint: true,
                      pointerStripColor: "lightgray",
                      pointerStripWidth: 2,
                      strokeDashArray: [2, 5],
                      pointerColor: "lightgray",
                      radius: 4,
                      pointerLabelWidth: 100,
                      pointerLabelHeight: 120,
                      pointerLabelComponent: (
                        items: {
                          value: number;
                          x: number;
                          y: number;
                          index: number;
                        }[]
                      ) => (
                        <View>
                          <Text>Value: {items[0].value}</Text>
                          <Text>X: {items[0].x}</Text>
                          <Text>Y: {items[0].y}</Text>
                          <Text>Index: {items[0].index}</Text>
                        </View>
                      ),
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.chartRow}>
            <View style={styles.chartContainer1}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Monthly Call Frequency</Text>
                <View style={styles.centerView}>
                  <LineChart
                    initialSpacing={0}
                    data={lineDataSample}
                    height={250}
                    spacing={44}
                    textColor1="black"
                    textShiftY={-8}
                    textShiftX={-10}
                    textFontSize={13}
                    thickness={5}
                    hideRules
                    yAxisColor="#0BA5A4"
                    showVerticalLines
                    verticalLinesColor="rgba(14,164,164,0.5)"
                    xAxisColor="#0BA5A4"
                    color="#0BA5A4"
                  />
                </View>
              </View>
            </View>
            <View style={styles.chartContainer2}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>
                  Monthly Call Performance VS Target
                </Text>
                <View style={styles.centerView}>
                  <LineChart
                    initialSpacing={0}
                    data={lineDataSample1}
                    height={250}
                    spacing={44}
                    textColor1="black"
                    textShiftY={-8}
                    textShiftX={-10}
                    textFontSize={13}
                    thickness={5}
                    hideRules
                    yAxisColor="#FF3C3C"
                    showVerticalLines
                    verticalLinesColor="rgba(255,60,60,0.5)"
                    xAxisColor="#FF3C3C"
                    color="#FF3C3C"
                  />
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  centerView: {
    alignSelf: "center",
  },
  announcementContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 10,
    marginStart: 20,
    marginEnd: 10,
    elevation: 5,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginStart: 20,
    marginEnd: 10,
    elevation: 5,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  announcementText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  announcementImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },

  chartContainer: {
    flex: 1,
  },
  chartContainer1: {
    flex: 1,
    marginEnd: 10,
  },
  chartContainer2: {
    flex: 1,
  },
  chartCard: {
    elevation: 2,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  shimmerPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  centerLabelContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabelText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
});

export default Dashboard;
