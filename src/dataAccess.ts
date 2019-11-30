import { Store, StoreInterface } from './connectToDb';
import { forEachObjIndexed } from 'ramda';

export type DataStoreType = 'boolean' | 'jsonConfig' | 'cssConfig';

class FlaggerTypeError extends Error {
  constructor(keyWithWrongType: string, valueAttempted: any, typeExpected: DataStoreType) {
    super();
    this.message = `Flagger Type Error: Flagger received "${keyWithWrongType}",
      which is a ${typeof valueAttempted}, but was expecting a ${typeExpected}`;
  }
}

const logging = (err, config: StoreInterface) => {
  if (err) {
    console.error('An error was returned from the database: ', err);
  } else {
    console.log('Returning config :', config);
  }
};

export const createConfig = (name: string, type: DataStoreType = 'boolean') =>
  new Store({ name, type, store: {} }).save();

export const getConfigValue = (name: string) => {
  return Store.findOne({ name }, logging);
};

export const getByName = (name: string) => Store.findOne({ name }, logging);

export const addConfigValue = (name: string, key: string, value: any) =>
  Store.findOne({ name }, logging).exec((err, config: StoreInterface) => {
    return !err && config && config.type === 'boolean' && typeof value === 'boolean'
      ? Store.updateOne({ name }, { ...config, store: { ...config.store, [key]: value } })
      : null;
  });

export const addConfigValues = (name: string, values: object) => {
  return Store.findOne({ name }, logging).exec((err, config: StoreInterface) => {
    if (config.type === 'boolean') {
      const keyWithWrongType = Object.keys(values).find(key => typeof values[key] !== 'boolean');
      if (keyWithWrongType) {
        throw new FlaggerTypeError(keyWithWrongType, values[keyWithWrongType], config.type);
      }
    }
    if (!err && config) {
      forEachObjIndexed((value, key) => {
        config.store.set(key, values[key]);
      }, values);
      logging(err, config);
      config.save();
    }
  });
};

export default {
  createConfig,
  addConfigValue,
  addConfigValues,
  getByName,
  getConfigValue
};
