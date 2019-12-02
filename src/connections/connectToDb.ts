import * as mongoose from 'mongoose';
import { StoreInterface } from '../types';

const timeout = 1000;
const mongoUrl = 'localhost';
const mongoPort = 27017;

export const connectToDB = () => {
  mongoose.connect(`mongodb://${mongoUrl}:${mongoPort}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: timeout
  });
  const db = mongoose.connection;

  db.on('error', () => console.error('An error occurred with the database'));

  db.once('open', () => console.log('Successfully connected to mongo!'));

  return db;
};

const storeSchema = new mongoose.Schema<StoreInterface>({
  type: String,
  name: String,
  store: [Map],
  version: Number
});

export const Store = mongoose.model('Store', storeSchema);
