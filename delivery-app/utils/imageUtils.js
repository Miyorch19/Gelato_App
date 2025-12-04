/**
 * Helper to construct profile photo URL
 * Handles both absolute URLs (Google Auth) and relative paths (Local Storage)
 */
export const getProfilePhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;

    // If it's already a full URL (e.g. Google Auth or already processed), return it
    if (photoUrl.startsWith('http')) return photoUrl;

    // Get API Base URL from the api service configuration
    // We need to import the API_URL from api.js or hardcode/detect it.
    // Since api.js has it as a local variable, we'll need to duplicate the logic or export it.
    // For now, let's use the same IP address logic.

    // IMPORTANT: This must match the IP in services/api.js
    const API_BASE_URL = 'http://192.168.1.67:8000';

    // Ensure path starts with /
    const cleanPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;

    // If path already includes /storage, don't add it again
    if (cleanPath.startsWith('/storage')) {
        return `${API_BASE_URL}${cleanPath}`;
    }

    return `${API_BASE_URL}/storage${cleanPath}`;
};
