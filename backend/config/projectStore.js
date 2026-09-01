const isProduction = process.env.NODE_ENV === 'production';

const normalizeProjectStore = (value) => {
    const configuredStore = (value || '').trim().toLowerCase();

    if (configuredStore === 'cloudinary' || configuredStore === 'database') {
        return configuredStore;
    }

    if (configuredStore) {
        console.warn(
            `Unsupported PROJECT_STORE="${configuredStore}". Falling back to ${isProduction ? 'cloudinary' : 'database'}.`
        );
    }

    return isProduction ? 'cloudinary' : 'database';
};

const projectStore = normalizeProjectStore(process.env.PROJECT_STORE);

module.exports = {
    isProduction,
    projectStore,
    usesDatabaseProjectStore: projectStore === 'database'
};
