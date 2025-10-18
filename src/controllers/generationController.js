import { json, error } from 'itty-router';
import { generateWithGemini } from '../services/geminiService';


export const generateImage = async (request, env) => {
    try {
        const body = await request.json();
        const { provider, sceneDescription, base64ImageData, mimeType, ...otherOptions } = body;

        if (!base64ImageData || !mimeType) {
            return error(400, { error: 'Base64 image data and MIME type are required.' });
        }
        if (!provider) {
            return error(400, { error: 'Image generation provider not specified.' });
        }
        if (!sceneDescription) {
            return error(400, { error: 'Scene description (prompt) is required.' });
        }

        let result;

        // Only Gemini is supported now.
        if (provider.toLowerCase() !== 'gemini') {
            return error(400, { error: `Unsupported provider: ${provider}. Only 'gemini' is available.` });
        }

        result = await generateWithGemini(env, base64ImageData, mimeType, sceneDescription, otherOptions);

        return json(result);

    } catch (err) {
        console.error(`Error during image generation:`, err);
        const errorMessage = err.message || 'An unexpected error occurred during image generation.';
        return error(500, { error: errorMessage });
    }
};
