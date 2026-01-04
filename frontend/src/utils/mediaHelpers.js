// Helper function to get full URL for images/videos
// Works with both old local URLs and new Cloudinary URLs
export const getMediaUrl = (url) => {
    if (!url) return '';

    // If URL already starts with http/https, it's a Cloudinary URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Otherwise, it's a local URL - prefix with backend server
    return `http://localhost:5000${url}`;
};

// Helper function to check if a file is a video
export const isVideo = (filename) => {
    if (!filename) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};
