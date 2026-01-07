const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - allow all
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create database wrapper for consistent API
const isProduction = process.env.NODE_ENV === 'production';

const dbWrapper = {
    all: (sql, params, callback) => {
        if (isProduction) {
            // PostgreSQL
            db.query(sql.replace(/\?/g, (_, i) => `$${params.indexOf(_) + 1}`), params)
                .then(result => callback(null, result.rows))
                .catch(err => callback(err));
        } else {
            // SQLite
            db.all(sql, params, callback);
        }
    },
    get: (sql, params, callback) => {
        if (isProduction) {
            // PostgreSQL
            db.query(sql.replace(/\?/g, (_, i) => `$${params.indexOf(_) + 1}`), params)
                .then(result => callback(null, result.rows[0] || null))
                .catch(err => callback(err));
        } else {
            // SQLite
            db.get(sql, params, callback);
        }
    },
    run: (sql, params, callback) => {
        if (isProduction) {
            // PostgreSQL
            const paramPlaceholders = params.map((_, i) => `$${i + 1}`);
            const pgSql = sql.replace(/\?/g, () => paramPlaceholders.shift());

            db.query(pgSql + ' RETURNING id', params)
                .then(result => callback(null, { lastID: result.rows[0]?.id, changes: result.rowCount }))
                .catch(err => callback(err));
        } else {
            // SQLite
            db.run(sql, params, function (err) {
                callback(err, { lastID: this.lastID, changes: this.changes });
            });
        }
    }
};

// Make database wrapper available to routes
app.locals.db = dbWrapper;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Root
app.get('/api', (req, res) => {
    res.json({ message: 'P4 Solution API Server' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
