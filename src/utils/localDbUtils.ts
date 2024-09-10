import * as SQLite from "expo-sqlite";
import { getCurrentDatePH, getRelevantDateRange } from "./dateUtils"; 
interface User {
  email: string;
  sales_portal_id: string;
}
interface ScheduleRecord {
  id: number;
  schedules_id: number;
  call_start: string;
  call_end: string;
  signature: string;
  signature_attempts: string;
  signature_location: string;
  photo: string;
  photo_location: string;
  created_date: string;
}

export const saveUserAttendanceLocalDb = async (user: User, type: string): Promise<number> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
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

  let result: number;

  if (type === 'in') {
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM user_attendance_tbl WHERE DATE(date) = ? AND type = ?`,
      [currentDatePH, 'in']
    );

    if (!existingRow) {
      await db.runAsync(
        `INSERT INTO user_attendance_tbl (email, type, sales_portal_id) VALUES (?,?,?)`,
        [user.email, type, user.sales_portal_id]
      );
      result = 0; // Successfully recorded
    } else {
      console.log('User already timed in today');
      result = 1; // Already recorded
    }
  } else if (type === 'out') {
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM user_attendance_tbl WHERE DATE(date) = ? AND type = ?`,
      [currentDatePH, 'out']
    );

    if (!existingRow) {
      await db.runAsync(
        `INSERT INTO user_attendance_tbl (email, type, sales_portal_id) VALUES (?,?,?)`,
        [user.email, type, user.sales_portal_id]
      );
      result = 0; // Successfully recorded
    } else {
      console.log('User already timed out today');
      result = 1; // Already recorded
    }
  } else {
    console.log('Invalid type provided');
    result = -1; // Invalid type
  }

  db.closeSync();
  return result;
};

export const saveUserSyncHistoryLocalDb = async (user: User, type: number): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  const currentDatePH = await getCurrentDatePH();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_sync_history_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      sales_portal_id TEXT NOT NULL, 
      type NUMBER NOT NULL,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingRow = await db.getFirstAsync(
    `SELECT * FROM user_sync_history_tbl WHERE DATE(date) = ? AND type = ?`,
    [currentDatePH, type],
  );

  let result: string;
  let msg: string = "User already sync";

  // if (existingRow) { //for testing
  if (!existingRow) {
    await db.runAsync(
      `INSERT INTO user_sync_history_tbl (type, sales_portal_id) VALUES (?,?)`,
      [type, user.sales_portal_id]
    );
    result = "Success";
  } else {
    switch (type) {
      case 1:
        msg = "User already time in sync today"
        break;
      case 2:
        msg = "User already mid sync today"
        break;
      case 3:
        msg = "User already time out sync today"
        break;
      default:
        msg = "User already sync today with type : " + type;
        break;
    }
    result = msg;
  }

  // const testRecords = await db.getAllAsync('SELECT * FROM user_sync_history_tbl');
  // console.log('All records:', testRecords);

  db.closeSync();
  return result;
};

interface CallAPIDown {
  id?: string; // id is optional for the purpose of insertion
  schedule_id?: string; // New column
  date: string | null;
  doctor_name: string | null;
  address: string | null;
  municipality_city: string | null;
  province: string | null;
  call_start: string | null;
  call_end: string | null;
  signature: string | null;
  signature_location: string | null;
  photo: string | null;
  photo_location: string | null;
}

