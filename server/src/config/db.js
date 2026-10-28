import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_mystery_room';

  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const isProd = process.env.NODE_ENV === 'production';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isProd ? 10000 : 2000,
      connectTimeoutMS: isProd ? 10000 : 2000,
    });
    isConnected = true;
    console.log(`[AI-MYSTERY-ROOM] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[AI-MYSTERY-ROOM] MongoDB connection unavailable (${err.message}). Running with in-memory persistence.`);
    isConnected = false;
    return null;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
