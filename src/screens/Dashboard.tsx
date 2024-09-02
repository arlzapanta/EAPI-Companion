import React from "react";
import { View, Text, Image, processColor } from "react-native";
import { getStyleUtil } from "../index";
import { PieChart, BarChart } from "react-native-gifted-charts";
import { ruleTypes } from "gifted-charts-core";

const dynamicStyles = getStyleUtil({}); //  { theme: 'light' or 'dark'  }

const Dashboard = () => {
  const announcementText =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const imageUrl = "https://picsum.photos/200/100";

  interface BarDataItem {
    value: number;
    frontColor: string;
    gradientColor: string;
    spacing: number;
    label?: string;
  }

  const data: BarDataItem[] = [
    {
      value: 250,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "Jan",
    },
    {
      value: 300,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "Feb",
    },
    {
      value: 350,
      frontColor: "#006DFF",
      gradientColor: "#009FFF",
      spacing: 6,
      label: "Mar",
    },
    // Add more months as needed
  ];

  interface dailyCompletionData {
    value: number;
    color: string;
  }

  const dailyData: dailyCompletionData[] = [
    { value: 70, color: "#009FFF" },
    { value: 30, color: "wheat" },
  ];

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.announcementContainer_dashboard}>
        <Text style={dynamicStyles.text_dashboard}>Announcement</Text>
        <Text style={dynamicStyles.subtext_dashboard}>{announcementText}</Text>
        <Image
          source={{ uri: imageUrl }}
          style={dynamicStyles.announcementImage}
        />
      </View>
      <View style={dynamicStyles.chartRow}>
        <View style={dynamicStyles.chart_dashboard}>
          <View style={dynamicStyles.card_chart}>
            <Text style={dynamicStyles.title_chart}>Daily Completion</Text>
            <PieChart
              data={dailyData}
              donut
              showGradient
              sectionAutoFocus
              radius={200}
              innerRadius={130}
              innerCircleColor={"#232B5D"}
              centerLabelComponent={() => (
                <View style={dynamicStyles.centerLabelContainer_dailyChart}>
                  <Text style={dynamicStyles.centerLabelText_dailyChart}>
                    70%
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </View>
      <View style={dynamicStyles.chartRow}>
        <View style={dynamicStyles.chart_dashboard}>
          <View style={dynamicStyles.card_chart}>
            <Text style={dynamicStyles.title_chart}>Actual VS Target</Text>
            <BarChart
              data={data}
              barWidth={16}
              initialSpacing={300}
              spacing={14}
              barBorderRadius={4}
              yAxisThickness={0}
              xAxisType={ruleTypes.DASHED}
              xAxisColor={"lightgray"}
              yAxisTextStyle={{ color: "lightgray" }}
              stepValue={50}
              maxValue={400}
              noOfSections={8}
              yAxisLabelTexts={[
                "400",
                "350",
                "300",
                "250",
                "200",
                "150",
                "100",
              ]}
              labelWidth={40}
              xAxisLabelTextStyle={{
                color: "lightgray",
                textAlign: "center",
              }}
              showLine
              lineConfig={{
                color: "#F29C6E",
                thickness: 3,
                curved: true,
                hideDataPoints: true,
                shiftY: 20,
                initialSpacing: 0,
              }}
            />
          </View>
        </View>
        <View style={dynamicStyles.chart_dashboard}>
          <Text style={dynamicStyles.text_dashboard}>Weekly Performance</Text>
          {/*  */}
        </View>
      </View>
      <View style={dynamicStyles.chartRow}>
        <View style={dynamicStyles.chart_dashboard}>
          <Text style={dynamicStyles.text_dashboard}>
            Monthly Call Frequency
          </Text>
          {/*  */}
        </View>
        <View style={dynamicStyles.chart_dashboard}>
          <Text style={dynamicStyles.text_dashboard}>
            Monthly Call Performance VS Target {/* current year */}
          </Text>
          {/*  */}
        </View>
      </View>
    </View>
  );
};

export default Dashboard;
