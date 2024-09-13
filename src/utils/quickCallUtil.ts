import * as SQLite from "expo-sqlite";
export const getQuickCalls = async (): Promise<any> => {
    const db = await SQLite.openDatabaseAsync("cmms", {
      useNewConnection: true,
    });
  
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS quick_call_tbl (
        id INTEGER PRIMARY KEY NOT NULL,
        location TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        photo TEXT NOT NULL,
        photo_location TEXT NOT NULL,
        signature TEXT NOT NULL,
        signature_location TEXT NOT NULL,
        created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  
    try {
      const query = await db.getFirstAsync(`SELECT * FROM quick_call_tbl`);
  
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
doctor_id: string,
photo: string,
photo_location: string,
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
    location TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    photo TEXT NOT NULL,
    photo_location TEXT NOT NULL,
    signature TEXT NOT NULL,
    signature_location TEXT NOT NULL,
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
        `INSERT INTO quick_call_tbl (location, doctor_id, photo, photo_location, signature, signature_location) VALUES (?,?,?,?,?,?)`,
        [
        location,
        doctor_id,
        photo,
        photo_location,
        signature,
        signature_location,
        ]
    );
    } else {
    await db.runAsync(
        `UPDATE quick_call_tbl SET location = ?, doctor_id = ?, photo = ?, photo_location = ?, signature = ?, signature_location = ? WHERE id = ?`,
        [
        location,
        doctor_id,
        photo,
        photo_location,
        signature,
        signature_location,
        quickCallId,
        ]
    );
    }
} catch (error) {
    console.error("Error upserting call:", error);
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


export interface Call {
  location: string;
  doctor_id: string;
  photo: string;
  photo_location: string;
  signature: string;
  signature_location: string;
}

export const addQuickCall = async (call: Call): Promise<string> => {
  try {
    const db = await SQLite.openDatabaseAsync('cmms', { useNewConnection: true });

    // Create table if not exists
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS quick_call_tbl (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        photo TEXT NOT NULL,
        photo_location TEXT NOT NULL,
        signature TEXT NOT NULL,
        signature_location TEXT NOT NULL,
        created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert data
    await db.runAsync(
      `INSERT INTO quick_call_tbl (location, doctor_id, photo, photo_location, signature, signature_location) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        call.location,
        call.doctor_id,
        call.photo,
        call.photo_location,
        call.signature,
        call.signature_location,
      ]
    );

    // Fetch all records for debugging (optional)
    const testRecords = await db.getAllAsync("SELECT * FROM quick_call_tbl");
    console.log("All quick_call_tbl records:", testRecords);

    // Properly close the database connection
    await db.closeAsync();

    return 'Success';
  } catch (error) {
    console.error("Error adding quick call:", error);
    throw new Error('Failed to add quick call');
  }
};