import mongoose, { Connection } from 'mongoose';

/**
 * MongoDB Connection Manager
 * Handles MongoDB connection pooling and caching for Next.js applications.
 * Prevents multiple connections during development by caching the connection globally.
 *
 * Usage:
 * - Server Component: const conn = await connectToDatabase();
 * - API Route: const conn = await connectToDatabase();
 */

/**
 * Global type declaration for caching the MongoDB connection in Node.js global scope.
 * This prevents multiple connections during development with Next.js hot reloading.
 */
declare global {
  // var is intentional for global scope
  var mongooseConn: { conn: Connection | null; promise: Promise<Connection> | null };
}

/**
 * MongoDB connection URI from environment variables.
 * Required: MONGODB_URI must be set in .env.local or environment
 */
const MONGODB_URI: string = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Initialize or retrieve the cached connection.
 * In development, Next.js hot reloading can cause multiple connection attempts.
 * This ensures we reuse the same connection instead of creating new ones.
 */
let cached = global.mongooseConn;

if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Returns the cached connection on subsequent calls during development.
 *
 * @returns Promise<Connection> - The Mongoose connection instance
 * @throws Error if MONGODB_URI is not defined or connection fails
 */
export async function connectToDatabase(): Promise<Connection> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // Create new connection if promise doesn't exist
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose.connection);
  }

  try {
    // Wait for connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear cache on connection failure to allow retry on next call
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Disconnects from MongoDB. Useful for cleanup during tests or graceful shutdowns.
 *
 * @returns Promise<void>
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
