const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit (Cloudinary free tier max)
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const isVideo = /\.(mp4|mov|avi|webm)$/i.test(filename);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'p4-solution-projects',
                resource_type: isVideo ? 'video' : 'image',
                timeout: 300000, // 5 minutes timeout for videos
                chunk_size: 6000000, // 6MB chunks
                eager: isVideo ? [{ quality: 'auto' }] : undefined, // Optimize video on upload
                eager_async: isVideo // Process videos asynchronously for faster response
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    console.log('Upload successful:', result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );

        // Handle stream errors
        uploadStream.on('error', (streamError) => {
            console.error('Upload stream error:', streamError);
            reject(streamError);
        });

        const readStream = streamifier.createReadStream(buffer);

        readStream.on('error', (readError) => {
            console.error('Read stream error:', readError);
            reject(readError);
        });

        readStream.pipe(uploadStream);
    });
};

// GET all projects
router.get('/', (req, res) => {
    const db = req.app.locals.db;

    db.all('SELECT * FROM projects ORDER BY createdat DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

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
            INSERT INTO projects (title, description, category, location, completionDate, clientName, images)
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
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload files' });
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
            const uploadPromises = req.files.map(file =>
                uploadToCloudinary(file.buffer, file.originalname)
            );
            const newImages = await Promise.all(uploadPromises);
            images = [...images, ...newImages];
        }

        const query = `
            UPDATE projects 
            SET title = ?, description = ?, category = ?, location = ?, 
                completionDate = ?, clientName = ?, images = ?, updatedAt = CURRENT_TIMESTAMP
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
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE project (protected)
router.delete('/:id', authenticateToken, (req, res) => {
    const db = req.app.locals.db;

    // First get the project to delete associated images from Cloudinary
    db.get('SELECT images FROM projects WHERE id = ?', [req.params.id], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete the project from database
        db.run('DELETE FROM projects WHERE id = ?', [req.params.id], async function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Try to delete associated files from Cloudinary
            if (row.images) {
                try {
                    const images = JSON.parse(row.images);
                    for (const imageUrl of images) {
                        // Extract public_id from Cloudinary URL
                        const parts = imageUrl.split('/');
                        const folder = 'p4-solution-projects';
                        const filename = parts[parts.length - 1].split('.')[0];
                        const publicId = `${folder}/${filename}`;

                        const isVideo = /\.(mp4|mov|avi|webm)$/i.test(imageUrl);

                        await cloudinary.uploader.destroy(publicId, {
                            resource_type: isVideo ? 'video' : 'image'
                        });
                    }
                } catch (error) {
                    console.error('Error deleting from Cloudinary:', error);
                }
            }

            res.json({ message: 'Project deleted successfully' });
        });
    });
});

module.exports = router;
