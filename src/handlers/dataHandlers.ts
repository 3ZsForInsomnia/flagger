import { Store } from '../connections/connectToDb';
import { DataStoreType, StoreInterface, FlaggerResourceNotFoundError } from '../types';
import { logAndRunCallback, getAsync, setInCache, deserialize } from '../utils';
import { forEachObjIndexed } from 'ramda';
import { client } from '../connections/connectToRedis';

export const createConfig = ({
  name,
  type,
  callback,
  errorCallback
}: {
  name: string;
  type: DataStoreType;
  callback: (config: StoreInterface) => void;
  errorCallback?: (error) => void;
}) =>
  getAsync(name).then(response => {
    if (response)
      errorCallback(
        new Error(`Failed to create the config: a config with the name of ${name} already exists`)
      );
    else {
      new Store({ name, type, store: [], version: 0 }).save({}, (error, config: StoreInterface) => {
        logAndRunCallback(callback, errorCallback)(error, config);
        setInCache(config);
      });
    }
  });

export const getConfigs = (
  callback: (config: StoreInterface[]) => void,
  errorCallback?: (error: any) => void
) =>
  Store.find({}, (error, configs: StoreInterface[]) => {
    if (error && errorCallback) errorCallback(error);
    else if (configs) callback(configs);
  });

export const getConfig = ({
  name,
  callback,
  errorCallback
}: {
  name: string;
  callback: (config: StoreInterface) => void;
  errorCallback?: (error) => void;
}) =>
  getAsync(name).then((response: string) => {
    if (response) {
      console.log(`getting ${name} from cache`);
      callback(deserialize(response));
    } else {
      console.log(`getting ${name} from database`);
      Store.findOne({ name }, logAndRunCallback(callback, errorCallback))
        .exec()
        .then(setInCache);
    }
  });

export const setConfigValues = ({
  name,
  map,
  callback,
  errorOnSaveCallback,
  errorOnRetrieveCallback
}: {
  name: string;
  map: Map<string, any>;
  callback: (config: StoreInterface) => void;
  errorOnSaveCallback?: (error) => void;
  errorOnRetrieveCallback?: (error?: any) => void;
}) => {
  Store.findOne({ name }, (error, config: StoreInterface) => {
    if (config) {
      map.forEach((value, key) => config.store[config.version - 1].set(key, value));
      const newConfig = config;
      Store.updateOne({ name }, newConfig)
        .exec()
        .then(() => {
          setInCache(newConfig);
          callback(newConfig);
        })
        .catch(error => (errorOnSaveCallback ? errorOnSaveCallback(error) : console.error(error)));
    } else {
      if (errorOnRetrieveCallback) errorOnRetrieveCallback(error);
      throw new FlaggerResourceNotFoundError(name);
    }
  });
};

export const deleteConfigValue = ({
  name,
  valueToDelete,
  callback,
  errorOnRetrieveCallback,
  errorOnSaveCallback
}: {
  name: string;
  valueToDelete: string;
  callback: (config: StoreInterface) => void;
  errorOnSaveCallback?: (error) => void;
  errorOnRetrieveCallback?: (error?: any) => void;
}) =>
  Store.findOne({ name }, (error, config: StoreInterface) => {
    if (config) {
      config.store[config.version - 1].delete(valueToDelete);
      const newConfig = config;
      Store.updateOne({ name }, newConfig)
        .exec()
        .then(() => {
          setInCache(newConfig);
          callback(newConfig);
        })
        .catch(error => (errorOnSaveCallback ? errorOnSaveCallback(error) : console.error(error)));
    } else {
      if (errorOnRetrieveCallback) errorOnRetrieveCallback(error);
      throw new FlaggerResourceNotFoundError(name);
    }
  });

export const deleteConfig = ({
  name,
  callback,
  errorOnDeleteCallback
}: {
  name: string;
  callback: () => void;
  errorOnDeleteCallback?: (error) => void;
}) =>
  Store.deleteOne({ name }, error => {
    if (error) errorOnDeleteCallback(error);
    else callback();
  })
    .exec()
    .then(() => client.del(name));

const versioningCallback = (
  config: StoreInterface,
  values: Map<string, any>,
  callback: (config: StoreInterface) => void,
  errorCallback: (error) => void
) => {
  if (config.type === 'boolean') {
    const foundInvalidType = Object.keys(values).find(val => typeof val !== 'boolean');
    if (foundInvalidType)
      errorCallback(
        new Error(
          `Invalid values were passed in for this config type! Found ${typeof foundInvalidType} and was expecting ${
            config.type
          }`
        )
      );
  }
  config.version += 1;
  config.store.push(new Map<string, any>(values));
  config.save().then(updatedConfig => {
    setInCache(updatedConfig);
    callback(updatedConfig);
  });
};

export const versionConfig = (
  name: string,
  type: DataStoreType,
  values: Map<string, any>,
  callback: (config: StoreInterface) => void,
  errorCallback: (error) => void
) =>
  Store.findOne(
    { name },
    logAndRunCallback((config: StoreInterface) =>
      versioningCallback(config, values, callback, errorCallback)
    )
  );
