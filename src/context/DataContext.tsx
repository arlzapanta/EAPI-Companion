import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchAllDetailers,
  fetchChartDataLocalDb,
  fetchDetailersDataLocalDb,
  getDatesAndTypeForCalendarView,
} from "../utils/localDbUtils";
import { useRefreshFetchDataContext } from "../context/RefreshFetchDataContext";
import { getQuickCalls } from "../utils/quickCallUtil";
// todo : add necessary states from components
interface DataContextProps {
  currentDate: string;
  calendarData: CalendarProps;
  chartData: ChartDashboardRecord[];
  dailyDataCompletion: chartData[];
  dailyData: chartData[];
  monthlyData: chartData[];
  yearlyData: chartData[];
  ytdData: chartYtdData[];
  isLoading: boolean;
  isDashboardLoading: boolean;
  isScheduleLoading: boolean;
  isActualLoading: boolean;
  isDoctorLoading: boolean;
  isQuickLoading: boolean;
  detailersRecord: DetailersRecord[];
  quickCallData: Call[];
  ytdDataMonthValues: Array<{
    value: number;
    frontColor: string;
    spacing?: number;
    label?: string;
  }>;
}
interface DataProviderProps {
  children: ReactNode;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // ***************************************************************************
  // ***************************************************************************
  // DASHBOARD DATA START
  // ***************************************************************************
  // ***************************************************************************
  const actualColor = "#046E37";
  const plottedColor = "lightgray";
  const [currentDate, setCurrentDate] = useState<string>("");
  const [calendarData, setCalendarData] = useState<CalendarProps>({ data: [] });
  const [chartData, setChartData] = useState<ChartDashboardRecord[]>([]);
  const [dailyDataCompletion, setDailyDataCompletion] = useState<chartData[]>([
    { value: 0, color: "#046E37" },
    { value: 100, color: "lightgray" },
  ]);
  const [dailyData, setDailyData] = useState<chartData[]>([
    { value: 0, color: "#6ED7A5" },
    { value: 0, color: "#046E37" },
    { value: 0, color: "lightgray" },
  ]);
  const [monthlyData, setMonthlyData] = useState<chartData[]>([
    { value: 0, color: "#6ED7A5" },
    { value: 0, color: "#046E37" },
    { value: 0, color: "lightgray" },
  ]);
  const [yearlyData, setYearlyData] = useState<chartData[]>([
    { value: 0, color: "#6ED7A5" },
    { value: 0, color: "#046E37" },
    { value: 0, color: "lightgray" },
  ]);
  const [ytdData, setYtdData] = useState<chartYtdData[]>([
    { value: [0, 0, 0] },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState<boolean>(false);
  const { getCurrentDate } = useRefreshFetchDataContext();
  const fetchDashboardData = async () => {
    try {
      setIsDashboardLoading(true);

      const date = await getCurrentDate();
      setCurrentDate(date);

      const getDates = await getDatesAndTypeForCalendarView();
      if (getDates && Array.isArray(getDates)) {
        setCalendarData({ data: getDates });
      }

      const data: any[] = await fetchChartDataLocalDb();
      setChartData(data);

      if (data.length > 0) {
        const transformedData: ChartDashboardRecord[] = data.map((item) => ({
          id: item.id,
          created_at: item.created_at,
          daily: {
            plottingCount: item.daily_plotting_count ?? 0,
            callsCount: item.daily_calls_count ?? 0,
            targetCount: item.daily_target_count ?? 1,
          },
          monthly: {
            plottingCount: item.monthly_plotting_count ?? 0,
            callsCount: item.monthly_calls_count ?? 0,
            targetCount: item.monthly_target_count ?? 1,
          },
          yearly: {
            plottingCount: item.yearly_plotting_count ?? 0,
            callsCount: item.yearly_calls_count ?? 0,
            targetCount: item.yearly_target_count ?? 1,
          },
          ytd: {
            plottingCount: JSON.parse(item.ytd_plotting_count ?? "[0]"),
            callsCount: JSON.parse(item.ytd_calls_count ?? "[0]"),
            targetCount: JSON.parse(item.ytd_target_count ?? "[1]"),
          },
        }));

        const dailyPlottingCount = parseInt(
          transformedData[0].daily.plottingCount.toString(),
          10
        );
        const dailyCallsCount = parseInt(
          transformedData[0].daily.callsCount.toString(),
          10
        );
        const dailyTargetCount = transformedData[0].daily.targetCount;

        const monthlyPlottingCount = parseInt(
          transformedData[0].monthly.plottingCount.toString(),
          10
        );
        const monthlyCallsCount = parseInt(
          transformedData[0].monthly.callsCount.toString(),
          10
        );
        const monthlyTargetCount = transformedData[0].monthly.targetCount;

        const yearlyPlottingCount = parseInt(
          transformedData[0].yearly.plottingCount.toString(),
          10
        );
        const yearlyCallsCount = parseInt(
          transformedData[0].yearly.callsCount.toString(),
          10
        );
        const yearlyTargetCount = transformedData[0].yearly.targetCount;

        const ytdPlottingCount = transformedData[0].ytd.plottingCount;
        const ytdCallsCount = transformedData[0].ytd.callsCount;
        const ytdTargetCount = transformedData[0].ytd.targetCount;

        const completedPercentage = (dailyCallsCount / dailyTargetCount) * 100;
        const remainingPercentage = 100 - completedPercentage;

        const dailyDataCompletion: chartData[] = [
          { value: completedPercentage, color: "#046E37" },
          { value: remainingPercentage, color: "lightgray" },
        ];

        const dailyData: chartData[] = [
          { value: dailyPlottingCount - dailyCallsCount, color: "#6ED7A5" },
          { value: dailyCallsCount, color: "#046E37" },
          { value: dailyTargetCount, color: "lightgray" },
        ];

        const monthlyData: chartData[] = [
          { value: monthlyPlottingCount - monthlyCallsCount, color: "#6ED7A5" },
          { value: monthlyCallsCount, color: "#046E37" },
          { value: monthlyTargetCount, color: "lightgray" },
        ];

        const yearlyData: chartData[] = [
          { value: yearlyPlottingCount - yearlyCallsCount, color: "#6ED7A5" },
          { value: yearlyCallsCount, color: "#046E37" },
          { value: yearlyTargetCount, color: "lightgray" },
        ];

        const ytdData: chartYtdData[] = ytdPlottingCount.map((_, index) => ({
          value: [
            Number(ytdPlottingCount[index]),
            Number(ytdCallsCount[index]),
            Number(ytdTargetCount[index]),
          ],
        }));

        setDailyDataCompletion(dailyDataCompletion);
        setDailyData(dailyData);
        setYearlyData(yearlyData);
        setMonthlyData(monthlyData);
        setYtdData(ytdData);
      }

      setIsDashboardLoading(false);
    } catch (error) {
      console.error("Error fetching chart data123:", error);
      setIsDashboardLoading(false);
    }
  };
  const ytdDataMonthValues = [
    {
      value: ytdData[0]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Jan",
    },
    { value: ytdData[0]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[1]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Feb",
    },
    { value: ytdData[1]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[2]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Mar",
    },
    { value: ytdData[2]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[3]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Apr",
    },
    { value: ytdData[3]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[4]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "May",
    },
    { value: ytdData[4]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[5]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "June",
    },
    { value: ytdData[5]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[6]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "July",
    },
    { value: ytdData[6]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[7]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Aug",
    },
    { value: ytdData[7]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[8]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Sept",
    },
    { value: ytdData[8]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[9]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Oct",
    },
    { value: ytdData[9]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[10]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Nov",
    },
    { value: ytdData[10]?.value[1] ?? 0, frontColor: plottedColor },

    {
      value: ytdData[11]?.value[0] ?? 0,
      frontColor: actualColor,
      spacing: 6,
      label: "Dec",
    },
    { value: ytdData[11]?.value[1] ?? 0, frontColor: plottedColor },
  ];
  useEffect(() => {
    fetchDashboardData();
  }, [getCurrentDate, getDatesAndTypeForCalendarView, fetchChartDataLocalDb]);
  // ***************************************************************************
  // ***************************************************************************
  // DASHBOARD DATA END
  // ***************************************************************************
  // ***************************************************************************

  // ***************************************************************************
  // ***************************************************************************
  // SCHEDULE DATA START
  // ***************************************************************************
  // ***************************************************************************
  const [isScheduleLoading, setIsScheduleLoading] = useState<boolean>(false);
  const [detailersRecord, setDetailersRecord] = useState<DetailersRecord[]>([]);
  const fetchDetailers = async () => {
    const detailersData = await fetchDetailersDataLocalDb();
    setDetailersRecord(detailersData);
  };
  useEffect(() => {
    fetchDetailers();
  }, []);
  // ADD SCHEDULE DATA HERE
  // ***************************************************************************
  // ***************************************************************************
  // SCHEDULE DATA END
  // ***************************************************************************
  // ***************************************************************************

  // ***************************************************************************
  // ***************************************************************************
  // ACTUAL DATA START
  // ***************************************************************************
  // ***************************************************************************
  const [isActualLoading, setIsaCTUALLoading] = useState<boolean>(false);
  // ADD ACTUAL DATA HERE
  // ***************************************************************************
  // ***************************************************************************
  // ACTUAL DATA END
  // ***************************************************************************
  // ***************************************************************************

  // ***************************************************************************
  // ***************************************************************************
  // DOCTOR DATA START
  // ***************************************************************************
  // ***************************************************************************
  const [isDoctorLoading, setIsDoctorLoading] = useState<boolean>(false);
  // ADD DOCTOR DATA HERE
  // ***************************************************************************
  // ***************************************************************************
  // DOCTOR DATA END
  // ***************************************************************************
  // ***************************************************************************

  // ***************************************************************************
  // ***************************************************************************
  // QUICK DATA START
  // ***************************************************************************
  // ***************************************************************************
  const [isQuickLoading, setIsQuickLoading] = useState<boolean>(false);
  const [quickCallData, setQuickCallData] = useState<Call[]>([]);
  const fetchQuickCallsData = async () => {
    try {
      const data = await getQuickCalls();
      if (Array.isArray(data)) {
        setQuickCallData(data);
      } else {
        console.warn("Fetched data is not an array:", data);
        setQuickCallData([]);
      }
    } catch (error) {
      console.log("fetchCallsData error", error);
    }
  };
  useEffect(() => {
    fetchQuickCallsData();
  }, []);
  // ***************************************************************************
  // ***************************************************************************
  // QUICK DATA END
  // ***************************************************************************
  // ***************************************************************************
  return (
    <DataContext.Provider
      value={{
        // ***************************************************************************
        // DASHBOARD DATA START
        // ***************************************************************************
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
        // ***************************************************************************
        // DASHBOARD DATA END
        // ***************************************************************************

        // ***************************************************************************
        // SCHEDULE DATA START
        // ***************************************************************************
        isScheduleLoading,
        detailersRecord,
        // ***************************************************************************
        // SCHEDULE DATA END
        // ***************************************************************************

        // ***************************************************************************
        // ACTUAL DATA START
        // ***************************************************************************
        isActualLoading,
        // ***************************************************************************
        // ACTUAL DATA END
        // ***************************************************************************

        // ***************************************************************************
        // DOCTOR DATA START
        // ***************************************************************************
        isDoctorLoading,
        // ***************************************************************************
        // DOCTOR DATA END
        // ***************************************************************************

        // ***************************************************************************
        // QUICK DATA START
        // ***************************************************************************
        isQuickLoading,
        quickCallData,
        // ***************************************************************************
        // QUICK DATA END
        // ***************************************************************************
      }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
