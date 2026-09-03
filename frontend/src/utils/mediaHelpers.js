import { getApiOrigin } from '../config/api';

// Helper function to get full URL for images/videos
// Works with both old local URLs and new Cloudinary URLs
export const getMediaUrl = (url) => {
    if (!url) return '';

    // If URL already starts with http/https, it's a Cloudinary URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const normalizedPath = url.startsWith('/') ? url : `/${url}`;

    // Otherwise, it's an older local upload path - prefix with the active backend.
    return `${getApiOrigin()}${normalizedPath}`;
};

export const getValidMedia = (media = []) => {
    if (!Array.isArray(media)) return [];

    return media
        .filter(url => typeof url === 'string' && url.trim())
        .map(url => url.trim());
};

// Helper function to check if a file is a video
export const isVideo = (filename) => {
    if (!filename) return false;
    const normalized = filename.toLowerCase();

    if (normalized.includes('/video/upload/')) {
        return true;
    }

    const pathWithoutQuery = normalized.split('?')[0].split('#')[0];
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.m4v'];
    return videoExtensions.some(ext => pathWithoutQuery.endsWith(ext));
};

export const getVideoPosterUrl = (url) => {
    const mediaUrl = getMediaUrl(url);

    if (!mediaUrl || !isVideo(mediaUrl) || !mediaUrl.includes('/video/upload/')) {
        return '';
    }

    const [urlWithoutQuery, queryString] = mediaUrl.split('?');
    const posterPath = urlWithoutQuery
        .replace('/video/upload/', '/video/upload/so_1,w_900,h_650,c_fill,q_auto,f_jpg/')
        .replace(/\.[^/.]+$/, '.jpg');

    return queryString ? `${posterPath}?${queryString}` : posterPath;
};
