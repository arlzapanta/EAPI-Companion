import * as SQLite from "expo-sqlite";
import { getCurrentDatePH, getRelevantDateRange, getWeekdaysRange } from "./dateUtils"; 


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

export const saveRescheduleHistoryLocalDb = async (rescheduleDetails : RescheduleDetails): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS reschedule_history_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      sales_portal_id TEXT NOT NULL, 
      schedule_id TEXT NOT NULL, 
      type NUMBER NOT NULL,
      status NUMBER,
      date_from TEXT,
      date_to TEXT,
      doctors_id TEXT,
      full_name TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await db.runAsync(
      `INSERT INTO reschedule_history_tbl (schedule_id, sales_portal_id, type, status, date_from, date_to, doctors_id, full_name) VALUES (?,?,?,?,?,?,?,?)`,
      [
        rescheduleDetails.schedule_id,
        rescheduleDetails.sales_portal_id,
        rescheduleDetails.type,
        rescheduleDetails.status,
        rescheduleDetails.date_from,
        rescheduleDetails.date_to,
        rescheduleDetails.doctors_id,
        rescheduleDetails.full_name,
      ]
    );

    // const testRecords = await db.getAllAsync('SELECT * FROM user_sync_history_tbl');
    // console.log('All records:', testRecords);

    db.closeSync();

    return 'Success';
  } catch (error) {
    console.error('Error saving data:', error);
    return 'Failed to save data';
  }
};

export const saveActualCallsLocalDb = async (schedules: CallAPIDown[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    DROP TABLE IF EXISTS calls_tbl;
    
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
      signature_location TEXT,
      signature_attempts TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP 
    );
  `);

  const insertPromises = schedules.map((schedule: CallAPIDown) => {
    return db.execAsync(`
      INSERT INTO calls_tbl (schedule_id, address, call_start, call_end, date, doctor_name, municipality_city, photo, photo_location, province, signature, signature_location)
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
      // console.log('All actual calls records test:', testRecords);
    return 'Success';
  } catch (error) {
    console.error('Error saving data:', error);
    return 'Failed to save data';
  }
};

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


export const saveDoctorListLocalDb = async (doctors: DoctorRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    DROP TABLE IF EXISTS doctors_tbl;
    
    PRAGMA journal_mode = WAL;
    CREATE TABLE doctors_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      doctors_id TEXT,
      first_name TEXT,
      last_name TEXT,
      specialization TEXT,
      classification TEXT,
      birthday TEXT,
      address_1 TEXT,
      address_2 TEXT,
      municipality_city TEXT,
      province TEXT,
      phone_mobile TEXT,
      phone_office TEXT,
      phone_secretary TEXT,
      notes_names TEXT,
      notes_values TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_date TEXT
    );
  `);

  const insertPromises = doctors.map((doctors: DoctorRecord) => {
    return db.execAsync(`
      INSERT INTO doctors_tbl (
        doctors_id,
        first_name,
        last_name,
        specialization,
        classification,
        birthday,
        address_1,
        address_2,
        municipality_city,
        province,
        phone_mobile,
        phone_office,
        phone_secretary,
        notes_names,
        notes_values
      )
      VALUES (
        ${doctors.doctors_id !== undefined && doctors.doctors_id !== null ? `'${doctors.doctors_id}'` : 'NULL'},
        ${doctors.first_name !== undefined && doctors.first_name !== null ? `'${doctors.first_name}'` : 'NULL'},
        ${doctors.last_name !== undefined && doctors.last_name !== null ? `'${doctors.last_name}'` : 'NULL'},
        ${doctors.specialization !== undefined && doctors.specialization !== null ? `'${doctors.specialization}'` : 'NULL'},
        ${doctors.classification !== undefined && doctors.classification !== null ? `'${doctors.classification}'` : 'NULL'},
        ${doctors.birthday !== undefined && doctors.birthday !== null ? `'${doctors.birthday}'` : 'NULL'},
        ${doctors.address_1 !== undefined && doctors.address_1 !== null ? `'${doctors.address_1}'` : 'NULL'},
        ${doctors.address_2 !== undefined && doctors.address_2 !== null ? `'${doctors.address_2}'` : 'NULL'},
        ${doctors.municipality_city !== undefined && doctors.municipality_city !== null ? `'${doctors.municipality_city}'` : 'NULL'},
        ${doctors.province !== undefined && doctors.province !== null ? `'${doctors.province}'` : 'NULL'},
        ${doctors.phone_mobile !== undefined && doctors.phone_mobile !== null ? `'${doctors.phone_mobile}'` : 'NULL'},
        ${doctors.phone_office !== undefined && doctors.phone_office !== null ? `'${doctors.phone_office}'` : 'NULL'},
        ${doctors.phone_secretary !== undefined && doctors.phone_secretary !== null ? `'${doctors.phone_secretary}'` : 'NULL'},
        ${doctors.notes_names !== undefined && doctors.notes_names !== null ? `'${doctors.notes_names}'` : 'NULL'},
        ${doctors.notes_values !== undefined && doctors.notes_values !== null ? `'${doctors.notes_values}'` : 'NULL'}
      );
    `);
  });

  try {
    await Promise.all(insertPromises);
      // const testRecords = await db.getAllAsync('SELECT * FROM doctors_tbl');
      // console.log(testRecords,'doctors_tbl');
    return 'Success';
  } catch (error) {
    console.error('Error saving data:', error);
    return 'Failed to save data';
  }
};

export const getDoctorRecordsLocalDb = async () => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS doctors_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      doctors_id TEXT,
      first_name TEXT,
      last_name TEXT,
      specialization TEXT,
      classification TEXT,
      birthday TEXT,
      address_1 TEXT,
      address_2 TEXT,
      municipality_city TEXT,
      province TEXT,
      phone_mobile TEXT,
      phone_office TEXT,
      phone_secretary TEXT,
      notes_names TEXT,
      notes_values TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_date TEXT
    );
  `);

  const query = `SELECT * FROM doctors_tbl`;

  try {
    const existingRows = await db.getAllAsync(query);
    // console.log('existingRows getDoctorRecordsLocalDb', existingRows);
    return existingRows; 
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return []; 
  } finally {
    await db.closeAsync(); 
  }
};

