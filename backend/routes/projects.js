const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { authenticateToken } = require('./auth');
const savedFallbackProjects = require('../data/projects.fallback.json');

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';
const PROJECT_STORE = process.env.PROJECT_STORE || (isProduction ? 'cloudinary' : 'database');
const PROJECTS_TABLE = isProduction ? 'p4_projects' : 'projects';
const CLOUDINARY_FOLDER = 'p4-solution-projects';
const CLOUDINARY_FALLBACK_ID_PREFIX = 'cloudinary-';
const CLOUDINARY_DATA_PUBLIC_ID = 'p4-solution-data/projects.json';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const isVideo = /\.(mp4|mov|avi|webm)$/i.test(filename);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: CLOUDINARY_FOLDER,
                resource_type: isVideo ? 'video' : 'image',
                timeout: 300000, // 5 minutes timeout for videos
                chunk_size: 6000000, // 6MB chunks
                eager: isVideo ? [{ quality: 'auto' }] : undefined,
                eager_async: isVideo
            },
            (error, result) => {
                if (error) {
                    logSafeError('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    console.log('Upload successful:', result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );

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

const hasCloudinaryConfig = () => (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
);

const usesCloudinaryProjectStore = () => PROJECT_STORE === 'cloudinary';

const getErrorMessage = (error) => (
    error?.error?.message ||
    error?.message ||
    'Unknown error'
);

const getErrorHttpCode = (error) => (
    error?.http_code ||
    error?.error?.http_code
);

const isNotFoundError = (error) => (
    getErrorHttpCode(error) === 404 ||
    /not found/i.test(getErrorMessage(error))
);

const logSafeError = (label, error) => {
    console.error(label, {
        message: getErrorMessage(error),
        code: error?.code || error?.error?.code,
        http_code: getErrorHttpCode(error)
    });
};

const parseImages = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Invalid project images JSON:', error.message);
        return [];
    }
};

const serializeProject = (row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    completionDate: row.completionDate || row.completiondate || '',
    clientName: row.clientName || row.clientname || '',
    images: parseImages(row.images),
    createdAt: row.createdAt || row.createdat,
    updatedAt: row.updatedAt || row.updatedat
});

const encodeFallbackId = (publicId) => {
    const encoded = Buffer.from(publicId)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return `${CLOUDINARY_FALLBACK_ID_PREFIX}${encoded}`;
};

const titleFromPublicId = (publicId) => {
    const filename = publicId.split('/').pop() || 'Project Media';
    return filename
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

const fetchCloudinaryResources = async (resourceType) => {
    const response = await cloudinary.api.resources({
        type: 'upload',
        resource_type: resourceType,
        prefix: `${CLOUDINARY_FOLDER}/`,
        max_results: 100
    });

    return response.resources || [];
};

const getCloudinaryFallbackProjects = async () => {
    if (!hasCloudinaryConfig()) {
        return [];
    }

    const [images, videos] = await Promise.all([
        fetchCloudinaryResources('image'),
        fetchCloudinaryResources('video')
    ]);

    return [...images, ...videos]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(resource => ({
            id: encodeFallbackId(resource.public_id),
            title: titleFromPublicId(resource.public_id),
            description: 'Project media recovered from Cloudinary while the project database is unavailable.',
            category: resource.resource_type === 'video' ? 'Video' : 'Gallery',
            location: '',
            completionDate: '',
            clientName: '',
            images: [resource.secure_url],
            createdAt: resource.created_at,
            updatedAt: resource.created_at,
            isCloudinaryFallback: true
        }));
};

const getSavedFallbackProjects = () => (
    savedFallbackProjects.map(project => ({
        ...project,
        isStaticFallback: true
    }))
);

const getSeedProjects = () => (
    savedFallbackProjects.map(project => ({ ...project }))
);

const getSavedFallbackProject = (id) => (
    getSavedFallbackProjects().find(project => String(project.id) === String(id))
);

const normalizeStoredProject = (project) => ({
    id: project.id,
    title: project.title || '',
    description: project.description || '',
    category: project.category || '',
    location: project.location || '',
    completionDate: project.completionDate || project.completiondate || '',
    clientName: project.clientName || project.clientname || '',
    images: parseImages(project.images),
    createdAt: project.createdAt || project.createdat || new Date().toISOString(),
    updatedAt: project.updatedAt || project.updatedat || project.createdAt || new Date().toISOString()
});

const stripProjectFlags = (project) => {
    const { isStaticFallback, isCloudinaryFallback, ...cleanProject } = project;
    return cleanProject;
};

const sortProjects = (projects) => (
    [...projects].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
);

const readCloudinaryProjectStore = async () => {
    if (!hasCloudinaryConfig()) {
        return sortProjects(getSeedProjects().map(normalizeStoredProject));
    }

    try {
        const resource = await cloudinary.api.resource(CLOUDINARY_DATA_PUBLIC_ID, {
            resource_type: 'raw'
        });

        const response = await fetch(`${resource.secure_url}?v=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Cloudinary project data fetch failed with ${response.status}`);
        }

        const data = await response.json();
        const projects = Array.isArray(data) ? data : data.projects;

        return sortProjects((projects || []).map(normalizeStoredProject));
    } catch (error) {
        if (isNotFoundError(error)) {
            return sortProjects(getSeedProjects().map(normalizeStoredProject));
        }

        throw error;
    }
};

