import * as SQLite from "expo-sqlite";
import { formatDate, formatDateYMD, getCurrentDatePH, getRelevantDateRange, getWeekdaysRange } from "./dateUtils"; 
import moment from "moment";

// ************************************************************
// ************************************************************
// STATIC CREATE TABLE SQL START
// ************************************************************
// ************************************************************
const dropCreateCallsTable = `
  DROP TABLE IF EXISTS calls_tbl;
  PRAGMA journal_mode = WAL;
  CREATE TABLE calls_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    date TEXT, 
    ts_name TEXT, 
    schedule_id TEXT, 
    doctors_name TEXT, 
    call_start TEXT, 
    call_end TEXT, 
    signature TEXT, 
    signature_attempts TEXT, 
    signature_location TEXT, 
    photo TEXT, 
    photo_location TEXT,
    created_at TEXT,
    created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP 
  );
`;
const dropCreate_scheduleAPI = `
    DROP TABLE IF EXISTS schedule_API_tbl;
    PRAGMA journal_mode = WAL;
    CREATE TABLE schedule_API_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      address TEXT, 
      date TEXT, 
      doctors_id TEXT, 
      full_name TEXT, 
      municipality_city TEXT, 
      province TEXT,
      schedule_id TEXT
    );
`;
const dropCreate_Doctors = `
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
`;
const dropCreate_Reschedule = `
    DROP TABLE IF EXISTS reschedule_req_tbl;
    
    PRAGMA journal_mode = WAL;
    CREATE TABLE reschedule_req_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      request_id TEXT,
      schedule_id TEXT,
      sales_portal_id TEXT,
      doctors_id TEXT,
      date_from TEXT,
      date_to TEXT,
      status TEXT,
      type TEXT,
      created_at TEXT,
      full_name TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;
const dropCreate_chartData = `
    DROP TABLE IF EXISTS chart_data_tbl;
    PRAGMA journal_mode = WAL;
    CREATE TABLE chart_data_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      daily_plotting_count TEXT,
      daily_calls_count TEXT,
      daily_target_count INTEGER,
      monthly_plotting_count TEXT,
      monthly_calls_count TEXT,
      monthly_target_count INTEGER,
      yearly_plotting_count TEXT,
      yearly_calls_count TEXT,
      yearly_target_count INTEGER,
      ytd_plotting_count TEXT,
      ytd_calls_count TEXT, 
      ytd_target_count TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;
