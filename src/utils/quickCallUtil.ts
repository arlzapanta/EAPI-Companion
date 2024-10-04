import * as SQLite from "expo-sqlite";
export const getQuickCalls = async (): Promise<any> => {
    const db = await SQLite.openDatabaseAsync("cmms", {
      useNewConnection: true,
    });
  
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS quick_call_tbl (
        id INTEGER PRIMARY KEY NOT NULL,
        location TEXT,
        doctors_id TEXT,
        photo TEXT,
        photo_location TEXT,
        signature TEXT,
        signature_location TEXT,
        notes TEXT,
        created_date TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  
    try {
      const query = await db.getAllAsync(`SELECT * FROM quick_call_tbl`);
  
      if (query) {
        return query;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching quick calls:", error);
      return null;
    } finally {
      await db.closeAsync();
    }
};

export const upsertCall = async (
quickCallId: number,
location: string,
doctors_id: string,
photo: string,
photo_location: string,
signature: string,
signature_location: string,
notes: string
) => {
const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
});

await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS quick_call_tbl (
    id INTEGER PRIMARY KEY NOT NULL,
    location TEXT,
    doctors_id TEXT,
    photo TEXT,
    photo_location TEXT,
    signature TEXT,
    signature_location TEXT,
    notes TEXT,
    created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`);

try {
    const existingRow = await db.getFirstAsync(
    `SELECT * FROM quick_call_tbl WHERE id = ?`,
    [quickCallId]
    );

    if (!existingRow) {
    await db.runAsync(
        `INSERT INTO quick_call_tbl (location, doctors_id, photo, photo_location, signature, signature_location, notes) VALUES (?,?,?,?,?,?,?)`,
        [
        location,
        doctors_id,
        photo,
        photo_location,
        signature,
        signature_location,
        notes,
        ]
    );
    } else {
    await db.runAsync(
        `UPDATE quick_call_tbl SET location = ?, doctors_id = ?, photo = ?, photo_location = ?, signature = ?, signature_location = ?, notes = ?, WHERE id = ?`,
        [
        location,
        doctors_id,
        photo,
        photo_location,
        signature,
        signature_location,
        notes,
        quickCallId,
        ]
    );
    }
} catch (error) {
    console.error("Error upserting call:", error);
}
};

export const updateCallSignature = async (
  quickCallId: number,
  signature: string,
  signature_location: string
) => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS quick_call_tbl (
      id INTEGER PRIMARY KEY NOT NULL,
      location TEXT,
      doctors_id TEXT,
      photo TEXT,
      photo_location TEXT,
      signature TEXT,
      signature_location TEXT,
      notes TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM quick_call_tbl WHERE id = ?`,
      [quickCallId]
    );

    if (!existingRow) {
      console.error(`Call with ID ${quickCallId} not found.`);
    } else {
      await db.runAsync(
        `UPDATE quick_call_tbl SET signature = ?, signature_location = ? WHERE id = ?`,
        [signature, signature_location, quickCallId]
      );
    }
  } catch (error) {
    console.error("Error updating call:", error);
  }
};

export const updateCallPhoto = async (
  quickCallId: number,
  photo: string,
  photo_location: string
) => {

  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS quick_call_tbl (
      id INTEGER PRIMARY KEY NOT NULL,
      location TEXT,
      doctors_id TEXT,
      photo TEXT,
      photo_location TEXT,
      signature TEXT,
      signature_location TEXT,
      notes TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM quick_call_tbl WHERE id = ?`,
      [quickCallId]
    );

    if (!existingRow) {
      console.error(`Call with ID ${quickCallId} not found.`);
    } else {
      await db.runAsync(
        `UPDATE quick_call_tbl SET photo = ?, photo_location = ? WHERE id = ?`,
        [photo, photo_location, quickCallId]
      );
    }
  } catch (error) {
    console.error("Error updating call:", error);
  }
};
export const updateCallNotes = async (
  quickCallId: number,
  notes: string,
) => {

  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS quick_call_tbl (
      id INTEGER PRIMARY KEY NOT NULL,
      location TEXT,
      doctors_id TEXT,
      photo TEXT,
      photo_location TEXT,
      signature TEXT,
      signature_location TEXT,
      notes TEXT,
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    const existingRow = await db.getFirstAsync(
      `SELECT * FROM quick_call_tbl WHERE id = ?`,
      [quickCallId]
    );

    if (!existingRow) {
      console.error(`Call with ID ${quickCallId} not found.`);
    } else {
      await db.runAsync(
        `UPDATE quick_call_tbl SET notes = ? WHERE id = ?`,
        [notes, quickCallId]
      );
    }
  } catch (error) {
    console.error("Error updating call:", error);
  }
};

export const deleteCallNote = async (quickCallId: number) => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  try {
    await db.runAsync(
      `DELETE FROM quick_call_tbl WHERE id = ?`,
      quickCallId
    );

    // console.log(`Successfully deleted all pre-call notes for scheduleId: ${scheduleId}`);
  } catch (error) {
    console.error("Error deleting pre-call notes:", error);
  } finally {
    await db.closeAsync();
  }
};


export const removeCallFromLocalDb = async (quickCallId: number) => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  try {
    await db.runAsync(`DELETE FROM quick_call_tbl WHERE id = ?`, [quickCallId]);

    console.log(`Successfully deleted quick call: ${quickCallId}`);
  } catch (error) {
    console.error("Error deleting quick call:", error);
  } finally {
    await db.closeAsync();
  }
};

export const addQuickCall = async (call: Call): Promise<string> => {
  try {
    const db = await SQLite.openDatabaseAsync('cmms', { useNewConnection: true });

    // Create table if not exists
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS quick_call_tbl (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT,
        doctors_id TEXT,
        photo TEXT,
        photo_location TEXT,
        signature TEXT,
        signature_location TEXT,
        notes TEXT,
        created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert data
    await db.runAsync(
      `INSERT INTO quick_call_tbl (location, doctors_id, photo, photo_location, signature, signature_location, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        call.location,
        call.doctors_id,
        call.photo,
        call.photo_location,
        call.signature,
        call.signature_location,
        call.notes,
      ]
    );

    // Fetch all records for debugging (optional)
    // const testRecords = await db.getAllAsync("SELECT * FROM quick_call_tbl");
    // console.log("All quick_call_tbl records:", testRecords);

    // Properly close the database connection
    await db.closeAsync();

    return 'Success';
  } catch (error) {
    console.error("Error adding quick call:", error);
    throw new Error('Failed to add quick call');
  }
};