const writeCloudinaryProjectStore = async (projects) => {
    if (!hasCloudinaryConfig()) {
        throw new Error('Cloudinary credentials are not configured.');
    }

    const payload = JSON.stringify({
        updatedAt: new Date().toISOString(),
        projects: sortProjects(projects.map(stripProjectFlags).map(normalizeStoredProject))
    }, null, 2);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: CLOUDINARY_DATA_PUBLIC_ID,
                resource_type: 'raw',
                overwrite: true,
                invalidate: true
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.on('error', reject);
        streamifier.createReadStream(Buffer.from(payload)).pipe(uploadStream);
    });
};

const getNextProjectId = (projects) => {
    const numericIds = projects
        .map(project => Number(project.id))
        .filter(id => Number.isInteger(id) && id > 0);

    return numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
};

const getProjectInput = (body, images, existingProject = {}) => {
    const now = new Date().toISOString();

    return {
        id: existingProject.id,
        title: body.title || '',
        description: body.description || '',
        category: body.category || '',
        location: body.location || '',
        completionDate: body.completionDate || '',
        clientName: body.clientName || '',
        images,
        createdAt: existingProject.createdAt || now,
        updatedAt: now
    };
};

const getCloudinaryPublicIdFromUrl = (url) => {
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        const uploadIndex = parts.indexOf('upload');

        if (uploadIndex === -1) {
            return null;
        }

        const publicIdParts = parts.slice(uploadIndex + 1);

        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts.shift();
        }

        return publicIdParts.join('/').replace(/\.[^.]+$/, '');
    } catch (error) {
        return null;
    }
};

