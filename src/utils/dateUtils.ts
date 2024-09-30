import moment from 'moment-timezone';

import * as SecureStore from "expo-secure-store";
import { format, parseISO } from 'date-fns';

const DATE_KEY ='current_date_ph';
export const getCurrentDatePH = async (): Promise<string> => {
  const storedDate = await SecureStore.getItemAsync(DATE_KEY);
  const currentDate = moment().tz('Asia/Manila').format('YYYY-MM-DD');

  if (storedDate && storedDate === currentDate) {
    return storedDate;
  } else {
    await SecureStore.setItemAsync(DATE_KEY, currentDate);
    return currentDate;
  }
};

export const getWeekdaysRange = async () => {
  const currentMoment = moment(await getCurrentDatePH()).tz('Asia/Manila');
  const monday = currentMoment.clone().startOf('week').add(1, 'days');
  const weekdays: string[] = [];

  for (let i = 0; i < 5; i++) {
    weekdays.push(monday.clone().add(i, 'days').format('YYYY-MM-DD'));
  }

  return weekdays;
};

export const isTimeBetween12and1PM = (): boolean => {
  const currentTime = moment();
  
  const startTime = moment().hour(12).minute(0).second(0);
  const endTime = moment().hour(13).minute(0).second(0);

  const isBetween = currentTime.isBetween(startTime, endTime);

  console.log(isBetween ? 'true' : 'false');
  
  return isBetween;
};

const TIME_KEY = 'current_time_ph';
export const getCurrentTimePH = async (): Promise<string> => {
  const storedTime = await SecureStore.getItemAsync(TIME_KEY);
  const currentTime = moment().format('HH:mm:ss');

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
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function formatTimeHoursMinutes(date: Date): string {
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
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
  const firstDayOfPreviousMonthLastWeek = new Date(year, month - 1, Math.max(lastDayOfPreviousMonth.getDate() - 6, 1));

  const firstDayOfNextMonth = new Date(year, month + 1, 1);
  const lastDayOfNextMonthFirstWeek = new Date(year, month + 1, Math.min(7, new Date(year, month + 2, 0).getDate()));

  const dates: string[] = [
    ...getDatesInRange(firstDayOfPreviousMonthLastWeek, lastDayOfPreviousMonth),
    ...getDatesInRange(firstDayOfCurrentMonth, lastDayOfCurrentMonth),
    ...getDatesInRange(firstDayOfNextMonth, lastDayOfNextMonthFirstWeek),
  ];

  return dates;
}

export const formatDate = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "MMM d, yyyy EEEE");
};

export const formatDateYMD = (dateString: string) => {
  const date = parseISO(dateString);
  return format(date, "yyyy-MM-dd");
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

export const isWithinCurrentMonthAndAvailable = (dateStr: string) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const date = new Date(dateStr);
  
  return (
    date.getFullYear() === currentYear &&
    date.getMonth() === currentMonth &&  
    date >= today                        
  );
};

export const isWithinWeekOrAdvance = (dateStr: string): string | null => {
  const today = new Date();
  const date = new Date(dateStr);

  if (date <= today) {
      return null; 
  }

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); 
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay())); 

  if (date >= startOfWeek && date <= endOfWeek) {
      return "Makeup";
  } else {
      return "Advance";
  }
};