export const saveActualCallsAPILocalDb = async (schedules: CallAPIDown[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    DROP TABLE IF EXISTS schedule_API_tbl;
    
    PRAGMA journal_mode = WAL;
    CREATE TABLE schedule_API_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
      schedule_id TEXT, 
      address TEXT, 
      call_start TEXT, 
      call_end TEXT, 
      date TEXT, 
      doctor_name TEXT, 
      municipality_city TEXT, 
      photo TEXT, 
      photo_location TEXT, 
      province TEXT, 
      signature TEXT, 
      signature_location TEXT
    );
  `);

  const insertPromises = schedules.map((schedule: CallAPIDown) => {
    return db.execAsync(`
      INSERT INTO schedule_API_tbl (schedule_id, address, call_start, call_end, date, doctor_name, municipality_city, photo, photo_location, province, signature, signature_location)
      VALUES (
        ${schedule.id !== undefined && schedule.id !== null ? `'${schedule.id}'` : 'NULL'},
        ${schedule.address !== undefined && schedule.address !== null ? `'${schedule.address}'` : 'NULL'},
        ${schedule.call_start !== undefined && schedule.call_start !== null ? `'${schedule.call_start}'` : 'NULL'},
        ${schedule.call_end !== undefined && schedule.call_end !== null ? `'${schedule.call_end}'` : 'NULL'},
        ${schedule.date !== undefined && schedule.date !== null ? `'${schedule.date}'` : 'NULL'},
        ${schedule.doctor_name !== undefined && schedule.doctor_name !== null ? `'${schedule.doctor_name}'` : 'NULL'},
        ${schedule.municipality_city !== undefined && schedule.municipality_city !== null ? `'${schedule.municipality_city}'` : 'NULL'},
        ${schedule.photo !== undefined && schedule.photo !== null ? `'${schedule.photo}'` : 'NULL'},
        ${schedule.photo_location !== undefined && schedule.photo_location !== null ? `'${schedule.photo_location}'` : 'NULL'},
        ${schedule.province !== undefined && schedule.province !== null ? `'${schedule.province}'` : 'NULL'},
        ${schedule.signature !== undefined && schedule.signature !== null ? `'${schedule.signature}'` : 'NULL'},
        ${schedule.signature_location !== undefined && schedule.signature_location !== null ? `'${schedule.signature_location}'` : 'NULL'}
      );
    `);
  });
  

  try {
    await Promise.all(insertPromises);
      // const testRecords = await db.getAllAsync('SELECT * FROM schedule_API_tbl');
      // console.log('All records:', testRecords);
    return 'Success';
  } catch (error) {
    console.error('Error saving data:', error);
    return 'Failed to save data';
  }
};

interface ScheduleAPIRecord {
  id?: string; 
  address : string | null;
  date : string | null;
  doctor_id : string | null;
  full_name : string | null;
  municipality_city : string | null;
  province : string | null;
  schedule_id : string | null;
}


export const saveSchedulesAPILocalDb = async (schedules: ScheduleAPIRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    DROP TABLE IF EXISTS schedule_API_tbl;
    
    PRAGMA journal_mode = WAL;
    CREATE TABLE schedule_API_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      address TEXT, 
      date TEXT, 
      doctor_id TEXT, 
      full_name TEXT, 
      municipality_city TEXT, 
      province TEXT,
      schedule_id TEXT
    );
  `);

  const insertPromises = schedules.map((schedule: ScheduleAPIRecord) => {
    return db.execAsync(`
      INSERT INTO schedule_API_tbl (schedule_id, address, doctor_id, date, municipality_city, province, full_name)
      VALUES (
        ${schedule.id !== undefined && schedule.id !== null ? `'${schedule.id}'` : 'NULL'},
        ${schedule.address !== undefined && schedule.address !== null ? `'${schedule.address}'` : 'NULL'},
        ${schedule.doctor_id !== undefined && schedule.doctor_id !== null ? `'${schedule.doctor_id}'` : 'NULL'},
        ${schedule.date !== undefined && schedule.date !== null ? `'${schedule.date}'` : 'NULL'},
        ${schedule.municipality_city !== undefined && schedule.municipality_city !== null ? `'${schedule.municipality_city}'` : 'NULL'},
        ${schedule.province !== undefined && schedule.province !== null ? `'${schedule.province}'` : 'NULL'},
        ${schedule.full_name !== undefined && schedule.full_name !== null ? `'${schedule.full_name}'` : 'NULL'}
      );
    `);
  });
  

  try {
    await Promise.all(insertPromises);
      // const testRecords = await db.getAllAsync('SELECT * FROM schedule_API_tbl');
    return 'Success';
  } catch (error) {
    console.error('Error saving data:', error);
    return 'Failed to save data';
  }
};

