import * as SQLite from "expo-sqlite";
import { getCurrentDatePH } from "./dateUtils"; 
interface User {
  email: string;
  sales_portal_id: string;
}

export const saveUserAttendanceLocalDb = async (user: User, type : string) => {
const db = await SQLite.openDatabaseAsync('cmms', 	{
  useNewConnection: true
});

const currentDatePH = getCurrentDatePH();

await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS user_attendance_tbl (
    id INTEGER PRIMARY KEY NOT NULL, 
    email TEXT NOT NULL, 
    sales_portal_id TEXT NOT NULL, 
    type TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

if(type == 'in'){
  const existingRow = await db.getFirstAsync(
    `SELECT * FROM user_attendance_tbl WHERE DATE(created_at) = ? AND type = ?`,
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
    `SELECT * FROM user_attendance_tbl WHERE DATE(created_at) = ? AND type = ?`,
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

