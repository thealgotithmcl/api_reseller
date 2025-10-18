import { v4 as uuidv4 } from 'uuid';

// Note: The database schema is now managed via `wrangler.toml` and migrations.
// The `initDatabase` function is no longer needed in the worker code.

/**
 * Fetches all API keys from the database.
 * @param {D1Database} db - The D1 database instance.
 * @returns {Promise<Array>} - A promise that resolves to an array of API keys.
 */
export const getAllKeys = async (db) => {
    const { results } = await db.prepare("SELECT api_key, usage_count, quota, created_at FROM api_keys").all();
    return results || [];
};

/**
 * Generates a new API key and inserts it into the database.
 * @param {D1Database} db - The D1 database instance.
 * @param {number|null} quota - The usage quota for the new key.
 * @returns {Promise<Object>} - A promise that resolves to the newly created key.
 */
export const generateApiKey = async (db, quota = null) => {
    const newKey = uuidv4();
    const stmt = db.prepare(
        'INSERT INTO api_keys (api_key, quota) VALUES (?, ?)'
    );
    await stmt.bind(newKey, quota).run();
    
    // Fetch the newly created key to return it
    const { results } = await db.prepare("SELECT * FROM api_keys WHERE api_key = ?").bind(newKey).all();
    return results[0];
};

/**
 * Deletes an API key from the database.
 * @param {D1Database} db - The D1 database instance.
 * @param {string} apiKey - The API key to delete.
 * @returns {Promise<void>}
 */
export const deleteApiKey = async (db, apiKey) => {
    const info = await db.prepare('DELETE FROM api_keys WHERE api_key = ?').bind(apiKey).run();
    if (info.changes === 0) {
        throw new Error('API key not found or could not be deleted.');
    }
};

/**
 * Validates an API key and increments its usage count.
 * @param {D1Database} db - The D1 database instance.
 * @param {string} apiKey - The API key to validate.
 * @returns {Promise<boolean>} - A promise that resolves to true if the key is valid, false otherwise.
 */
export const validateAndIncrementKey = async (db, apiKey) => {
    if (!apiKey) return false;

    // Retrieve the key
    const keyData = await db.prepare('SELECT * FROM api_keys WHERE api_key = ?').bind(apiKey).first();

    if (!keyData) {
        return false; // Key doesn't exist
    }

    if (!keyData.is_active) {
        return false; // Key is inactive
    }

    // Check if quota is exceeded
    if (keyData.quota !== null && keyData.usage_count >= keyData.quota) {
        return false; // Quota exceeded
    }

    // Increment usage count
    await db.prepare('UPDATE api_keys SET usage_count = usage_count + 1 WHERE api_key = ?').bind(apiKey).run();

    return true; // Key is valid
};
