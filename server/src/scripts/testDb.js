import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading env files in order of priority (root, server, local)
dotenv.config({ path: path.resolve(__dirname, '../../../.env.production') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.production') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const uri = process.env.MONGODB_URI;

function maskUri(rawUri) {
  if (!rawUri) return '(none)';
  return rawUri.replace(/(:\/\/)([^:@]+):([^@]+)@/, '$1$2:****@');
}

console.log('='.repeat(60));
console.log('🔍 [AI-MYSTERY-ROOM] MongoDB Atlas Connection Tester');
console.log('='.repeat(60));
console.log(`Target URI: ${maskUri(uri)}`);

if (!uri) {
  console.error('\n❌ No MONGODB_URI found in .env or .env.production.');
  console.error('Please configure MONGODB_URI in your .env or .env.production file.');
  process.exit(1);
}

const isAtlas = uri.includes('mongodb+srv://') || uri.includes('mongodb.net');
console.log(`Connection Type: ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
console.log('\nConnecting...');

try {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 6000,
    connectTimeoutMS: 6000,
  });

  console.log('\n✅ SUCCESS: Connected to MongoDB successfully!');
  console.log(`Host: ${conn.connection.host}`);
  console.log(`Database Name: ${conn.connection.name}`);
  console.log(`Ready State: ${conn.connection.readyState === 1 ? 'Connected (1)' : conn.connection.readyState}`);

  await mongoose.disconnect();
  console.log('Connection closed cleanly.');
  console.log('='.repeat(60));
  process.exit(0);
} catch (err) {
  console.error('\n❌ CONNECTION FAILED:');
  console.error(err.message);

  if (err.message.includes('whitelist') || err.message.includes('Could not connect to any servers')) {
    console.error('\n💡 Root Cause: IP Whitelist Restriction in MongoDB Atlas');
    console.error('Atlas firewall is rejecting your current IP address.');
    console.error('Fix:');
    console.error('  1. Go to https://cloud.mongodb.com -> Select your project');
    console.error('  2. Click "Network Access" under "Security" on the left menu');
    console.error('  3. Click "Add IP Address"');
    console.error('  4. Select "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('  5. Click "Confirm" and wait ~1 minute for Atlas to apply.');
  } else if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
    console.error('\n💡 Root Cause: Invalid Database Credentials');
    console.error('Check username and password in Database Access on cloud.mongodb.com.');
  } else if (err.message.includes('ECONNREFUSED')) {
    console.error('\n💡 Root Cause: Local MongoDB service is not running on port 27017.');
    console.error('If you intend to use Atlas Cloud, set MONGODB_URI to your Atlas connection string in .env.');
  }

  console.log('='.repeat(60));
  process.exit(1);
}
