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