export const getUserAttendanceRecordsLocalDb = async (user: User) => {
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
    // console.log('existingRows getUserAttendanceRecordsLocalDb', existingRows);
    return existingRows; 
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return []; 
  } finally {
    await db.closeAsync(); 
  }
};

export const getSyncHistoryRecordsLocalDb = async (user: User) => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS user_sync_history_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      sales_portal_id TEXT NOT NULL, 
      type NUMBER NOT NULL,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const dateRange = await getRelevantDateRange();
  const placeholders = dateRange.map(() => '?').join(', ');
  const query = `SELECT * FROM user_sync_history_tbl WHERE DATE(date) IN (${placeholders}) AND sales_portal_id = ?`;

  try {
    const existingRows = await db.getAllAsync(query, [...dateRange, user.sales_portal_id]);
    // console.log('existingRows getSyncHistoryRecordsLocalDb', existingRows);
    return existingRows; 
  } catch (error) {
    console.error('Error fetching sync history data:', error);
    return []; 
  } finally {
    await db.closeAsync(); 
  }
};

export const getSchedulesLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schedule_API_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      schedule_id TEXT, 
      address TEXT, 
      date TEXT, 
      doctor_id TEXT, 
      full_name TEXT, 
      municipality_city TEXT, 
      province TEXT
    );
  `);

  const query = `SELECT * FROM schedule_API_tbl`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as ScheduleAPIRecord[];
    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getSchedulesTodayLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schedule_API_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      schedule_id TEXT, 
      address TEXT, 
      date TEXT, 
      doctor_id TEXT, 
      full_name TEXT, 
      municipality_city TEXT, 
      province TEXT
    );
  `);

  const currentDate = await getCurrentDatePH();
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) = ?`;

  try {
    const result = await db.getAllAsync(query, [currentDate]);
    const existingRows = result as ScheduleAPIRecord[];

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getCallsTestLocalDb = async (): Promise<ScheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS calls_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
      schedule_id TEXT, 
      address TEXT, 
      call_start TEXT, 
      call_end TEXT, 
      date TEXT, 
      doctor_name TEXT, 
      municipality_city TEXT, 
      photo TEXT, 
      photo_location TEXT, 
      province TEXT, 
      signature TEXT, 
      signature_location TEXT
    );
  `);

  const currentDate = await getCurrentDatePH();
  const query = `SELECT * FROM calls_tbl`;

  try {
    const result = await db.getAllAsync(query, [currentDate]);
    const existingRows = result as ScheduleRecord[];
    return existingRows;
  } catch (error) {
    console.error('Error fetching data for today:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};
export const getCallsTodayLocalDb = async (): Promise<ScheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS calls_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
      schedule_id TEXT, 
      address TEXT, 
      call_start TEXT, 
      call_end TEXT, 
      date TEXT, 
      doctor_name TEXT, 
      municipality_city TEXT, 
      photo TEXT, 
      photo_location TEXT, 
      province TEXT, 
      signature TEXT, 
      signature_location TEXT
    );
  `);

  const currentDate = await getCurrentDatePH();
  const query = `SELECT * FROM calls_tbl WHERE DATE(created_date) = ?`;

  try {
    const result = await db.getAllAsync(query, [currentDate]);
    const existingRows = result as ScheduleRecord[];
    return existingRows;
  } catch (error) {
    console.error('Error fetching data for today:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const deleteCallsTodayLocalDb = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  const tableExistsQuery = `
    SELECT name FROM sqlite_master WHERE type='table' AND name='calls_tbl';
  `;

  try {
    const tableResult = await db.getAllAsync(tableExistsQuery);
    if (tableResult.length === 0) {
      console.log('Table calls_tbl does not exist.');
      return; 
    }

    const currentDate = await getCurrentDatePH();
    const deleteQuery = `DELETE FROM calls_tbl WHERE DATE(created_date) = ?`;

    const result = await db.getAllAsync(deleteQuery, [currentDate]);
    console.log('Records deleted successfully.', result);

  } catch (error) {
    console.error('Error deleting records for today:', error);
  } finally {
    await db.closeAsync();
  }
};

export const fetchDetailerImages = async (category: string): Promise<string[]> => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  try {
    const query = `SELECT image FROM detailers_tbl WHERE category = ?`;
    const result = await db.getAllAsync(query, [`category${category}`]);

    const rows: { image: string }[] = result as { image: string }[];
    const imageUrls = rows.map(row => row.image);
    // console.log(imageUrls.length , 'fetchDetailerImages > imageUrls.length');
    return imageUrls;
  } catch (error) {
    console.error("Error fetching detailer images:", error);
    return [];
  } finally {
    await db.closeAsync();
  }
};



export const insertDummyRecords = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS detailers_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      schedules_id INTEGER, 
      image64 TEXT NOT NULL,
      call_end TEXT NOT NULL,
      signature TEXT NOT NULL,
      signature_attempts TEXT NOT NULL,
      signature_location TEXT NOT NULL,
      photo TEXT NOT NULL,
      photo_location TEXT NOT NULL,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const dummyRecords = [
    {
      schedules_id: 1,
      call_start: '10:00:00',
      call_end: '10:30:00',
      signature: 'dummySignature1',
      signature_attempts: '1',
      signature_location: 'dummyLocation1',
      photo: 'dummyPhoto1',
      photo_location: 'dummyPhotoLocation1'
    },
    {
      schedules_id: 2,
      call_start: '11:00:00',
      call_end: '11:45:00',
      signature: 'dummySignature2',
      signature_attempts: '2',
      signature_location: 'dummyLocation2',
      photo: 'dummyPhoto2',
      photo_location: 'dummyPhotoLocation2'
    }
  ];

  try {
    for (const record of dummyRecords) {
      
      await db.runAsync(
        `INSERT INTO calls_tbl (
          schedules_id, call_start, call_end,
          signature, signature_attempts, signature_location,
          photo, photo_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        record.schedules_id,
        record.call_start,
        record.call_end,
        record.signature,
        record.signature_attempts,
        record.signature_location,
        record.photo,
        record.photo_location
      );
    }
    // const testRecords = await db.getAllAsync('SELECT * FROM schedules_tbl');
    // console.log('All records:', testRecords);
    
    console.log('Dummy records inserted successfully.');
  } catch (error) {
    console.error('Error inserting dummy records:', error);
  } finally {
    db.closeSync();
  }
};

