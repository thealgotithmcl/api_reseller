import { json, error } from 'itty-router';
import { getAllKeys as dbGetAllKeys, generateApiKey as dbGenerateApiKey, deleteApiKey as dbDeleteApiKey } from '../services/databaseService';

// Get all API keys
export const getAllKeys = async (request, env) => {
    try {
        const keys = await dbGetAllKeys(env.DB);
        return json(keys);
    } catch (err) {
        console.error('Error fetching API keys:', err);
        return error(500, { message: 'Error fetching API keys', error: err.message });
    }
};

// Generate a new API key, optionally with a quota
export const createApiKey = async (request, env) => {
    try {
        const { quota } = await request.json(); // quota is optional
        const newKey = await dbGenerateApiKey(env.DB, quota);
        return json(newKey, { status: 201 });
    } catch (err) {
        console.error('Error generating API key:', err);
        return error(500, { message: 'Error generating API key', error: err.message });
    }
};

// Delete an API key
export const removeApiKey = async (request, env) => {
    try {
        const { key } = request.params;
        if (!key) {
            return error(400, { message: 'API key parameter is missing.' });
        }
        await dbDeleteApiKey(env.DB, key);
        return json({ message: 'API key deleted successfully.' });
    } catch (err) {
        console.error('Error deleting API key:', err);
        if (err.message.includes('not found')) {
            return error(404, { message: err.message });
        }
        return error(500, { message: 'Error deleting API key', error: err.message });
    }
};
