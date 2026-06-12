const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const getDefaultApiUrl = () => {
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    if (process.env.NODE_ENV === 'production') {
        return 'https://p4-solution-backend.onrender.com/api';
    }

    return 'http://localhost:5000/api';
};

export const API_URL = trimTrailingSlash(getDefaultApiUrl());

export const getApiOrigin = () => {
    if (/^https?:\/\//i.test(API_URL)) {
        return new URL(API_URL).origin;
    }

    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return '';
};
