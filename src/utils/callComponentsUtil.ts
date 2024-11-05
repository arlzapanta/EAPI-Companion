import * as SQLite from "expo-sqlite";

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
        mood TEXT, 
        feedback TEXT, 
        schedule_id TEXT NOT NULL, 
        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await deleteAllPostCallNotes({ scheduleId });

    await db.runAsync(
      `INSERT INTO post_call_notes_tbl (mood, feedback, schedule_id) VALUES (?,?,?)`,
      mood,
      feedback,
      scheduleId
    );

    // const testRecords = await db.getAllAsync(
    //   "SELECT * FROM post_call_notes_tbl "
    // );
    // console.log("All post-call records:", testRecords);

    db.closeSync();
  } catch (error) {
    console.error("Error saving post-call notes:", error);
  }
};

export const getPostCallNotesLocalDb = async (
  scheduleId: string
): Promise<any | null> => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS post_call_notes_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      mood TEXT, 
      feedback TEXT, 
      schedule_id TEXT NOT NULL, 
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    const query = await db.getFirstAsync(
      `SELECT * FROM post_call_notes_tbl WHERE schedule_id = ?`,
      [scheduleId]
    );

    if (query) {
      return query;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching post-call notes:", error);
    return null;
  } finally {
    await db.closeAsync();
  }
};

export const checkPostCallUnsetExist = async (): Promise<Boolean> => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS post_call_notes_tbl (
      id INTEGER PRIMARY KEY NOT NULL, 
      mood TEXT, 
      feedback TEXT, 
      schedule_id TEXT NOT NULL, 
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    const query = await db.getAllAsync(
      `SELECT * FROM post_call_notes_tbl WHERE mood = '' OR feedback = ''`
    );
    return query.length > 0 ? true : false;
  } catch (error) {
    console.error("Error fetching post-call notes:", error);
    return false;
  } finally {
    await db.closeAsync();
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

    await deleteAllPreCallNotes({ scheduleId });

    const notesJson = JSON.stringify(notesArray);

    await db.runAsync(
      `INSERT INTO pre_call_notes_tbl (notes, schedule_id) VALUES (?,?)`,
      notesJson,
      scheduleId
    );

    // const testRecords = await db.getAllAsync(
    //   "SELECT * FROM pre_call_notes_tbl "
    // );
    // console.log("All pre_call_notes_tbl:", testRecords);

    db.closeSync();
  } catch (error) {
    console.error("Error saving pre-call notes:", error);
  }
};

export const getPreCallNotesLocalDb = async (
  scheduleId: string
): Promise<PreCallNotesParams[]> => {
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

  const query = `SELECT notes, schedule_id FROM pre_call_notes_tbl WHERE schedule_id = ?`;

  try {
    const result = await db.getAllAsync(query, [scheduleId]);
    const existingRows = result as { notes: string; schedule_id: string }[];
    return existingRows.map((row) => ({
      notesArray: JSON.parse(row.notes),
      scheduleId: row.schedule_id,
    }));
  } catch (error) {
    console.error("Error fetching pre-call notes:", error);
    return [];
  } finally {
    await db.closeAsync();
  }
};

export const deleteAllPreCallNotes = async ({
  scheduleId,
}: {
  scheduleId: string;
}) => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  try {
    await db.runAsync(
      `DELETE FROM pre_call_notes_tbl WHERE schedule_id = ?`,
      scheduleId
    );

    // console.log(`Successfully deleted all pre-call notes for scheduleId: ${scheduleId}`);
  } catch (error) {
    console.error("Error deleting pre-call notes:", error);
  } finally {
    await db.closeAsync();
  }
};

export const deleteAllPostCallNotes = async ({
  scheduleId,
}: {
  scheduleId: string;
}) => {
  const db = await SQLite.openDatabaseAsync("cmms", {
    useNewConnection: true,
  });

  try {
    await db.runAsync(
      `DELETE FROM post_call_notes_tbl WHERE schedule_id = ?`,
      scheduleId
    );

    // console.log(`Successfully deleted all pre-call notes for scheduleId: ${scheduleId}`);
  } catch (error) {
    console.error("Error deleting post-call notes:", error);
  } finally {
    await db.closeAsync();
  }
};
