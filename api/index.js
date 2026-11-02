/**
 * Vercel serverless entrypoint for the Express API.
 *
 * The same Express app that `insurance-landing-demo/backend/src/server.js`
 * serves locally is exposed here as a single serverless function, so the SPA
 * and the API share one origin (`/api/v1/...`) and no CORS setup is needed in
 * production.
 *
 * Database configuration comes entirely from Vercel environment variables; the
 * Aiven CA certificate must be supplied as `DB_SSL_CA` (PEM text) because a
 * serverless filesystem cannot mount `ca.pem`.
 */
const app = require('../insurance-landing-demo/backend/src/app');

module.exports = (req, res) => app(req, res);
