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
  getDailyChartsData,
  getDatesAndTypeForCalendarView,
  getProductRecordsLocalDb,
} from "../utils/localDbUtils";
import { useRefreshFetchDataContext } from "../context/RefreshFetchDataContext";
import { getQuickCalls } from "../utils/quickCallUtil";

// todo : add necessary states from components
interface DataContextProps<T> {
  currentDate: string;
  calendarData: CalendarProps;
  chartData: ChartDashboardRecord[];
  dailyDataCompletion: chartData[];
  dailyData: chartData[];
  dailyCallsVal: number;
  dailySchedVal: number;
  dailyTargetVal: number;
  monthlyTargetVal: number;
  monthlyData: chartData[];
  yearlyTargetVal: number;
  yearlyData: chartData[];
  ytdData: chartYtdData[];
  isLoading: boolean;
  isDashboardLoading: boolean;
  isScheduleLoading: boolean;
  isActualLoading: boolean;
  isDoctorLoading: boolean;
  isQuickLoading: boolean;
  detailersRecord: T[];
  productRecord: ProductRecord[];
  quickCallData: Call[];
  ytdDataMonthValues: Array<{
    value: number;
    frontColor: string;
    spacing?: number;
    label?: string;
  }>;
  setDetailersRecord: (newDetailersRecord: T[]) => void;
  // coreProductVal: ProductRecord | null | undefined;
  // secProductVal: ProductRecord | null | undefined;
  // remindProductVal: ProductRecord | null | undefined;
  // setCoreProductVal: (newCoreProductVal: ProductRecord | undefined) => void;
  // setSecProductVal: (newSecProductVal: ProductRecord | undefined) => void;
  // setRemindProductVal: (newRemindProductVal: ProductRecord | undefined) => void;
}
interface DataProviderProps {
  children: ReactNode;
}

// const DataContext = createContext<DataContextProps | undefined>(undefined);
const DataContext = createContext<
  DataContextProps<DetailersRecord> | undefined
>(undefined);

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
  const [dailyTargetVal, setDailyTargetVal] = useState<number>(0);
  const [dailyCallsVal, setDailyCallsVal] = useState<number>(0);
  const [dailySchedVal, setDailySchedVal] = useState<number>(0);

  const [monthlyTargetVal, setMonthlyTargetVal] = useState<number>(0);
  const [yearlyTargetVal, setYearlyTargetVal] = useState<number>(0);

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
  const { refreshSchedData } = useRefreshFetchDataContext();
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

        // const dailyPlottingCount = parseInt(
        //   transformedData[0].daily.plottingCount.toString(),
        //   10
        // );
        // const dailyCallsCount = parseInt(
        //   transformedData[0].daily.callsCount.toString(),
        //   10
        // );

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

        const dailyCompData: DailyChartData[] = await getDailyChartsData();

        let dailyPlottingCount = parseInt(
          dailyCompData[0].schedule_api_count.toString(),
          10
        );

        let dailyCallsCount = parseInt(
          dailyCompData[0].calls_count.toString(),
          10
        );
        // const completedPercentage =
        //   (dailyCompData[0].calls_count / dailyCompData[0].schedule_api_count) *
        //   100;
        // const remainingPercentage = 100 - completedPercentage;

        dailyPlottingCount = 20;
        dailyCallsCount = 10;

        dailyCallsCount = dailyCallsCount < 15 ? dailyCallsCount : 15;

        const completedPercentage = (dailyCallsCount / 15) * 100;
        const remainingPercentage = 100 - completedPercentage;

        const dailyDataCompletion: chartData[] = [
          { value: completedPercentage, color: "#046E37" },
          { value: remainingPercentage, color: "lightgray" },
        ];

        setDailyTargetVal(15);
        setDailyCallsVal(dailyCallsCount);
        setDailySchedVal(dailyPlottingCount);

        function calculateTargetCount(
          dailyPlottingCount: number,
          dailyCallsCount: number
        ): number {
          const totalActual = dailyPlottingCount + dailyCallsCount;

          if (totalActual <= 15) {
            return 15 - totalActual;
          } else {
            return 0;
          }
        }

        const dailyData: chartData[] = [
          { value: completedPercentage, color: "#046E37" },
          // { value: anotherVar, color: "#6ED7A5" },
          { value: remainingPercentage, color: "lightgray" },
        ];

        setMonthlyTargetVal(monthlyTargetCount);
        const monthlyData: chartData[] = [
          {
            value: monthlyPlottingCount - monthlyCallsCount,
            color: "lightgray",
          },
          { value: monthlyCallsCount, color: "#046E37" },
          // { value: monthlyTargetCount, color: "lightgray" },
        ];
        setYearlyTargetVal(yearlyTargetCount);
        const yearlyData: chartData[] = [
          // { value: yearlyPlottingCount - yearlyCallsCount, color: "#6ED7A5" },
          { value: yearlyPlottingCount - yearlyCallsCount, color: "lightgray" },
          { value: yearlyCallsCount, color: "#046E37" },
          // { value: yearlyTargetCount, color: "lightgray" },
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
  const [productRecord, setProductRecord] = useState<ProductRecord[]>([]);
  const fetchProducts = async () => {
    const productData = (await getProductRecordsLocalDb()) as ProductRecord[];
    setProductRecord(productData);
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const [coreProductVal, setCoreProductVal] = useState<ProductRecord>();
  const [secProductVal, setSecProductVal] = useState<ProductRecord>();
  const [remindProductVal, setRemindProductVal] = useState<ProductRecord>();

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
        dailyCallsVal,
        dailySchedVal,
        dailyTargetVal,
        dailyData,
        monthlyTargetVal,
        monthlyData,
        yearlyTargetVal,
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
        productRecord,
        setDetailersRecord,
        // coreProductVal,
        // secProductVal,
        // remindProductVal,
        // setCoreProductVal,
        // setSecProductVal,
        // setRemindProductVal,
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
