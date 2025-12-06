import { API_BASE_URL } from './constants';

/**
 * Helper to construct profile photo URL
 * Handles both absolute URLs (Google Auth) and relative paths (Local Storage)
 */
export const getProfilePhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;

    // If it's already a full URL (e.g. Google Auth or already processed), return it
    if (photoUrl.startsWith('http')) return photoUrl;

    // Get storage Base URL (remove /api suffix)
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');

    // Ensure path starts with /
    const cleanPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;

    // If path already includes /storage, don't add it again
    if (cleanPath.startsWith('/storage')) {
        return `${baseUrl}${cleanPath}`;
    }

    return `${baseUrl}/storage${cleanPath}`;
};
