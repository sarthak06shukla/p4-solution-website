const { Pool } = require('pg');
const path = require('path');
const savedFallbackProjects = require('../data/projects.fallback.json');

const isProduction = process.env.NODE_ENV === 'production';
const PROJECTS_TABLE = 'p4_projects';

const seedFallbackProjectsIfEmpty = async (pool) => {
    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM ${PROJECTS_TABLE}`);

    if (countResult.rows[0].count > 0) {
        console.log('PostgreSQL: Existing P4 projects found, skipping fallback seed');
        return;
    }

    for (const project of savedFallbackProjects) {
        await pool.query(
            `
                INSERT INTO p4_projects (
                    id, title, description, category, location, completiondate,
                    clientname, images, createdat, updatedat
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO NOTHING
            `,
            [
                project.id,
                project.title,
                project.description,
                project.category,
                project.location,
                project.completionDate,
                project.clientName,
                JSON.stringify(project.images || []),
                project.createdAt,
                project.updatedAt
            ]
        );
    }

    await pool.query(`
        SELECT setval(
            pg_get_serial_sequence('p4_projects', 'id'),
            COALESCE((SELECT MAX(id) FROM p4_projects), 1),
            true
        )
    `);

    console.log(`PostgreSQL: Seeded ${savedFallbackProjects.length} fallback projects`);
};

if (isProduction) {
    // PostgreSQL for production
    console.log('Using PostgreSQL (Production)');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 5,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 15000,
        keepAlive: true
    });

    // Initialize PostgreSQL table
    pool.query(`
        CREATE TABLE IF NOT EXISTS p4_projects (
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
    `).then(async () => {
        console.log('PostgreSQL: Projects table ready');
        await seedFallbackProjectsIfEmpty(pool);
    }).catch(err => {
        console.error('PostgreSQL table creation error:', err);
    });

    module.exports = pool;

} else {
    // SQLite for development
    console.log('Using SQLite (Development)');

    const sqlite3 = require('sqlite3').verbose();
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
