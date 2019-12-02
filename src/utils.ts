import { promisify } from 'util';
import { client } from './connections/connectToRedis';
import { StoreInterface, DataStoreType } from './types';

export const deserialize = (json: string) => (json ? JSON.parse(json) : '');
export const serialize = (obj: object) => JSON.stringify(obj);

export const getAsync = promisify(client.get).bind(client);
// .then(deserialize);
export const setInCache = (config: StoreInterface) => client.set(config.name, serialize(config));

export const logging = (err, config: StoreInterface) =>
  err
    ? console.error('An error was returned from database: ', err)
    : console.log('Returning config :', config);

export const logAndRunCallback = (
  callback: (config: StoreInterface) => void,
  errorCallback?: (error) => void
) => (error, config: StoreInterface) => {
  logging(error, config);
  if (config) callback(config);
  else if (error && errorCallback) errorCallback(error);
};

export const typeCheck = (
  type: DataStoreType,
  values: object,
  errorCallback: (error: Error) => void
) => {
  if (type === 'boolean') {
    const foundInvalidType = Object.keys(values).find(key => typeof values[key] !== 'boolean');
    if (foundInvalidType)
      errorCallback(
        new Error(
          `Invalid values were passed in for this config type! Found ${typeof foundInvalidType} and was expecting ${type}`
        )
      );
    else return true;
  }
};
