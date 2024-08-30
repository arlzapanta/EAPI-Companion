import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native';
import { getStyleUtil } from '../index';
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');
const dynamicStyles = getStyleUtil({}); // Change theme as needed, e.g., { theme: 'light' } or { theme: 'dark' }

const Dashboard = () => {
  const announcementText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const imageUrl = "https://picsum.photos/200/100";

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
      },
    ],
  };

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        data: [30, 40, 70, 60, 90],
      },
    ],
  };

  const pieChartData = [
    {
      name: 'A',
      population: 215,
      color: '#f00',
      legendFontColor: '#000',
      legendFontSize: 15
    },
    {
      name: 'B',
      population: 130,
      color: '#0f0',
      legendFontColor: '#000',
      legendFontSize: 15
    },
    {
      name: 'C',
      population: 98,
      color: '#00f',
      legendFontColor: '#000',
      legendFontSize: 15
    },
    {
      name: 'D',
      population: 85,
      color: '#ff0',
      legendFontColor: '#000',
      legendFontSize: 15
    }
  ];

  const progressChartData = {
    labels: ['January', 'February', 'March'],
    data: [0.4, 0.6, 0.8],
  };

const chartConfig = {
  backgroundGradientFrom: dynamicStyles.chartBackgroundColor,
  backgroundGradientTo: dynamicStyles.chartBackgroundColor,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: "#e3e3e3",
  },
  propsForLabels: {
    fontSize: 12,
    fill: "#fff",
  },
  propsForVerticalLabels: {
    fontSize: 12,
    fill: "#fff",
  },
  propsForHorizontalLabels: {
    fontSize: 12,
    fill: "#fff",
  },
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};


  return (
    <View style={dynamicStyles.container_dashboard}>
      <View style={dynamicStyles.announcementContainer_dashboard}>
        <Text style={dynamicStyles.text_dashboard}>Announcement</Text>
        <Text style={dynamicStyles.subtext_dashboard}>{announcementText}</Text>
        <Image source={{ uri: imageUrl }} style={dynamicStyles.announcementImage} />
      </View>
      <View style={dynamicStyles.chartContainer_dashboard}>
        <View style={dynamicStyles.chartRow}>
          <View style={dynamicStyles.chart_dashboard}>
            <Text style={dynamicStyles.text_dashboard}>Line Chart</Text>
            <LineChart
              data={lineChartData}
              width={width / 2 - 24}
              height={220}
              chartConfig={chartConfig}
              bezier
            />
          </View>
          <View style={dynamicStyles.chart_dashboard}>
            <Text style={dynamicStyles.text_dashboard}>Bar Chart</Text>
            <BarChart
              data={barChartData}
              width={width / 2 - 24}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              yAxisLabel="$"
              yAxisSuffix="k"
            />
          </View>
        </View>
        <View style={dynamicStyles.chartRow}>
          <View style={dynamicStyles.chart_dashboard}>
            <Text style={dynamicStyles.text_dashboard}>Pie Chart</Text>
            <PieChart
              data={pieChartData}
              width={width / 2 - 24}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
          <View style={dynamicStyles.chart_dashboard}>
            <Text style={dynamicStyles.text_dashboard}>Progress Chart</Text>
            <ProgressChart
              data={progressChartData}
              width={width / 2 - 24}
              height={220}
              chartConfig={chartConfig}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default Dashboard;
