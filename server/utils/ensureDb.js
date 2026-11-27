import mongoose from 'mongoose';

/**
 * Fail fast when Mongo is down instead of buffering queries for 10s
 * and returning "Operation X buffering timed out".
 */
export function ensureDbConnected() {
  if (mongoose.connection.readyState === 1) return;
  const err = new Error(
    'Database unavailable. MongoDB is not connected — check MONGO_URI, network/DNS, and Atlas access.'
  );
  err.status = 503;
  err.code = 'DB_UNAVAILABLE';
  throw err;
}

export default ensureDbConnected;
