import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

async function getConnection() {
    if (db) return db;
    
    db = await open({
        filename: './bot.db',
        driver: sqlite3.Database
    });

    // Buat tabel users jika belum ada
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0,
            total_command INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    return db;
}

export default getConnection; 