export const getUpdatedDoctorRecordsLocalDb = async (): Promise<UpdateDoctorsNotes[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS doctors_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      doctors_id TEXT,
      first_name TEXT,
      last_name TEXT,
      specialization TEXT,
      classification TEXT,
      birthday TEXT,
      address_1 TEXT,
      address_2 TEXT,
      municipality_city TEXT,
      province TEXT,
      phone_mobile TEXT,
      phone_office TEXT,
      phone_secretary TEXT,
      notes_names TEXT,
      notes_values TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_date TEXT
    );
  `);

  const query = `SELECT doctors_id, notes_names, notes_values FROM doctors_tbl WHERE DATE(update_date) = DATE('now')`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as UpdateDoctorsNotes[];
    return existingRows;
    // console.log('updated doctors', existingRows);
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return []; 
  } finally {
    await db.closeAsync(); 
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

export const getRescheduleHistoryRecordsLocalDb = async (user: User) => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS reschedule_history_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      sales_portal_id TEXT NOT NULL, 
      schedule_id TEXT NOT NULL, 
      type NUMBER NOT NULL,
      status NUMBER,
      date_from TEXT,
      date_to TEXT,
      doctors_id TEXT,
      full_name TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const dateRange = await getRelevantDateRange();
  const placeholders = dateRange.map(() => '?').join(', ');
  const query = `SELECT * FROM reschedule_history_tbl WHERE DATE(date) IN (${placeholders}) AND sales_portal_id = ?`;

  try {
    const existingRows = await db.getAllAsync(query, [...dateRange, user.sales_portal_id]);
    // console.log('existingRows getSyncHistoryRecordsLocalDb', existingRows);
    return existingRows; 
  } catch (error) {
    console.error('Error fetching reschedule data:', error);
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

export const getSchedulesWeekLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
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

  const weekDates = await getWeekdaysRange();
  const placeholders = weekDates.map(() => '?').join(', ');
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) IN (${placeholders})`;

  try {
    const result = await db.getAllAsync(query, weekDates);
    const existingRows = result as ScheduleAPIRecord[];

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getDoctorsTodaySchedLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
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

export const getDoctorsWeekSchedLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
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

  const weekDates = await getWeekdaysRange();
  const placeholders = weekDates.map(() => '?').join(', ');
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) IN (${placeholders})`;

  try {
    const result = await db.getAllAsync(query, weekDates);
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
      signature_location TEXT,
      signature_attempts TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
      signature_location TEXT,
      signature_attempts TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP 
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

export const deleteCallByScheduleIdLocalDb = async ({ scheduleId }: { scheduleId: string }) => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  try {
    await db.runAsync(
      `DELETE FROM schedule_API_tbl WHERE schedule_id = ?`,
      scheduleId
    );

  console.log(`Successfully deleted done scheduled call notes for scheduleId: ${scheduleId}`);

  } catch (error) {
    console.error('Error deleting records for today:', error);
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

export const deleteDoctorsTodayLocalDb = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  const tableExistsQuery = `
    SELECT name FROM sqlite_master WHERE type='table' AND name='doctors_tbl';
  `;

  try {
    const tableResult = await db.getAllAsync(tableExistsQuery);
    if (tableResult.length === 0) {
      console.log('Table doctors_tbl does not exist.');
      return; 
    }

    const currentDate = await getCurrentDatePH();
    const deleteQuery = `DELETE FROM doctors_tbl WHERE DATE(date) = ?`;

    const result = await db.getAllAsync(deleteQuery, [currentDate]);
    console.log('Records [doctors_tbl] deleted successfully.', result);

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

export const fetchAllDetailers = async (): Promise<DetailerRecord[]> => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  try {
    const query = `SELECT image, category FROM detailers_tbl`;
    const result = await db.getAllAsync(query);

    const rows: { image: string; category: string }[] = result as { image: string; category: string }[];

    const detailerRecords: DetailerRecord[] = [];
    const categoryMap: { [key: string]: string[] } = {};

    rows.forEach((row) => {
      if (!categoryMap[row.category]) {
        categoryMap[row.category] = [];
      }
      categoryMap[row.category].push(row.image);
    });

    for (const category in categoryMap) {
      detailerRecords.push({
        category,
        images: categoryMap[category],
      });
    }

    return detailerRecords;
  } catch (error) {0
    console.error("Error fetching detailer images:", error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const saveCallsDoneFromSchedules = async (scheduleId: string, callDetails: SchedToCall): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', { useNewConnection: true });

  console.log('saveCallsDoneFromSchedules callDetails:', callDetails);

  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS calls_tbl (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
        schedule_id TEXT, 
        call_start TEXT, 
        call_end TEXT, 
        municipality_city TEXT, 
        photo TEXT, 
        photo_location TEXT,
        signature TEXT, 
        signature_location TEXT,
        signature_attempts TEXT,
        doctor_name TEXT,
        created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP 
      );
    `);

    await db.runAsync(
      `INSERT INTO calls_tbl (
        schedule_id, call_start, call_end,
        signature, signature_attempts, signature_location,
        photo, photo_location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        callDetails.schedule_id,
        callDetails.call_start,
        callDetails.call_end,
        callDetails.signature,
        callDetails.signature_attempts,
        callDetails.signature_location,
        callDetails.photo,
        callDetails.photo_location
      ]
    );

    await deleteCallByScheduleIdLocalDb({ scheduleId });

    // const testRecords = await db.getAllAsync('SELECT * FROM calls_tbl WHERE schedule_id = ?', [scheduleId]);
    // console.log('CHECK NEW CALL IN CALLS_TBL', testRecords);

    return 'Success';
  } catch (error) {
    console.error('Error in saveCallsDoneFromSchedules:', error);
    return 'Failed to process calls done';
  }
};

export const updateDoctorNotes = async (doctorsNotes: UpdateDoctorsNotes ) : Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  try{
  const existingRow = await db.getFirstAsync(
    `SELECT * FROM doctors_tbl WHERE doctors_id = ?`,
    [doctorsNotes.doctors_id],
  );

  if (existingRow) {
    await db.runAsync(
        `UPDATE doctors_tbl SET notes_names = ?, notes_values = ?, update_date = CURRENT_TIMESTAMP WHERE doctors_id = ?`,
        [doctorsNotes.notes_names, doctorsNotes.notes_values, doctorsNotes.doctors_id]
      );
  }
  // const test = await db.getFirstAsync(
  //   `SELECT * FROM doctors_tbl WHERE doctors_id = ?`,
  //   [doctorsNotes.doctors_id],
  // );
  // console.log(test, 'askdjaslkdj');
    return 'Success';
  } catch (error) {
    console.error('Error in updateDoctorNotes:', error);
    return 'Failed to process updateDoctorNotes';
  } finally {
    db.closeSync();
  }
}

export const deleteDoctorNotes = async (doctorsNotes: UpdateDoctorsNotes): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  try {
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM doctors_tbl WHERE doctors_id = ?`,
      [doctorsNotes.doctors_id],
    );
  
    if (existingRow) {
      const existingRow = await db.getFirstAsync(
        `SELECT * FROM doctors_tbl WHERE doctors_id = ?`,
        [doctorsNotes.doctors_id],
      );
    
      if (existingRow) {
        await db.runAsync(
            `UPDATE doctors_tbl SET notes_names = ?, notes_values = ?, update_date = CURRENT_TIMESTAMP WHERE doctors_id = ?`,
            [doctorsNotes.notes_names, doctorsNotes.notes_values, doctorsNotes.doctors_id]
          );
      }

      return "Success";
    } else {
      console.log('No existing row found for doctors_id:', doctorsNotes.doctors_id);
      return "Failed";
    }
  } catch (error) {
    console.error('Error deleting records for today:', error);
    return "Failed";
  } finally {
    await db.closeAsync();
  }
};


