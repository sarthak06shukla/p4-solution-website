const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

// PostgreSQL configuration for production
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// SQLite configuration for development
const sqliteDb = new sqlite3.Database('./database.db');

// Database wrapper to provide consistent interface
class Database {
    constructor() {
        this.isProduction = isProduction;
        this.db = isProduction ? pgPool : sqliteDb;
    }

    // Run a query (INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (this.isProduction) {
                // PostgreSQL
                this.db.query(sql, params, (err, result) => {
                    if (err) reject(err);
                    else resolve({
                        lastID: result.rows[0]?.id,
                        changes: result.rowCount
                    });
                });
            } else {
                // SQLite
                this.db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            }
        });
    }

    // Get single row
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (this.isProduction) {
                // PostgreSQL
                this.db.query(sql, params, (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows[0] || null);
                });
            } else {
                // SQLite
                this.db.get(sql, params, (err, row) => {
                    if (err) reject(err);
                    else resolve(row || null);
                });
            }
        });
    }

    // Get multiple rows
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (this.isProduction) {
                // PostgreSQL
                this.db.query(sql, params, (err, result) => {
                    if (err) reject(err);
                    else resolve(result.rows || []);
                });
            } else {
                // SQLite
                this.db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            }
        });
    }

    // Initialize database tables
    async initialize() {
        if (this.isProduction) {
            // PostgreSQL initialization
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS projects (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    category VARCHAR(100),
                    location VARCHAR(255),
                    "completionDate" VARCHAR(100),
                    "clientName" VARCHAR(255),
                    images TEXT,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await this.db.query(createTableSQL);
            console.log('PostgreSQL: Projects table ready');
        } else {
            // SQLite initialization
            const createTableSQL = `
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
            `;
            await this.run(createTableSQL);
            console.log('SQLite: Projects table ready');
        }
    }

    close() {
        if (this.isProduction) {
            return this.db.end();
        } else {
            return new Promise((resolve) => {
                this.db.close(() => resolve());
            });
        }
    }
}

module.exports = new Database();
