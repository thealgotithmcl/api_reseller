import { error } from 'itty-router';
import { validateAndIncrementKey } from '../services/databaseService';

export const withApiAuth = async (request, env) => {
    const apiKey = request.headers.get('X-API-Key');

    if (!apiKey) {
        return error(401, { message: 'Unauthorized: API key is missing.' });
    }

    const isValid = await validateAndIncrementKey(env.DB, apiKey);

    if (!isValid) {
        return error(403, { message: 'Forbidden: Invalid or expired API key.' });
    }

    // If the key is valid, the request will proceed to the main handler.
};
