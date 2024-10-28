import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { getStyleUtil } from "../utils/styleUtil";
import { PieChart, BarChart, LineChart } from "react-native-gifted-charts";
import CalendarComponent from "../components/Calendar";
import { formatDatev1 } from "../utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useDataContext } from "../context/DataContext";
import Loading from "../components/Loading";
const dynamicStyles = getStyleUtil({});

const Dashboard = () => {
  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const SpacerW = ({ size }: { size: number }) => (
    <View style={{ width: size }} />
  );

  const SpacerH = ({ size }: { size: number }) => (
    <View style={{ height: size }} />
  );

  const announcementText =
    "Welcome to CMMS companion App! No announcement for today";

  const {
    currentDate,
    calendarData,
    chartData,
    dailyDataCompletion,
    dailyData,
    monthlyData,
    yearlyData,
    ytdData,
    isLoading,
    isDashboardLoading,
    ytdDataMonthValues,
  } = useDataContext();

  const actualColor = "#046E37";
  const plottedColor = "lightgray";

  let isDailyAvail = true;
  dailyData.forEach((d) => {
    if (d.value == 0) {
      isDailyAvail = false;
    }
  });
  let isMontlyAvail = true;
  monthlyData.forEach((d) => {
    if (d.value == 0) {
      isMontlyAvail = false;
    }
  });
  let isYearlyAvail = true;
  yearlyData.forEach((d) => {
    if (d.value == 0) {
      isYearlyAvail = false;
    }
  });

  return (
    <View style={dynamicStyles.container}>
      {isDashboardLoading || timeOutLoading ? (
        <Loading />
      ) : (
        <>
          <ScrollView>
            <View style={styles.announcementContainer}>
              <Text style={styles.announcementTitle}>Announcement</Text>
              <Text style={styles.announcementText}>{announcementText}</Text>
              <Image
                source={require("../../assets/testWallpaper.jpg")}
                style={styles.announcementImage}
              />
            </View>
            <View style={styles.chartRow}>
              <View style={styles.chartContainer}>
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Calendar</Text>
                  <CalendarComponent data={calendarData.data} />
                  <View style={styles.titleRow}>
                    <Text style={styles.dateLegend}>
                      {formatDatev1(currentDate)}
                    </Text>
                    <View style={styles.chartSubTitleContainer}>
                      <Text style={styles.chartSubTitle}>
                        <View style={styles.itemContainer}>
                          <Ionicons name="square" size={18} color="gray" />
                          <SpacerW size={2} />
                          <Text style={styles.legendText}>ACTUAL</Text>
                        </View>
                        <SpacerW size={20} />
                        <View style={styles.itemContainer}>
                          <Ionicons name="square" size={18} color="red" />
                          <SpacerW size={2} />
                          <Text style={styles.legendText}>MAKEUP</Text>
                        </View>
                        <SpacerW size={18} />
                        <View style={styles.itemContainer}>
                          <Ionicons name="square" size={18} color="green" />
                          <SpacerW size={2} />
                          <Text style={styles.legendText}>SCHEDULED</Text>
                        </View>
                        <SpacerW size={17} />
                        <View style={styles.itemContainer}>
                          <Ionicons name="square" size={18} color="purple" />
                          <SpacerW size={2} />
                          <Text style={styles.legendText}>ADVANCE</Text>
                        </View>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.chartRow}>
              <View style={styles.chartContainer}>
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Daily</Text>
                  <View style={styles.chartRowDaily}>
                    <View style={styles.dailyPieCharts1}>
                      {!dailyDataCompletion && <Text>No data available</Text>}
                      {dailyDataCompletion && (
                        <PieChart
                          data={dailyDataCompletion}
                          donut
                          showGradient
                          sectionAutoFocus
                          radius={122}
                          innerRadius={75}
                          innerCircleColor={"#fff"}
                          centerLabelComponent={() => (
                            <View style={styles.centerLabelContainer}>
                              <Text style={styles.centerLabelText}>
                                {dailyDataCompletion[0].value.toFixed(2)}%
                              </Text>
                              <View
                                style={{
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginTop: 10,
                                }}>
                                <Text>Completion</Text>
                              </View>
                            </View>
                          )}
                        />
                      )}
                    </View>
                    <View style={styles.dailyPieCharts2}>
                      {!isDailyAvail && (
                        <Text>Daily data is empty or zero</Text>
                      )}
                      {dailyData && isDailyAvail && (
                        <>
                          <PieChart
                            data={dailyData}
                            donut
                            showGradient
                            sectionAutoFocus
                            radius={122}
                            innerRadius={75}
                            innerCircleColor={"#fff"}
                          />
                          {dailyData && (
                            <View
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 10,
                              }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  maxWidth: 360,
                                  alignItems: "center",
                                }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}>
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: 7.5,
                                      backgroundColor: "#6ED7A5",
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text style={{ color: "black" }}>
                                    Scheduled: {dailyData[0].value ?? 0}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}>
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: 7.5,
                                      backgroundColor: "#046E37",
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text style={{ color: "black" }}>
                                    Actual: {dailyData[1].value ?? 0}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}>
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: 7.5,
                                      backgroundColor: "lightgray",
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text style={{ color: "black" }}>
                                    Target: {dailyData[2].value ?? 0}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.chartRow}>
              <View style={styles.chartContainer1}>
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Monthly</Text>
                  <View style={{ marginStart: 20 }}>
                    <View style={styles.centerView}>
                      {!isMontlyAvail && (
                        <Text>Monthly data is empty or zero</Text>
                      )}
                      {monthlyData && isMontlyAvail && (
                        <>
                          <PieChart
                            data={monthlyData}
                            donut
                            showGradient
                            sectionAutoFocus
                            radius={122}
                            innerRadius={75}
                            innerCircleColor={"#fff"}
                          />
                          {monthlyData && (
                            <View
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 10,
                              }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  maxWidth: 360,
                                  alignItems: "center",
                                }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginEnd: 10,
                                  }}>
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: 7.5,
                                      backgroundColor: "#6ED7A5",
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text style={{ color: "black" }}>
                                    Scheduled: {monthlyData[0].value ?? 0}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginEnd: 10,
                                  }}>
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: 7.5,
                                      backgroundColor: "#046E37",
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text style={{ color: "black" }}>
                                    Actual: {monthlyData[1].value ?? 0}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: 15,
                                    height: 15,
                                    borderRadius: 7.5,
                                    backgroundColor: "lightgray",
                                    marginRight: 5,
                                  }}
                                />
                                <Text style={{ color: "black" }}>
                                  Target: {monthlyData[2].value ?? 0}
                                </Text>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.chartContainer2}>
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Yearly</Text>
                  <View style={{ marginStart: 20 }}>
                    <View style={styles.centerView}>
                      {!isYearlyAvail && (
                        <Text>Yearly data is empty or zero</Text>
                      )}
                      {yearlyData && isYearlyAvail && (
                        <>
                          <PieChart
                            data={yearlyData}
                            donut
                            showGradient
                            sectionAutoFocus
                            radius={122}
                            innerRadius={75}
                            innerCircleColor={"#fff"}
                          />
                          {yearlyData && (
                            <View
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 10,
                              }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  maxWidth: 360,
                                  alignItems: "center",
                                }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginEnd: 20,
                                  }}>
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: 7.5,
                                      backgroundColor: "#6ED7A5",
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text style={{ color: "black" }}>
                                    Scheduled: {yearlyData[0].value ?? 0}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginEnd: 10,
                                  }}>
                                  <View
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: 7.5,
                                      backgroundColor: "#046E37",
                                      marginRight: 5,
                                    }}
                                  />
                                  <Text style={{ color: "black" }}>
                                    Actual: {yearlyData[1].value ?? 0}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: 15,
                                    height: 15,
                                    borderRadius: 7.5,
                                    backgroundColor: "lightgray",
                                    marginRight: 5,
                                  }}
                                />
                                <Text style={{ color: "black" }}>
                                  Target: {yearlyData[2].value ?? 0}
                                </Text>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.chartRow}>
              <View style={styles.chartContainer}>
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>YTD Calls/Target</Text>
                  <View
                    style={{
                      margin: 10,
                      padding: 16,
                      borderRadius: 20,
                    }}>
                    <View style={{ padding: 5, alignItems: "center" }}>
                      <View style={{ marginBottom: 10 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}>
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 6,
                              backgroundColor: actualColor,
                              marginRight: 8,
                            }}
                          />
                          <Text
                            style={{
                              width: 60,
                              height: 20,
                              color: "black",
                            }}>
                            Actual
                          </Text>
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 6,
                              backgroundColor: plottedColor,
                              marginRight: 8,
                            }}
                          />
                          <Text
                            style={{
                              width: 60,
                              height: 20,
                              color: "black",
                            }}>
                            Plotted
                          </Text>
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 6,
                              backgroundColor: "red",
                              marginRight: 8,
                            }}
                          />
                          <Text
                            style={{
                              width: 60,
                              height: 20,
                              color: "red",
                            }}>
                            Target
                          </Text>
                        </View>
                      </View>
                      {!ytdDataMonthValues && <Text>No data available</Text>}
                      {ytdDataMonthValues && (
                        <BarChart
                          data={ytdDataMonthValues}
                          barWidth={16}
                          isAnimated
                          initialSpacing={20}
                          spacing={32}
                          barBorderRadius={4}
                          yAxisThickness={0}
                          xAxisType={"dashed"}
                          xAxisColor={"lightgray"}
                          yAxisTextStyle={{ color: "black" }}
                          stepValue={50}
                          maxValue={350}
                          yAxisLabelTexts={[
                            "0",
                            "50",
                            "100",
                            "150",
                            "200",
                            "250",
                            "300",
                            "350",
                          ]}
                          labelWidth={40}
                          xAxisLabelTextStyle={{
                            color: "black",
                            textAlign: "center",
                          }}
                          showReferenceLine1
                          referenceLine1Position={330}
                          referenceLine1Config={{
                            color: "red",
                            thickness: 2,
                            type: "solid",
                          }}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#046E37",
  },
  centerView: {
    alignSelf: "center",
  },
  dailyPieCharts1: {
    marginStart: 150,
  },
  dailyPieCharts2: {
    marginEnd: 150,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 40,
  },
  chartSubTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    color: "#666666",
    fontWeight: "condensedBold",
  },
  dateLegend: {
    color: "#666666",
    fontWeight: "condensedBold",
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
    elevation: 2,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginStart: 20,
    marginEnd: 10,
    elevation: 5,
  },
  chartRowDaily: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    height: 60,
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
  chartSubTitle: {
    fontSize: 10,
    fontWeight: "normal",
    color: "#lightgray",
    marginBottom: 12,
    marginRight: 40,
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