export const addDoctorNotes = async (doctorsNotes: UpdateDoctorsNotes): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  try {
    const existingRow: ExistingDoctorNotesRow | null = await db.getFirstAsync<ExistingDoctorNotesRow>(
      `SELECT * FROM doctors_tbl WHERE doctors_id = ?`,
      [doctorsNotes.doctors_id]
    );

    if (existingRow) {
      let existingNames: string[] = existingRow.notes_names ? existingRow.notes_names.split(',') : [];
      let existingValues: string[] = existingRow.notes_values ? existingRow.notes_values.split(',') : [];

      if (!existingNames.includes(doctorsNotes.notes_names) && !existingValues.includes(doctorsNotes.notes_values)) {
        existingNames.push(doctorsNotes.notes_names);
        existingValues.push(doctorsNotes.notes_values);
      }

      const updatedNames: string = existingNames.join(',');
      const updatedValues: string = existingValues.join(',');

      await db.runAsync(
        `UPDATE doctors_tbl SET notes_names = ?, notes_values = ?, update_date = CURRENT_TIMESTAMP WHERE doctors_id = ?`,
        [updatedNames, updatedValues, doctorsNotes.doctors_id]
      );
    } else {
      await db.runAsync(
        `UPDATE doctors_tbl SET notes_names = ?, notes_values = ? WHERE doctors_id = ?`,
        [ doctorsNotes.notes_names, doctorsNotes.notes_values, doctorsNotes.doctors_id]
      );
    }
    return "Success";
  } catch (error) {
    console.error('Error adding doctor notes:', error);
    return "Failed";
  } finally {
    await db.closeAsync();
  }
};


