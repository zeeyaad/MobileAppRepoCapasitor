import { AppDataSource } from './data-source';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

/**
 * Connect to database with automatic retry logic
 * Attempts to connect up to MAX_RETRIES times with exponential backoff
 */
async function connectWithRetry(attempt = 1): Promise<void> {
  try {
    console.log(`🔗 Attempting database connection (attempt ${attempt}/${MAX_RETRIES})...`);
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delaySeconds = RETRY_DELAY / 1000;
      console.warn(`⚠️ Connection failed, retrying in ${delaySeconds}s...`);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      } else {
        console.error('Error details:', String(error));
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(attempt + 1);
    } else {
      console.error(`❌ Failed to connect after ${MAX_RETRIES} attempts`);
      throw error;
    }
  }
}

export default connectWithRetry;
