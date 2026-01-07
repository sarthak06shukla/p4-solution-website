const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// GET all projects
router.get('/', (req, res) => {
    const db = req.app.locals.db;

    db.all('SELECT * FROM projects ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Parse images JSON string to array
        const projects = rows.map(row => ({
            ...row,
            images: row.images ? JSON.parse(row.images) : []
        }));

        res.json(projects);
    });
});

// GET single project
router.get('/:id', (req, res) => {
    const db = req.app.locals.db;

    db.get('SELECT * FROM projects WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = {
            ...row,
            images: row.images ? JSON.parse(row.images) : []
        };

        res.json(project);
    });
});

// POST new project (protected)
router.post('/', authenticateToken, upload.array('images', 10), async (req, res) => {
    const db = req.app.locals.db;
    const { title, description, category, location, completionDate, clientName } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        // Upload files to Cloudinary
        const uploadPromises = req.files.map(file =>
            uploadToCloudinary(file.buffer, file.originalname)
        );
        const images = await Promise.all(uploadPromises);

        const query = `
            INSERT INTO projects (title, description, category, location, completiondate, clientname, images)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
            query,
            [title, description, category, location, completionDate, clientName, JSON.stringify(images)],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(201).json({
                    id: this.lastID,
                    title,
                    description,
                    category,
                    location,
                    completionDate,
                    clientName,
                    images
                });
            }
        );
    } catch (uploadError) {
        console.error('Upload error:', uploadError);
        res.status(500).json({ error: 'File upload failed: ' + uploadError.message });
    }
});

// PUT update project (protected)
router.put('/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
    const db = req.app.locals.db;
    const { title, description, category, location, completionDate, clientName, existingImages } = req.body;

    try {
        // Combine existing images with new uploads
        let images = existingImages ? JSON.parse(existingImages) : [];

        if (req.files && req.files.length > 0) {
            // Upload new files to Cloudinary
            const uploadPromises = req.files.map(file =>
                uploadToCloudinary(file.buffer, file.originalname)
            );
            const newImages = await Promise.all(uploadPromises);
            images = [...images, ...newImages];
        }

        const query = `
        UPDATE projects 
        SET title = ?, description = ?, category = ?, location = ?, 
            completiondate = ?, clientname = ?, images = ?, updatedat = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

        db.run(
            query,
            [title, description, category, location, completionDate, clientName, JSON.stringify(images), req.params.id],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Project not found' });
                }

                res.json({
                    id: req.params.id,
                    title,
                    description,
                    category,
                    location,
                    completionDate,
                    clientName,
                    images
                });
            }
        );
    } catch (uploadError) {
        console.error('Upload error:', uploadError);
        res.status(500).json({ error: 'File upload failed: ' + uploadError.message });
    }
});

// DELETE project (protected)
router.delete('/:id', authenticateToken, (req, res) => {
    const db = req.app.locals.db;

    // First get the project to delete associated images
    db.get('SELECT images FROM projects WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete the project
        db.run('DELETE FROM projects WHERE id = ?', [req.params.id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Delete associated image files
            if (row.images) {
                const images = JSON.parse(row.images);
                images.forEach(imagePath => {
                    const fullPath = path.join(__dirname, '..', imagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                });
            }

            res.json({ message: 'Project deleted successfully' });
        });
    });
});

module.exports = router;
