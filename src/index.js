import { Router, error, json } from 'itty-router';
import { generateImage } from './controllers/generationController';
import { getAllKeys, createApiKey, removeApiKey } from './controllers/adminController';
import { withAdminAuth } from './middleware/adminAuthMiddleware';
import { withApiAuth } from './middleware/authMiddleware';

// Create a new router
const router = Router();

// CORS Preflight handling
router.all('*', (req, env) => {
    const origin = req.headers.get('Origin');
    if (req.method === 'OPTIONS' && origin) {
        // Handle CORS preflight requests.
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-API-Key, X-API-Key',
                'Access-Control-Max-Age': '86400',
            },
        });
    }
});

// Admin routes (protected by admin auth middleware)
router.get('/admin/keys', withAdminAuth, getAllKeys);
router.post('/admin/keys', withAdminAuth, createApiKey);
router.delete('/admin/keys/:key', withAdminAuth, removeApiKey);

// API routes (protected by general API key auth middleware)
router.post('/api/generate/image', withApiAuth, generateImage);

// Serve static files from the public folder (simple example)
router.get('/', () => new Response(null, { status: 302, headers: { 'Location': '/index.html' } }));

// This is a simplified example. For production, use Cloudflare Pages for static assets.
// We'll add a catch-all for public files for now.
router.get('/index.html', (req, env, ctx) => {
    // In a real worker, you'd use KV assets or R2 to serve static files.
    // For this migration, we'll return a placeholder response.
    // The user should deploy the `public` folder to Cloudflare Pages.
    return new Response("<html><body>Admin UI should be deployed via Cloudflare Pages.</body></html>", { headers: { 'Content-Type': 'text/html' }});
});
router.get('/app.js', () => new Response("// JS for Admin UI", { headers: { 'Content-Type': 'application/javascript' }}));
router.get('/style.css', () => new Response("/* CSS for Admin UI */", { headers: { 'Content-Type': 'text/css' }}));


// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
    async fetch(request, env, ctx) {
        return router
            .handle(request, env, ctx)
            .then(response => {
                // Add CORS headers to every response
                const origin = request.headers.get('Origin');
                if (origin) {
                    response.headers.set('Access-Control-Allow-Origin', origin);
                    response.headers.set('Access-Control-Allow-Credentials', 'true');
                }
                return response;
            })
            .catch(err => {
                console.error('Caught error:', err);
                const statusCode = err.status || 500;
                const message = err.message || 'An unexpected error occurred.';
                // Return a JSON error response with CORS headers
                const errorResponse = error(statusCode, { error: message });
                const origin = request.headers.get('Origin');
                if (origin) {
                    errorResponse.headers.set('Access-Control-Allow-Origin', origin);
                    errorResponse.headers.set('Access-Control-Allow-Credentials', 'true');
                }
                return errorResponse;
            });
    },
};
