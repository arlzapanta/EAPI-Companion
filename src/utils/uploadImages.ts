import * as SQLite from 'expo-sqlite';

interface UploadImageProps {
  base64Images: string[];
  category: string;
}

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
