import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Get database URL from environment variables
const connectionString = process.env.DATABASE_URL || '';

export const postgresClient = postgres(connectionString, {
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Maximum connection lifetime (30 minutes)
});

// Export the postgres client for direct SQL queries
export { postgresClient as postgres };

// Create drizzle instance
export const db = drizzle(postgresClient);

// Export schema and queries
export * from './schema';
export * from './queries';