const dropCreate_detailersData = `
    DROP TABLE IF EXISTS detailers_tbl;
    PRAGMA journal_mode = WAL;
    CREATE TABLE detailers_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      category TEXT,
      detailers TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;
const createIfNE_userAttendance = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS user_attendance_tbl (
    id INTEGER PRIMARY KEY NOT NULL, 
    email TEXT NOT NULL, 
    sales_portal_id TEXT NOT NULL, 
    type TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;
const createIfNE_userSyncHistory = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS user_sync_history_tbl (
    id INTEGER PRIMARY KEY NOT NULL, 
    sales_portal_id TEXT NOT NULL, 
    type NUMBER NOT NULL,
    date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;
const createIfNE_rescheduleHistory =`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS reschedule_history_tbl (
    id INTEGER PRIMARY KEY NOT NULL, 
    sales_portal_id TEXT, 
    request_id TEXT, 
    schedule_id TEXT, 
    type NUMBER,
    status NUMBER,
    date_from TEXT,
    date_to TEXT,
    doctors_id TEXT,
    full_name TEXT,
    date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;
const createIfNEchartData = `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS chart_data_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      daily_plotting_count TEXT,
      daily_calls_count TEXT,
      daily_target_count INTEGER,
      monthly_plotting_count TEXT,
      monthly_calls_count TEXT,
      monthly_target_count INTEGER,
      yearly_plotting_count TEXT,
      yearly_calls_count TEXT,
      yearly_target_count INTEGER,
      ytd_plotting_count TEXT,
      ytd_calls_count TEXT, 
      ytd_target_count TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;
const createIfNEdetailersData = `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS detailers_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      category TEXT,
      detailers TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;
const createIfNEDoctors = `
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
`;
const createIfNERescheduleReq = `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS reschedule_req_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      request_id TEXT,
      schedule_id TEXT,
      sales_portal_id TEXT,
      doctors_id TEXT,
      date_from TEXT,
      date_to TEXT,
      status TEXT,
      type TEXT,
      created_at TEXT,
      full_name TEXT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;
const createIfNEscheduleAPI = `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schedule_API_tbl (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      schedule_id TEXT, 
      address TEXT, 
      date TEXT, 
      doctors_id TEXT, 
      full_name TEXT, 
      municipality_city TEXT, 
      province TEXT
    );
`;
const createIfNECalls = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS calls_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
      schedule_id TEXT, 
      ts_name TEXT, 
      call_start TEXT, 
      call_end TEXT, 
      date TEXT, 
      doctors_name TEXT, 
      municipality_city TEXT, 
      photo TEXT, 
      photo_location TEXT, 
      province TEXT, 
      signature TEXT, 
      signature_location TEXT,
      signature_attempts TEXT,
      created_at TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;
const createIfNEDetailers = `
  CREATE TABLE IF NOT EXISTS detailers_tbl (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
    category TEXT,
    detailers TEXT,
    created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;
// ************************************************************
// ************************************************************
// STATIC CREATE TABLE SQL END
// ************************************************************
// ************************************************************

export const saveUserAttendanceLocalDb = async (user: User, type: string): Promise<number> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true
  });

  const currentDatePH = await getCurrentDatePH();

  await db.execAsync(createIfNE_userAttendance);

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
      result = 0;
    } else {
      console.log('User already timed in today');
      result = 1;
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

  await db.execAsync(createIfNE_userSyncHistory);

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

export const saveRescheduleHistoryLocalDb = async (rescheduleDetails : RescheduleDetails[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNE_rescheduleHistory);

  const insertPromises = rescheduleDetails.map((reschedules: RescheduleDetails) => {
    return db.execAsync(`
      INSERT INTO reschedule_history_tbl (schedule_id, sales_portal_id, request_id, type, status, date_from, date_to, doctors_id, full_name)
      VALUES (
        ${reschedules.schedule_id !== undefined && reschedules.schedule_id !== null ? `'${reschedules.schedule_id}'` : 'NULL'},
        ${reschedules.sales_portal_id !== undefined && reschedules.sales_portal_id !== null ? `'${reschedules.sales_portal_id}'` : 'NULL'},
        ${reschedules.request_id !== undefined && reschedules.request_id !== null ? `'${reschedules.request_id}'` : 'NULL'},
        ${reschedules.type !== undefined && reschedules.type !== null ? `'${reschedules.type}'` : 'NULL'},
        ${reschedules.status !== undefined && reschedules.status !== null ? `'${reschedules.status}'` : 'NULL'},
        ${reschedules.date_from !== undefined && reschedules.date_from !== null ? `'${reschedules.date_from}'` : 'NULL'},
        ${reschedules.date_to !== undefined && reschedules.date_to !== null ? `'${reschedules.date_to}'` : 'NULL'},
        ${reschedules.doctors_id !== undefined && reschedules.doctors_id !== null ? `'${reschedules.doctors_id}'` : 'NULL'},
        ${reschedules.full_name !== undefined && reschedules.full_name !== null ? `'${reschedules.full_name}'` : 'NULL'}
      );
    `);
  });

  try {
    await Promise.all(insertPromises);
      // const testRecords = await db.getAllAsync('SELECT * FROM schedule_API_tbl');
      // console.log('All actual calls records test:', testRecords);
    return 'Success';
  } catch (error) {
    console.error('Error saving data: saveRescheduleHistoryLocalDb', error);
    return 'Failed to save data';
  }
};

export const saveSchedulesAPILocalDb = async (schedules: ScheduleAPIRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(dropCreate_scheduleAPI);

  const insertPromises = schedules.map((schedule: ScheduleAPIRecord) => {
    return db.execAsync(`
      INSERT INTO schedule_API_tbl (schedule_id, address, doctors_id, date, municipality_city, province, full_name)
      VALUES (
        ${schedule.id !== undefined && schedule.id !== null ? `'${schedule.id}'` : 'NULL'},
        ${schedule.address !== undefined && schedule.address !== null ? `'${schedule.address}'` : 'NULL'},
        ${schedule.doctors_id !== undefined && schedule.doctors_id !== null ? `'${schedule.doctors_id}'` : 'NULL'},
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
      // console.log(testRecords,'asdasd saveSchedulesAPILocalDb');
    return 'Success';
  } catch (error) {
    console.error('Error saving data: asdasdasdasdasd', error);
    return 'Failed to save data';
  }
};

export const saveCallsAPILocalDb = async (calls: CallAPIRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(dropCreateCallsTable);

  const insertPromises = calls.map((calls: CallAPIRecord) => {
    return db.execAsync(`
      INSERT INTO calls_tbl (date,
                              ts_name,
                              schedule_id,
                              doctors_name,
                              call_start,
                              call_end,
                              signature,
                              signature_attempts,
                              signature_location,
                              photo,
                              photo_location,
                              created_at
                              )
      VALUES (
        ${calls.date !== undefined && calls.date !== null ? `'${calls.date}'` : 'NULL'},
        ${calls.ts_name !== undefined && calls.ts_name !== null ? `'${calls.ts_name}'` : 'NULL'},
        ${calls.schedule_id !== undefined && calls.schedule_id !== null ? `'${calls.schedule_id}'` : 'NULL'},
        ${calls.doctors_name !== undefined && calls.doctors_name !== null ? `'${calls.doctors_name}'` : 'NULL'},
        ${calls.call_start !== undefined && calls.call_start !== null ? `'${calls.call_start}'` : 'NULL'},
        ${calls.call_end !== undefined && calls.call_end !== null ? `'${calls.call_end}'` : 'NULL'},
        ${calls.signature !== undefined && calls.signature !== null ? `'${calls.signature}'` : 'NULL'},
        ${calls.signature_attempts !== undefined && calls.signature_attempts !== null ? `'${calls.signature_attempts}'` : 'NULL'},
        ${calls.signature_location !== undefined && calls.signature_location !== null ? `'${calls.signature_location}'` : 'NULL'},
        ${calls.photo !== undefined && calls.photo !== null ? `'${calls.photo}'` : 'NULL'},
        ${calls.photo_location !== undefined && calls.photo_location !== null ? `'${calls.photo_location}'` : 'NULL'},
        ${calls.created_at !== undefined && calls.created_at !== null ? `'${calls.created_at}'` : 'NULL'}
      );
    `);
  });

  try {
    await Promise.all(insertPromises);
      // const testRecords = await db.getAllAsync('SELECT * FROM calls_tbl');
      // console.log(calls,'callscallscallscallscalls');
      // console.log(testRecords,'saveCallsAPILocalDb saveCallsAPILocalDb');
    return 'Success';
  } catch (error) {
    console.error('Error saving data: saveCallsAPILocalDb', error);
    return 'Failed to save data';
  }
};

export const saveDoctorListLocalDb = async (doctors: DoctorRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(dropCreate_Doctors);

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

export const saveRescheduleListLocalDb = async (request: RescheduleRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(dropCreate_Reschedule);

  const insertPromises = request.map((request: RescheduleRecord) => {
    return db.execAsync(`
      INSERT INTO reschedule_req_tbl (
      request_id,
      schedule_id,
      sales_portal_id,
      doctors_id,
      date_from,
      date_to,
      status,
      type,
      created_at,
      full_name
      )
      VALUES (
        ${request.request_id !== undefined && request.request_id !== null ? `'${request.request_id}'` : 'NULL'},
        ${request.schedule_id !== undefined && request.schedule_id !== null ? `'${request.schedule_id}'` : 'NULL'},
        ${request.sales_portal_id !== undefined && request.sales_portal_id !== null ? `'${request.sales_portal_id}'` : 'NULL'},
        ${request.doctors_id !== undefined && request.doctors_id !== null ? `'${request.doctors_id}'` : 'NULL'},
        ${request.date_from !== undefined && request.date_from !== null ? `'${request.date_from}'` : 'NULL'},
        ${request.date_to !== undefined && request.date_to !== null ? `'${request.date_to}'` : 'NULL'},
        ${request.status !== undefined && request.status !== null ? `'${request.status}'` : 'NULL'},
        ${request.type !== undefined && request.type !== null ? `'${request.type}'` : 'NULL'},
        ${request.created_at !== undefined && request.created_at !== null ? `'${request.created_at}'` : 'NULL'},
        ${request.full_name !== undefined && request.full_name !== null ? `'${request.full_name}'` : 'NULL'}
      );
    `);
  });

  try {
    await Promise.all(insertPromises);

    const query = `SELECT * FROM reschedule_req_tbl`;
    // const existingRows = await db.getAllAsync(query);
    //  console.log('test test existingRows reschedule_req_tbl', existingRows);
    return 'Success';
  } catch (error) {
    console.error('Error saving data:44444444444444', error);
    return 'Failed to save data';
  }
};

export const saveChartDataLocalDb = async (chartData: ChartDashboardRecord | ChartDashboardRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(dropCreate_chartData);

  const dataToInsert = Array.isArray(chartData) ? chartData : [chartData];

  const insertPromises = dataToInsert.map((chart: ChartDashboardRecord) => {
    return db.execAsync(`
      INSERT INTO chart_data_tbl (
        daily_plotting_count,
        daily_calls_count,
        daily_target_count,
        monthly_plotting_count,
        monthly_calls_count,
        monthly_target_count,
        yearly_plotting_count,
        yearly_calls_count,
        yearly_target_count,
        ytd_plotting_count,
        ytd_calls_count,
        ytd_target_count
      ) VALUES (
        ${chart.daily.plottingCount !== undefined && chart.daily.plottingCount !== null ? `'${chart.daily.plottingCount}'` : 'NULL'},
        ${chart.daily.callsCount !== undefined && chart.daily.callsCount !== null ? `'${chart.daily.callsCount}'` : 'NULL'},
        ${chart.daily.targetCount !== undefined && chart.daily.targetCount !== null ? chart.daily.targetCount : 'NULL'},
        ${chart.monthly.plottingCount !== undefined && chart.monthly.plottingCount !== null ? `'${chart.monthly.plottingCount}'` : 'NULL'},
        ${chart.monthly.callsCount !== undefined && chart.monthly.callsCount !== null ? `'${chart.monthly.callsCount}'` : 'NULL'},
        ${chart.monthly.targetCount !== undefined && chart.monthly.targetCount !== null ? chart.monthly.targetCount : 'NULL'},
        ${chart.yearly.plottingCount !== undefined && chart.yearly.plottingCount !== null ? `'${chart.yearly.plottingCount}'` : 'NULL'},
        ${chart.yearly.callsCount !== undefined && chart.yearly.callsCount !== null ? `'${chart.yearly.callsCount}'` : 'NULL'},
        ${chart.yearly.targetCount !== undefined && chart.yearly.targetCount !== null ? chart.yearly.targetCount : 'NULL'},
        '${JSON.stringify(chart.ytd.plottingCount)}',
        '${JSON.stringify(chart.ytd.callsCount)}',
        '${JSON.stringify(chart.ytd.targetCount)}'
      );
    `);
  });

  try {
    await Promise.all(insertPromises);

    // const query = `SELECT * FROM chart_data_tbl`;
    // const existingRows = await db.getAllAsync(query);
    // console.log('test test existingRows chart_data_tbl', existingRows);
    return 'Success';
  } catch (error) {
    console.error('Error saving data:chart_data_tbl:saveChartDataLocalDb', error);
    return 'Failed to save data';
  }
};

export const saveDetailersDataLocalDb = async (detailersData: DetailersDataRecord | DetailersDataRecord[]): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(dropCreate_detailersData);
  const insertPromises = Array.isArray(detailersData) ? detailersData : [detailersData];

  try {
    await Promise.all(insertPromises.map(async (detail) => {
      let coreDetailersJSON = Array.isArray(detail.coreDetailers) ? detail.coreDetailers : JSON.parse(detail.coreDetailers || '[]');
      let secondaryDetailersJSON = Array.isArray(detail.secondaryDetailers) ? detail.secondaryDetailers : JSON.parse(detail.secondaryDetailers || '[]');
      let reminderDetailersJSON = Array.isArray(detail.reminderDetailers) ? detail.reminderDetailers : JSON.parse(detail.reminderDetailers || '[]');

      const coreDetailersValues = coreDetailersJSON.map((item: any) => item.detailer).join(',');
      const secondaryDetailersValues = secondaryDetailersJSON.map((item: any) => item.detailer).join(',');
      const reminderDetailersValues = reminderDetailersJSON.map((item: any) => item.detailer).join(',');

      await db.runAsync(
        `INSERT INTO detailers_tbl (category, detailers) VALUES (?, ?)`,
        ['1', coreDetailersValues] 
      );

      await db.runAsync(
        `INSERT INTO detailers_tbl (category, detailers) VALUES (?, ?)`,
        ['2', secondaryDetailersValues] 
      );

      await db.runAsync(
        `INSERT INTO detailers_tbl (category, detailers) VALUES (?, ?)`,
        ['3', reminderDetailersValues]
      );
    }));

    // const query = `SELECT * FROM detailers_tbl`;
    // const existingRows = await db.getAllAsync(query);
    // console.log('GUMANA:', existingRows);

    return 'Success';
  } catch (error) {
    console.error('Error saving detailers data:', error);
    return 'Error saving data';
  }
};



export const fetchChartDataLocalDb = async (): Promise<ChartDashboardRecord[]> =>{
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEchartData);

  const query = `SELECT * FROM chart_data_tbl`;

  try {
    const existingRows = await db.getAllAsync(query);
    // console.log('Fetched data from chart_data_tbl:', existingRows);

    return existingRows as ChartDashboardRecord[];
  } catch (error) {
    console.error('Error fetching data from chart_data_tbl:', error);
    throw new Error('Failed to fetch data');
  }
};

export const fetchDetailersDataLocalDb = async (): Promise<DetailersRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEDetailers);

  try {
    const query = `SELECT * FROM detailers_tbl`;
    const existingRows = await db.getAllAsync(query);
    // console.log('GUMANA123:', existingRows);

    return existingRows as DetailersRecord[];
  } catch (error) {
    console.error('Error fetching data from detailers_tbl:', error);
    throw new Error('Failed to fetch data');
  }
};

export const getDoctorRecordsLocalDb = async () => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEDoctors);

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

export const getRescheduleListLocalDb = async (): Promise<RescheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNERescheduleReq);

  const query = `SELECT * FROM reschedule_req_tbl`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as RescheduleRecord[];
    // console.log('existingRows getRescheduleListLocalDb', existingRows);
    // const testRecords = await db.getAllAsync('SELECT * FROM reschedule_req_tbl');
    // console.log(testRecords,'reschedule_req_tbl');
    return existingRows; 
  } catch (error) {
    console.error('Error fetching reschedule request data:', error);
    return []; 
  } finally {
    await db.closeAsync(); 
  }
};

export const getUpdatedDoctorRecordsLocalDb = async (): Promise<UpdateDoctorsNotes[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEDoctors);

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

export const getRescheduleRequestRecordsLocalDb = async (): Promise<RescheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNERescheduleReq);

  const query = `SELECT * FROM reschedule_req_tbl`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as RescheduleRecord[];
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

  await db.execAsync(createIfNE_userAttendance);

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

  await db.execAsync(createIfNE_userSyncHistory);

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

  await db.execAsync(createIfNE_rescheduleHistory);

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

export const getStatusRescheduleHistoryRecords = async (request_id: string) => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNE_rescheduleHistory);

  const query = `SELECT * FROM reschedule_history_tbl WHERE request_id = ?`;

  try {
    const existingRows = await db.runAsync(query, [request_id]);
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

  await db.execAsync(createIfNEscheduleAPI);

  const query = `SELECT * FROM schedule_API_tbl`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as ScheduleAPIRecord[];
    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data1:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getSchedulesTodayLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);

  const currentDate = await getCurrentDatePH();
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) = ?`;

  try {
    const result = await db.getAllAsync(query, [currentDate]);
    const existingRows = result as ScheduleAPIRecord[];
    // const testRecords = await db.getAllAsync('SELECT * FROM schedule_API_tbl');
    // console.log(testRecords,existingRows,'asdasd asdasdas');
    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data2:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getSchedulesWeekLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);

  const weekDates = await getWeekdaysRange();
  const placeholders = weekDates.map(() => '?').join(', ');
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) IN (${placeholders})`;

  try {
    const result = await db.getAllAsync(query, weekDates);
    const existingRows = result as ScheduleAPIRecord[];
    // const testRecords = await db.getAllAsync('SELECT * FROM schedule_API_tbl');
    // console.log(testRecords,existingRows,'asdasd asdasdas');

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data3:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getSchedulesFilterLocalDb = async (date: Date): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);
  const formattedDate = moment(date).format('YYYY-MM-DD');
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) = ?`;
  try {
    const result = await db.getAllAsync(query , [formattedDate]);
    const existingRows = result as ScheduleAPIRecord[];
    // const testRecords = await db.getAllAsync('SELECT * FROM schedule_API_tbl');
    // console.log(testRecords,existingRows,'asdasd asdasdas');

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data3:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getActualFilterLocalDb = async (date: Date): Promise<ScheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNECalls);
  const formattedDate = moment(date).format('YYYY-MM-DD');
  const query = `SELECT * FROM calls_tbl WHERE DATE(created_at) = ?`;
  try {
    const result = await db.getAllAsync(query , [formattedDate]);
    const existingRows = result as ScheduleRecord[];
    // const testRecords = await db.getAllAsync('SELECT * FROM calls_tbl');
    // console.log(testRecords,existingRows,'asdasd asdasdas');

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data3:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getAllSchedulesFilterLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);
  const query = `SELECT * FROM schedule_API_tbl`;
  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as ScheduleAPIRecord[];
    // const testRecords = await db.getAllAsync('SELECT * FROM schedule_API_tbl');
    // console.log(testRecords,existingRows,'asdasd asdasdas');

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data3:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getDatesAndTypeForCalendarView = async (): Promise<CalendarRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);
  await db.execAsync(createIfNECalls);
  await db.execAsync(createIfNERescheduleReq);

  const qMakeup = `SELECT date_to FROM reschedule_req_tbl WHERE type = ? AND status = ?`;
  const qAdvance = `SELECT date_to FROM reschedule_req_tbl WHERE type = ? AND status = ?`;

  try {
    const qMakeupResult: { date_to: string }[] = await db.getAllAsync(qMakeup, ['Makeup', '1']);
    const qAdvanceResult: { date_to: string}[] = await db.getAllAsync(qAdvance, ['Advance', '1']);
    const qSched: { date: string }[] = await db.getAllAsync(`SELECT date FROM schedule_API_tbl`);
    const qCalls: { date: string , created_at: string  }[] = await db.getAllAsync(`SELECT date, created_at FROM calls_tbl`);
    
    const data: CalendarRecord = {
      plotData: Array.from(new Set(qSched.map(record => parseInt((record.date || '0000-00-00').split('-')[2])))).map(String),
      advanceData: Array.from(new Set([
        ...qAdvanceResult.map(record => parseInt((record.date_to || '0000-00-00').split('-')[2])),
        ...qCalls
          .filter(record => new Date(record.created_at) < new Date(record.date || '0000-00-00'))
          .map(record => parseInt((record.created_at || '0000-00-00').split('-')[2]))
      ])).map(String),
      makeupData: Array.from(new Set(qMakeupResult.map(record => parseInt((record.date_to || '0000-00-00').split('-')[2])))).map(String),
      actualData: Array.from(new Set(qCalls.filter(record => new Date(record.created_at) > new Date(record.date || '0000-00-00')).map(record => parseInt((record.created_at || '0000-00-00').split('-')[2])))).map(String)
    };

    return [data];
  } catch (error) {
    console.error('Error fetching schedule records data getDatesAndTypeForCalendarView:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getDoctorsTodaySchedLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);

  const currentDate = await getCurrentDatePH();
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) = ?`;

  try {
    const result = await db.getAllAsync(query, [currentDate]);
    const existingRows = result as ScheduleAPIRecord[];

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data5:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getDoctorsSchedLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);

  const query = `SELECT * FROM schedule_API_tbl`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as ScheduleAPIRecord[];

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data5:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getDoctorsWeekSchedLocalDb = async (): Promise<ScheduleAPIRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNEscheduleAPI);

  const weekDates = await getWeekdaysRange();
  const placeholders = weekDates.map(() => '?').join(', ');
  const query = `SELECT * FROM schedule_API_tbl WHERE DATE(date) IN (${placeholders})`;

  try {
    const result = await db.getAllAsync(query, weekDates);
    const existingRows = result as ScheduleAPIRecord[];

    return existingRows;
  } catch (error) {
    console.error('Error fetching schedule records data6:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getCallsLocalDb = async (): Promise<ScheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNECalls);

  const query = `SELECT * FROM calls_tbl`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as ScheduleRecord[];
    // console.log(existingRows,'getCallsLocaldb');
    return existingRows;
  } catch (error) {
    console.error('Error fetching data for getCallsLocalDb:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getAllActualDatesFilter = async (): Promise<ScheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNECalls);

  const query = `SELECT * FROM calls_tbl`;

  try {
    const result = await db.getAllAsync(query);
    const existingRows = result as ScheduleRecord[];
    return existingRows;
  } catch (error) {
    console.error('Error fetching data for getCallsLocalDb:', error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const getCallsTodayLocalDb = async (): Promise<ScheduleRecord[]> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  await db.execAsync(createIfNECalls);

  const currentDate = await getCurrentDatePH();
  const query = `SELECT * FROM calls_tbl WHERE DATE(created_at) = ?`;

  try {
    const result = await db.getAllAsync(query, [currentDate]);
    const existingRows = result as ScheduleRecord[];

        // const testRecords = await db.getAllAsync('SELECT schedule_id, created_date, created_at FROM calls_tbl');
        // console.log('CHECK NEW CALL IN CALLS_TBL', testRecords);

    return existingRows;
  } catch (error) {
    console.error('Error fetching data for today: getCallsTodayLocalDb', error);
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

export const deleteRescheduleRequestLocalDb = async (): Promise<void> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  const tableExistsQuery = `
    SELECT name FROM sqlite_master WHERE type='table' AND name='reschedule_req_tbl';
  `;

  try {
    const tableResult = await db.getAllAsync(tableExistsQuery);
    if (tableResult.length === 0) {
      console.log('Table doctors_tbl does not exist.');
      return; 
    }

    const deleteQuery = `DELETE FROM reschedule_req_tbl`;
    const result = await db.getAllAsync(deleteQuery);

  } catch (error) {
    console.error('Error deleting records for today:', error);
  } finally {
    await db.closeAsync();
  }
};

export const fetchAllDetailers = async (): Promise<DetailersRecord[]> => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  try {
    await db.execAsync(createIfNEdetailersData);
    const query = `SELECT detailers, category, created_date, id FROM detailers_tbl`;
    const result = await db.getAllAsync(query) as DetailersRecord[];

    return result;
  } catch (error) {
    console.error("Error fetching detailer records: fetchAllDetailers", error);
    return [];
  } finally {
    await db.closeAsync();
  }
};


export const saveCallsDoneFromSchedules = async (scheduleId: string, callDetails: SchedToCall): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', { useNewConnection: true });

  try {
    await db.execAsync(createIfNECalls);

    await db.runAsync(
      `INSERT INTO calls_tbl (
        schedule_id, call_start, call_end,
        signature, signature_attempts, signature_location,
        photo, photo_location, doctors_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        callDetails.schedule_id,
        callDetails.call_start,
        callDetails.call_end,
        callDetails.signature,
        callDetails.signature_attempts,
        callDetails.signature_location,
        callDetails.photo,
        callDetails.photo_location,
        callDetails.doctors_name,
        callDetails.created_at
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

export const insertRescheduleRequest =  async (request: RescheduleRecord): Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', { useNewConnection: true });

  try {

    const existingRow = await db.getFirstAsync(`SELECT id FROM reschedule_req_tbl WHERE doctors_id = ? AND date_from = ?`,[request.doctors_id, request.date_from]);

    if(!existingRow){
      await db.execAsync(createIfNERescheduleReq);
  
      await db.runAsync(
        `INSERT INTO reschedule_req_tbl (
          request_id, schedule_id, sales_portal_id,
          doctors_id, date_from, date_to,
          status, type, full_name, created_at 
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? , CURRENT_TIMESTAMP)`,
        [
          request.request_id,
          request.schedule_id,
          request.sales_portal_id,
          request.doctors_id,
          request.date_from,
          request.date_to,
          request.status,
          request.type,
          request.full_name,
        ]
      );
  
      return 'Success';
    }else{
      // const testRecords = await db.getAllAsync('SELECT * FROM reschedule_req_tbl');
      // console.log('CHECK NEW CALL IN reschedule_req_tbl', testRecords);
      return 'Existing';
    }

  } catch (error) {
    console.error('Error in insertRescheduleRequest:', error);
    return 'Failed to process calls done';
  } finally {
    db.closeSync();
  }
};

export const deleteRescheduleReqLocalDb = async (id : string ) => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  try {
    await db.runAsync(
      `DELETE FROM reschedule_req_tbl WHERE id = ?`,
      id
    );

    // const test = await db.getAllAsync(`SELECT * FROM reschedule_req_tbl`);
    // console.log(test);

  } catch (error) {
    console.error('Error deleting records for today:', error);
  } finally {
    await db.closeAsync();
  }
};

export const cancelRescheduleReqLocalDb = async (id: string) => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  try {
    await db.runAsync(
      `UPDATE reschedule_req_tbl SET status = ? WHERE id = ?`,
      "4", 
      id
    );
    // const test = await db.getAllAsync(`SELECT * FROM reschedule_req_tbl`);
    // console.log(test);
  } catch (error) {
    console.error('Error updating status:', error);
  } finally {
    await db.closeAsync();
  }
};

export const undoCancelRescheduleReqLocalDb = async (id: string, request_id: string) : Promise<string> => {
  const db = await SQLite.openDatabaseAsync('cmms', {
    useNewConnection: true,
  });

  try {
    const existingRow : any = await db.getFirstAsync(
      `SELECT status FROM reschedule_history_tbl WHERE request_id = ?`,
      [request_id],
    );

    await db.runAsync(
      `UPDATE reschedule_req_tbl SET status = ? WHERE id = ?`,
      existingRow.status, 
      id
    );
    
    // const test = await db.getAllAsync(`SELECT * FROM reschedule_req_tbl`);
    // console.log(test);

    return existingRow.status;
  } catch (error) {
    console.error('Error updating status123123123:', error);
    return "Failed";
  } finally {
    await db.closeAsync();
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

      await db.execAsync(createIfNEDetailers);

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

  const tableNames = ['detailers_tbl','quick_call_tbl','reschedule_history_tbl','reschedule_req_tbl','user_attendance_tbl', 'schedule_API_tbl', 'calls_tbl', 'user_sync_history_tbl','doctors_tbl','pre_call_notes_tbl','post_call_notes_tbl'];
  // const tableNames = ['user_attendance_tbl','user_sync_history_tbl'];
  // const tableNames = ['quick_call_tbl'];
  for (const tableName of tableNames) {
    const query = `DROP TABLE IF EXISTS ${tableName};`;
    await db.getAllAsync(query);
    console.log(tableName, 'has been dropped');
  }

  await db.closeAsync();
}