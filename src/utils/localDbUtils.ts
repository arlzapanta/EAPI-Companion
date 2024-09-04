import * as SQLite from "expo-sqlite";
import { getCurrentDatePH, getRelevantDateRange } from "./dateUtils"; 
interface User {
  email: string;
  sales_portal_id: string;
}

export const saveUserAttendanceLocalDb = async (user: User, type : string) => {
const db = await SQLite.openDatabaseAsync('cmms', 	{
  useNewConnection: true
});

const currentDatePH = await getCurrentDatePH();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_attendance_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      email TEXT NOT NULL, 
      sales_portal_id TEXT NOT NULL, 
      type TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if(type == 'in'){
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM user_attendance_tbl WHERE DATE(date) = ? AND type = ?`,
      [currentDatePH, 'in'],
    );

    if (!existingRow) {
      await db.runAsync(
        `INSERT INTO user_attendance_tbl (email, type, sales_portal_id) VALUES (?,?,?)`,
        user.email,
        type,
        user.sales_portal_id
      );
    } else {
      console.log('user already timed in today');
    }
  }else{ //type == out 
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM user_attendance_tbl WHERE DATE(date) = ? AND type = ?`,
      [currentDatePH, 'out'],
    );

    if (!existingRow) {
      await db.runAsync(
        `INSERT INTO user_attendance_tbl (email, type, sales_portal_id) VALUES (?,?,?)`,
        user.email,
        type,
        user.sales_portal_id
      );
    } else {
      console.log('user already timed out today');
    }
  }

  // const testRecords = await db.getAllAsync('SELECT * FROM user_attendance_tbl');
  // console.log('All records:', testRecords);

  db.closeSync();
};

export const getUserAttendanceSyncRecordsLocalDb = async (user: User) => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_attendance_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      email TEXT NOT NULL, 
      sales_portal_id TEXT NOT NULL, 
      type TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const dateRange = await getRelevantDateRange();
  const placeholders = dateRange.map(() => '?').join(', ');
  const query = `SELECT * FROM user_attendance_tbl WHERE DATE(date) IN (${placeholders}) AND sales_portal_id = ?`;

  try {
    const existingRows = await db.getAllAsync(query, [...dateRange, user.sales_portal_id]);
    console.log('existingRows getRelevantDateRange', existingRows);
    return existingRows; 
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return []; 
  } finally {
    await db.closeAsync(); 
  }
};

export const dropLocalTablesDb = async () => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  const query = 'DROP TABLE user_attendance_tbl;';

  await db.getAllAsync(query);
  await db.closeAsync(); 
}

