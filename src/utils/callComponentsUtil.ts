import * as SQLite from "expo-sqlite";

export interface PostCallNotesParams {
  mood: string;
  feedback: string;
  scheduleId: string;
}

export interface PreCallNotesParams {
  notesArray: string[];
  scheduleId: string;
}

export const savePostCallNotesLocalDb = async ({
  mood,
  feedback,
  scheduleId,
}: PostCallNotesParams): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("cmms", {
      useNewConnection: true,
    });

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS post_call_notes_tbl (
        id INTEGER PRIMARY KEY NOT NULL, 
        mood TEXT NOT NULL, 
        feedback TEXT NOT NULL, 
        schedule_id TEXT NOT NULL, 
        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.runAsync(
      `INSERT INTO post_call_notes_tbl (mood, feedback, schedule_id) VALUES (?,?,?)`,
      mood,
      feedback,
      scheduleId
    );

    const testRecords = await db.getAllAsync(
      "SELECT * FROM post_call_notes_tbl "
    );
    console.log("All post-call records:", testRecords);

    db.closeSync();
  } catch (error) {
    console.error("Error saving post-call notes:", error);
  }
};

export const savePreCallNotesLocalDb = async ({
  notesArray,
  scheduleId,
}: PreCallNotesParams): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("cmms", {
      useNewConnection: true,
    });

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS pre_call_notes_tbl (
        id INTEGER PRIMARY KEY NOT NULL, 
        notes TEXT NOT NULL, 
        schedule_id TEXT NOT NULL, 
        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const notesJson = JSON.stringify(notesArray);

    await db.runAsync(
      `INSERT INTO pre_call_notes_tbl (notes, schedule_id) VALUES (?,?)`,
      notesJson,
      scheduleId
    );

    const testRecords = await db.getAllAsync(
      "SELECT * FROM pre_call_notes_tbl "
    );
    console.log("All records:", testRecords);

    db.closeSync();
  } catch (error) {
    console.error("Error saving pre-call notes:", error);
  }
};

