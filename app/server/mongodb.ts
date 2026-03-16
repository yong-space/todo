import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  appName: "devrel.template.nextjs",
  maxPoolSize: 3,
  minPoolSize: 1,
  maxIdleTimeMS: 30_000,
  serverSelectionTimeoutMS: 5_000,
  heartbeatFrequencyMS: 30_000,
};

const globalWithMongo = global as typeof globalThis & {
  _mongoClient?: MongoClient;
};

if (!globalWithMongo._mongoClient) {
  globalWithMongo._mongoClient = new MongoClient(uri, options);
}

const client = globalWithMongo._mongoClient;

export default client;
