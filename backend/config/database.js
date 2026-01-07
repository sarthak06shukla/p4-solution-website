const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    // PostgreSQL for production
    console.log('Using PostgreSQL (Production)');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    // Initialize PostgreSQL table
    pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            location VARCHAR(255),
            completiondate VARCHAR(100),
            clientname VARCHAR(255),
            images TEXT,
            createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `).then(() => {
        console.log('PostgreSQL: Projects table ready');
    }).catch(err => {
        console.error('PostgreSQL table creation error:', err);
    });

    module.exports = pool;

} else {
    // SQLite for development
    console.log('Using SQLite (Development)');

    const db = new sqlite3.Database(path.join(__dirname, '../database.db'), (err) => {
        if (err) {
            console.error('SQLite connection error:', err);
        } else {
            console.log('Connected to SQLite database');
        }
    });

    // Initialize SQLite table
    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            location TEXT,
            completionDate TEXT,
            clientName TEXT,
            images TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('SQLite table creation error:', err);
        } else {
            console.log('SQLite: Projects table ready');
        }
    });

    module.exports = db;
}
