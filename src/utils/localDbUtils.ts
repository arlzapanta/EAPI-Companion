import * as SQLite from "expo-sqlite";
import { getCurrentDatePH } from "./dateUtils"; 
import { User } from "../type/user"

export const saveUserLoginToLocalDb = async (user: User) => {
  const db = await SQLite.openDatabaseAsync('cmms', 	{
    useNewConnection: true
});

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_login_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      email TEXT NOT NULL, 
      first_name TEXT NOT NULL, 
      last_name TEXT NOT NULL, 
      sales_portal_id TEXT NOT NULL, 
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const currentDatePH = getCurrentDatePH();
  const existingRow = await db.getFirstAsync(
    `SELECT * FROM user_login_tbl WHERE DATE(created_at) = ?`,
    currentDatePH
  );

  if (!existingRow) {
    await db.runAsync(
      `INSERT INTO user_login_tbl (email, first_name, last_name, sales_portal_id) VALUES (?, ?, ?, ?)`,
      user.email,
      user.first_name,
      user.last_name,
      user.sales_portal_id
    );
  }else {
    console.log('existing user login');
  }

    // Check all data in the user_login_tbl
    const allUsers = await db.getAllAsync('SELECT * FROM user_login_tbl');
    console.log('All user logins:', allUsers);
  
    // Close the database
    db.closeSync();
};