export const uploadImage = async ({ base64Images, category }: UploadImageProps) => {
  if (base64Images.length > 0) {
    try {
      const db = await SQLite.openDatabaseAsync("cmms", {
        useNewConnection: true,
      });

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS detailers_tbl (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
          category TEXT NOT NULL, 
          image TEXT NOT NULL
        );
      `);

      await db.runAsync(`DELETE FROM detailers_tbl WHERE category = ?`, [category]);

      for (const image of base64Images) {
        await db.runAsync(
          `INSERT INTO detailers_tbl (category, image) VALUES (?, ?)`,
          [category, image]
        );
      }

      console.log("Images uploaded successfully.");
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  } else {
    console.log("No images provided.");
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
      schedule_id INTEGER, 
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
      schedule_id: 1,
      call_start: '10:00:00',
      call_end: '10:30:00',
      signature: 'dummySignature1',
      signature_attempts: '1',
      signature_location: 'dummyLocation1',
      photo: 'dummyPhoto1',
      photo_location: 'dummyPhotoLocation1'
    },
    {
      schedule_id: 2,
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
          schedule_id, call_start, call_end,
          signature, signature_attempts, signature_location,
          photo, photo_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        record.schedule_id,
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

  const tableNames = ['user_attendance_tbl', 'schedule_API_tbl', 'calls_tbl', 'user_sync_history_tbl','quick_call_tbl','doctors_tbl','pre_call_notes_tbl','post_call_notes_tbl'];
  // const tableNames = ['user_attendance_tbl', 'schedule_API_tbl', 'user_sync_history_tbl'];
  // const tableNames = ['quick_call_tbl'];
  for (const tableName of tableNames) {
    const query = `DROP TABLE IF EXISTS ${tableName};`;
    await db.getAllAsync(query);
    console.log(tableName, 'has been dropped');
  }

  await db.closeAsync();
}