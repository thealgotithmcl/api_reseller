import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates content with Gemini based on an image and a text prompt.
 * @param {object} env - The Cloudflare Worker environment object with secrets.
 * @param {string} base64ImageData - The base64 encoded image data.
 * @param {string} mimeType - The MIME type of the image.
 * @param {string} sceneDescription - The text prompt.
 * @param {object} otherOptions - Additional options for the generation.
 * @returns {Promise<object>} - The result from the Gemini API.
 */
export const generateWithGemini = async (env, base64ImageData, mimeType, sceneDescription, otherOptions) => {
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in secrets.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    const imagePart = {
        inlineData: {
            data: base64ImageData.split(',').pop(), // Remove the data URL prefix if present
            mimeType: mimeType,
        },
    };

    try {
        console.log('Before model.generateContent');
        const result = await model.generateContent([sceneDescription, imagePart]);
        console.log('After model.generateContent');
        const response = await result.response;
        console.log('After result.response');
        const text = response.text();
        console.log('After response.text()');

        // Assuming the response is the generated image or relevant data
        // This might need adjustment based on the actual Gemini API response structure for image generation
        return { generated_text: text };
    } catch (error) {
        console.error('Error in generateWithGemini:', error);
        throw error; // Re-throw the error so it can be caught by the generationController
    }
};
