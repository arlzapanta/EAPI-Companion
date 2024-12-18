import moment from "moment-timezone";
moment.tz.setDefault("Asia/Tokyo");

import * as SecureStore from "expo-secure-store";
// import { format, parseISO } from "date-fns";
import { format } from "date-fns";

// export const formatDateTime = (dateString: string) => {
//   const thisDate = moment(dateString).tz("Asia/Manila").format("YYYY-MM-DD");
//   const thisDateWithTime = moment(dateString)
//     .tz("Asia/Manila")
//     .format("YYYY-MM-DD HH:mm:ss");
//   return format(thisDateWithTime, "MMM d, yyyy | hh:mma | EE ");
// };

export function formatDateTime(datetimeString: string): string {
  try {
    const date = new Date(datetimeString);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      date
    );
    return formattedDate;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown Date";
  }
}

const DATE_KEY = "current_date_ph";
export const getCurrentDatePH = async (): Promise<string> => {
  const storedDate = await SecureStore.getItemAsync(DATE_KEY);
  const currentDate = moment().tz("Asia/Manila").format("YYYY-MM-DD");
  if (storedDate && storedDate === currentDate) {
    return storedDate;
  } else {
    await SecureStore.setItemAsync(DATE_KEY, currentDate);
    return currentDate;
  }
};
export const getCurrentDateTimePH = async (): Promise<string> => {
  const storedDate = await SecureStore.getItemAsync(DATE_KEY);
  const currentDate = moment().tz("Asia/Manila").format("YYYY-MM-DD HH:mm:ss");
  if (storedDate && storedDate === currentDate) {
    return storedDate;
  } else {
    await SecureStore.setItemAsync(DATE_KEY, currentDate);
    return currentDate;
  }
};

export const getWeekdaysRange = async () => {
  const currentMoment = moment(await getCurrentDatePH());
  const monday = currentMoment.clone().startOf("week").add(1, "days");
  const today = currentMoment.format("YYYY-MM-DD");
  const weekdays: string[] = [];

  for (let i = 0; i < 5; i++) {
    const day = monday.clone().add(i, "days").format("YYYY-MM-DD");
    weekdays.push(day);
  }

  return weekdays;
};

export const getWeekdaysRangeExToday = async () => {
  const currentMoment = moment(await getCurrentDatePH());
  const monday = currentMoment.clone().startOf("week").add(1, "days");
  const today = currentMoment.format("YYYY-MM-DD");
  const weekdays: string[] = [];

  for (let i = 0; i < 5; i++) {
    const day = monday.clone().add(i, "days").format("YYYY-MM-DD");
    if (day !== today && day! > today) {
      weekdays.push(day);
    }
  }
  return weekdays;
};

export const getMonthRangeExToday = async () => {
  const currentMoment = moment(await getCurrentDatePH());
  const startOfMonth = currentMoment.clone().startOf("month");
  const endToday = currentMoment.clone();
  const monthDays: string[] = [];

  for (let day = startOfMonth; day <= endToday; day.add(1, "days")) {
    const dayString = day.format("YYYY-MM-DD");
    monthDays.push(dayString);
  }

  return monthDays;
};

export const isTimeBetween12and1PM = (): boolean => {
  const currentTime = moment();

  const startTime = moment().hour(12).minute(0).second(0);
  const endTime = moment().hour(13).minute(0).second(0);

  const isBetween = currentTime.isBetween(startTime, endTime);
  return isBetween;
};

const TIME_KEY = "current_time_ph";
export const getCurrentTimePH = async (): Promise<string> => {
  const storedTime = await SecureStore.getItemAsync(TIME_KEY);
  const currentTime = moment().format("HH:mm:ss");

  if (storedTime && storedTime === currentTime) {
    return storedTime;
  } else {
    await SecureStore.setItemAsync(TIME_KEY, currentTime);
    return currentTime;
  }
};

function getDatesInRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function formatTimeHoursMinutes(date: Date): string {
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return formattedTime;
}

export async function getRelevantDateRange(): Promise<string[]> {
  const todayStr = await getCurrentDatePH();
  const today = new Date(todayStr);

  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDayOfCurrentMonth = new Date(year, month, 1);
  const lastDayOfCurrentMonth = new Date(year, month + 1, 0);

  const lastDayOfPreviousMonth = new Date(year, month, 0);
  const firstDayOfPreviousMonthLastWeek = new Date(
    year,
    month - 1,
    Math.max(lastDayOfPreviousMonth.getDate() - 6, 1)
  );

  const firstDayOfNextMonth = new Date(year, month + 1, 1);
  const lastDayOfNextMonthFirstWeek = new Date(
    year,
    month + 1,
    Math.min(7, new Date(year, month + 2, 0).getDate())
  );

  const dates: string[] = [
    ...getDatesInRange(firstDayOfPreviousMonthLastWeek, lastDayOfPreviousMonth),
    ...getDatesInRange(firstDayOfCurrentMonth, lastDayOfCurrentMonth),
    ...getDatesInRange(firstDayOfNextMonth, lastDayOfNextMonthFirstWeek),
  ];

  return dates;
}

export const formatDate = (dateString: string) => {
  const date = moment(dateString)
    .tz("Asia/Manila")
    .format("YYYY-MM-DD HH:mm:ss");
  return format(date, "MMM d, yyyy EEEE");
};