const destroyCloudinaryMedia = async (mediaUrls) => {
    if (!hasCloudinaryConfig()) {
        return;
    }

    for (const imageUrl of parseImages(mediaUrls)) {
        const publicId = getCloudinaryPublicIdFromUrl(imageUrl);

        if (!publicId) {
            continue;
        }

        const resourceType = /\.(mp4|mov|avi|webm|m4v)(\?|#|$)/i.test(imageUrl)
            ? 'video'
            : 'image';

        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
};

// GET all projects
router.get('/', async (req, res) => {
    if (usesCloudinaryProjectStore()) {
        try {
            const projects = await readCloudinaryProjectStore();
            return res.json(projects);
        } catch (error) {
            logSafeError('Cloudinary project store read error:', error);
            return res.json(sortProjects(getSeedProjects().map(normalizeStoredProject)));
        }
    }

    const db = req.app.locals.db;

    if (!db) {
        return res.status(503).json({ error: 'Project database is not configured.' });
    }

    db.all(`SELECT * FROM ${PROJECTS_TABLE} ORDER BY createdAt DESC`, [], async (err, rows) => {
        if (err) {
            console.error('Project database error:', err);

            const savedProjects = getSavedFallbackProjects();

            if (savedProjects.length > 0) {
                return res.json(savedProjects);
            }

            try {
                const fallbackProjects = await getCloudinaryFallbackProjects();

                if (fallbackProjects.length > 0) {
                    return res.json(fallbackProjects);
                }
            } catch (fallbackError) {
                logSafeError('Cloudinary fallback error:', fallbackError);
            }

            return res.status(503).json({
                error: 'Project database is unavailable. Please check DATABASE_URL in the backend hosting environment.',
                detail: err.message
            });
        }

        if (rows.length === 0) {
            const savedProjects = getSavedFallbackProjects();

            if (savedProjects.length > 0) {
                return res.json(savedProjects);
            }

            try {
                const fallbackProjects = await getCloudinaryFallbackProjects();

                if (fallbackProjects.length > 0) {
                    return res.json(fallbackProjects);
                }
            } catch (fallbackError) {
                logSafeError('Cloudinary fallback error:', fallbackError);
            }
        }

        res.json(rows.map(serializeProject));
    });
});

// GET single project
router.get('/:id', async (req, res) => {
    if (usesCloudinaryProjectStore()) {
        try {
            const projects = await readCloudinaryProjectStore();
            const project = projects.find(item => String(item.id) === String(req.params.id));

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            return res.json(project);
        } catch (error) {
            logSafeError('Cloudinary project store detail error:', error);
            return res.status(503).json({ error: 'Project data is temporarily unavailable.' });
        }
    }

    if (req.params.id.startsWith(CLOUDINARY_FALLBACK_ID_PREFIX)) {
        try {
            const fallbackProjects = await getCloudinaryFallbackProjects();
            const project = fallbackProjects.find(item => item.id === req.params.id);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            return res.json(project);
        } catch (fallbackError) {
            logSafeError('Cloudinary fallback detail error:', fallbackError);
            return res.status(503).json({ error: 'Project media is temporarily unavailable.' });
        }
    }

    const db = req.app.locals.db;

    if (!db) {
        return res.status(503).json({ error: 'Project database is not configured.' });
    }

    db.get(`SELECT * FROM ${PROJECTS_TABLE} WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) {
            console.error('Project database error:', err);
            const savedProject = getSavedFallbackProject(req.params.id);

            if (savedProject) {
                return res.json(savedProject);
            }

            return res.status(503).json({
                error: 'Project database is unavailable. Please check DATABASE_URL in the backend hosting environment.',
                detail: err.message
            });
        }

        if (!row) {
            const savedProject = getSavedFallbackProject(req.params.id);

            if (savedProject) {
                return res.json(savedProject);
            }

            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(serializeProject(row));
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
        if (usesCloudinaryProjectStore() && !hasCloudinaryConfig()) {
            return res.status(500).json({ error: 'Cloudinary credentials are not configured.' });
        }

        if (req.files?.length && !hasCloudinaryConfig()) {
            return res.status(500).json({ error: 'Cloudinary credentials are not configured.' });
        }

        // Upload files to Cloudinary
        const uploadPromises = (req.files || []).map(file =>
            uploadToCloudinary(file.buffer, file.originalname)
        );
        const images = await Promise.all(uploadPromises);

        if (usesCloudinaryProjectStore()) {
            const projects = await readCloudinaryProjectStore();
            const project = getProjectInput(req.body, images);
            project.id = getNextProjectId(projects);

            const updatedProjects = [project, ...projects];
            await writeCloudinaryProjectStore(updatedProjects);

            return res.status(201).json(project);
        }

        if (!db) {
            return res.status(503).json({ error: 'Project database is not configured.' });
        }

        const query = `
            INSERT INTO ${PROJECTS_TABLE} (title, description, category, location, completiondate, clientname, images)
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
        logSafeError('Project create error:', uploadError);
        res.status(500).json({ error: 'Project save failed: ' + getErrorMessage(uploadError) });
    }
});

// PUT update project (protected)
router.put('/:id', authenticateToken, upload.array('images', 10), async (req, res) => {
    const db = req.app.locals.db;
    const { title, description, category, location, completionDate, clientName, existingImages } = req.body;

    try {
        if (usesCloudinaryProjectStore() && !hasCloudinaryConfig()) {
            return res.status(500).json({ error: 'Cloudinary credentials are not configured.' });
        }

        let images = parseImages(existingImages);

        if (req.files && req.files.length > 0) {
            if (!hasCloudinaryConfig()) {
                return res.status(500).json({ error: 'Cloudinary credentials are not configured.' });
            }

            const uploadPromises = req.files.map(file =>
                uploadToCloudinary(file.buffer, file.originalname)
            );
            const newImages = await Promise.all(uploadPromises);
            images = [...images, ...newImages];
        }

        if (usesCloudinaryProjectStore()) {
            const projects = await readCloudinaryProjectStore();
            const index = projects.findIndex(project => String(project.id) === String(req.params.id));

            if (index === -1) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const project = getProjectInput(req.body, images, projects[index]);
            const updatedProjects = [...projects];
            updatedProjects[index] = project;

            await writeCloudinaryProjectStore(updatedProjects);

            return res.json(project);
        }

        if (!db) {
            return res.status(503).json({ error: 'Project database is not configured.' });
        }

        const query = `
            UPDATE ${PROJECTS_TABLE} 
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
        logSafeError('Project update error:', uploadError);
        res.status(500).json({ error: 'Project save failed: ' + getErrorMessage(uploadError) });
    }
});

// DELETE project (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    if (usesCloudinaryProjectStore()) {
        try {
            const projects = await readCloudinaryProjectStore();
            const project = projects.find(item => String(item.id) === String(req.params.id));

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const updatedProjects = projects.filter(item => String(item.id) !== String(req.params.id));
            await writeCloudinaryProjectStore(updatedProjects);
            await destroyCloudinaryMedia(project.images);

            return res.json({ message: 'Project deleted successfully' });
        } catch (error) {
            logSafeError('Cloudinary project store delete error:', error);
            return res.status(500).json({ error: 'Failed to delete project: ' + getErrorMessage(error) });
        }
    }

    const db = req.app.locals.db;

    if (!db) {
        return res.status(503).json({ error: 'Project database is not configured.' });
    }

    // Get project to delete Cloudinary images
    db.get(`SELECT images FROM ${PROJECTS_TABLE} WHERE id = ?`, [req.params.id], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Delete from database
        db.run(`DELETE FROM ${PROJECTS_TABLE} WHERE id = ?`, [req.params.id], async function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Delete from Cloudinary
            if (row.images) {
                try {
                    const images = JSON.parse(row.images);
                    for (const imageUrl of images) {
                        const publicId = getCloudinaryPublicIdFromUrl(imageUrl);

                        if (!publicId) {
                            continue;
                        }

                        const resourceType = /\.(mp4|mov|avi|webm|m4v)(\?|#|$)/i.test(imageUrl)
                            ? 'video'
                            : 'image';

                        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
                    }
                } catch (deleteError) {
                    logSafeError('Cloudinary delete error:', deleteError);
                }
            }

            res.json({ message: 'Project deleted successfully' });
        });
    });
});

module.exports = router;
