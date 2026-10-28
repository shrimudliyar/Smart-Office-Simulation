const { createHash, timingSafeEqual } = require('node:crypto');

function telemetryAuth(env = process.env) {
  const token = env.TELEMETRY_API_TOKEN;
  const required = env.NODE_ENV === 'production' || env.RENDER === 'true';
  if (required && !token) throw new Error('TELEMETRY_API_TOKEN is required in production');
  const digest = value => createHash('sha256').update(value).digest();
  return (req, res, next) => {
    if (!token) return next(); // Unconfigured local development only.
    const provided = req.get('Authorization') || '';
    if (!timingSafeEqual(digest(provided), digest(`Bearer ${token}`))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };
}

const numbers = ['temperature', 'humidity', 'light', 'smoke'];
const booleans = ['occupancy', 'lightStatus', 'fanStatus', 'acStatus', 'alarmStatus'];
function validateTelemetry(req, res, next) {
  const data = req.body;
  const fields = [...numbers, ...booleans];
  if (!data || Array.isArray(data) || typeof data !== 'object' ||
      Object.keys(data).length !== fields.length ||
      !numbers.every(key => typeof data[key] === 'number' && Number.isFinite(data[key])) ||
      !booleans.every(key => typeof data[key] === 'boolean')) {
    return res.status(400).json({ error: 'Invalid telemetry fields or types' });
  }
  next();
}

module.exports = { telemetryAuth, validateTelemetry };
