import * as mongoose from 'mongoose';
import { DataStoreType } from './dataAccess';

const timeout = 1000;

export const connectToDB = () => {
  mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: timeout
  });
  const db = mongoose.connection;

  db.on('error', () => console.error.bind(console, 'An error occurred with the database'));

  db.once('open', () => console.log.bind(console, 'Successfully connected to mongo!'));
};

export interface StoreInterface extends mongoose.Document {
  type: DataStoreType;
  name: string;
  store: Map<string, any>;
  addKeyValues(values: object): void;
}

const storeSchema = new mongoose.Schema<StoreInterface>({
  type: String,
  name: String,
  store: Map
});
storeSchema.methods.addKeyValues = function(values: object) {
  this.store = { ...this.store, ...values };
};

export const Store = mongoose.model('Store', storeSchema);