export const insertImage64Dummy = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS detailers_tbl (
      id INTEGER PRIMARY KEY NOT NULL,
      image64 TEXT NOT NULL,
    );
  `);

  const dummyRecords = [
    {
      image64: 1,
    },
    {
      image64: 2,
    }
  ];

  try {
    for (const record of dummyRecords) {
      
      await db.runAsync(
        `INSERT INTO detailers_tbl (
          image64, 
        ) VALUES (?)`,
        record.image64,
      );
    }
    // const testRecords = await db.getAllAsync('SELECT * FROM schedules_tbl');
    // console.log('All records:', testRecords);
    
    console.log('Dummy records inserted successfully.');
  } catch (error) {
    console.error('Error inserting dummy records:', error);
  } finally {
    db.closeSync();
  }
};

export const dropLocalTablesDb = async () => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  // const tableNames = ['user_attendance_tbl', 'schedule_API_tbl', 'calls_tbl', 'user_sync_history_tbl'];
  const tableNames = ['user_attendance_tbl', 'schedule_API_tbl', 'user_sync_history_tbl'];
  for (const tableName of tableNames) {
    const query = `DROP TABLE IF EXISTS ${tableName};`;
    await db.getAllAsync(query);
    console.log(tableName, 'has been dropped');
  }

  await db.closeAsync();
}