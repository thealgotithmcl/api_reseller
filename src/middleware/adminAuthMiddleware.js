import { error } from 'itty-router';

export const withAdminAuth = (request, env) => {
    const adminKey = request.headers.get('X-Admin-API-Key');
    
    if (!env.ADMIN_API_KEY) {
        console.error('ADMIN_API_KEY is not set in Cloudflare secrets.');
        return error(500, { message: 'Server configuration error.' });
    }

    if (!adminKey || adminKey !== env.ADMIN_API_KEY) {
        return error(403, { message: 'Forbidden: Invalid admin API key.' });
    }

    // If the key is valid, the request proceeds.
};