export const formatDatev1 = (dateString: string) => {
  return moment(new Date(dateString)).format("MMMM DD, yyyy");
};

export const formatDatev2 = (dateString: string) => {
  return moment(new Date(dateString)).format("YYYY-MM-DD");
};

export const formatDateYMD = (dateString: string) => {
  const thisDateWithTime = moment(dateString)
    .tz("Asia/Manila")
    .format("YYYY-MM-DD HH:mm:ss");
  return format(thisDateWithTime, "yyyy-MM-dd");
};

export const getFormattedDateToday = async () => {
  const currentMoment = moment(await getCurrentDatePH());
  const today = currentMoment.format("YYYY-MM-DD");
  return today;
};

export const getCurrentQuarterPH = async (): Promise<number> => {
  const currentDatePH = await getCurrentDatePH();
  const currentMonth = moment(currentDatePH).month() + 1;

  if (currentMonth >= 1 && currentMonth <= 3) {
    return 1; // Q1: January, February, March
  } else if (currentMonth >= 4 && currentMonth <= 6) {
    return 2; // Q2: April, May, June
  } else if (currentMonth >= 7 && currentMonth <= 9) {
    return 3; // Q3: July, August, September
  } else {
    return 4; // Q4: October, November, December
  }
};

export const isWithinSameMonth = (
  selectedDate: string,
  dateToCheck: string
): boolean => {
  const selected = new Date(selectedDate);
  const toCheck = new Date(dateToCheck);

  const isSameMonth =
    selected.getFullYear() === toCheck.getFullYear() &&
    selected.getMonth() === toCheck.getMonth();

  return isSameMonth;
};

export const isAfterDate = (
  selectedDate: string,
  dateToCheck: string
): boolean => {
  const selected = new Date(selectedDate);
  const toCheck = new Date(dateToCheck);

  return toCheck > selected;
};

export const isNotWeekend = (date: string): boolean => {
  const dayOfWeek = new Date(date).getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
};

export const generateFutureDates = (selectedDate: string): string[] => {
  const selected = new Date(selectedDate);
  const year = selected.getFullYear();
  const month = selected.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const futureDates: string[] = [];
  const startDay = selected.getDate() + 3;

  for (let day = startDay; day <= lastDayOfMonth + 1; day++) {
    const dateToCheck = new Date(year, month, day);
    const dateString = dateToCheck.toISOString().split("T")[0];

    if (isAfterDate(selectedDate, dateString) && isNotWeekend(dateString)) {
      futureDates.push(dateString);
    }
  }

  return futureDates;
};

export const getMonthRangeExGTToday = async () => {
  const currentMoment = moment(await getCurrentDatePH()).tz("Asia/Manila");
  const endOfMonth = currentMoment.clone().endOf("month");
  const endToday = currentMoment.clone().add(2, "days");
  const monthDays: string[] = [];

  for (let day = endToday; day <= endOfMonth; day.add(1, "days")) {
    const dayString = day.format("YYYY-MM-DD");
    monthDays.push(dayString);
  }

  return monthDays;
};

// export const getDateRangeGTToday = async (selectedDate: string) => {
//   const currentMoment = moment(selectedDate).tz("Asia/Manila");
//   const endOfMonth = currentMoment.clone().endOf("month");
//   const endToday = currentMoment.add(2, "days");
//   const monthDays: string[] = [];

//   console.log(endOfMonth, "endOfMonth");
//   console.log(currentMoment, "currentMoment");
//   console.log(endToday, "endToday");
//   console.log(monthDays, "monthDays");

//   for (let day = endToday; day <= endOfMonth; day.add(1, "days")) {
//     if (day.isoWeekday() > 5) {
//       continue;
//     }
//     const dayString = day.format("YYYY-MM-DD");
//     monthDays.push(dayString);
//   }

//   return monthDays;
// };

export const getDateRangeGTToday = (selectedDate: string) => {
  const currentDate = new Date(selectedDate);

  // Add 1 day to the current date to get the start date
  const startDate = new Date();

  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const monthDays: string[] = [];

  for (
    let day = startDate;
    day <= lastDayOfMonth;
    day.setDate(day.getDate() + 1)
  ) {
    if (
      day.getDay() !== 0 &&
      day.getDay() !== 6 &&
      day.getDate() !== currentDate.getDate()
    ) {
      const dayString = day.toString();
      monthDays.push(formatDatev2(dayString));
    }
  }

  return monthDays;
};

export const isWithinWeekOrAdvance = (
  dateTo: string,
  dateFrom: string
): string | null => {
  const today = new Date();
  const dateToVal = new Date(dateTo);
  const dateFromVal = new Date(dateFrom);

  if (dateToVal <= today) {
    return null;
  }

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  if (
    dateToVal >= startOfWeek &&
    dateToVal <= endOfWeek &&
    dateFromVal > today
  ) {
    return "Advance";
  } else {
    return "Makeup";
  }
};

export const checkIfFirstWeekdayOfMonth = (date: string): boolean => {
  const momentDate = moment(date, "YYYY-MM-DD");
  const firstOfMonth = momentDate.clone().startOf("month");

  if (firstOfMonth.day() === 0) {
    firstOfMonth.add(1, "day");
  } else if (firstOfMonth.day() === 6) {
    firstOfMonth.add(2, "day");
  }

  return momentDate.isSame(firstOfMonth, "day");
};
