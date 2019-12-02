import { StoreInterface, DataStoreType, StoreType } from '../types';
import * as data from './dataHandlers';
import { forEachObjIndexed } from 'ramda';
import { typeCheck } from '../utils';

export const getConfigs = (
  callback: (configs: StoreInterface[]) => void,
  errorCallback?: (error) => void
) => data.getConfigs(configs => callback(configs), errorCallback);

export const getConfig = (
  name: string,
  callback: (config: StoreInterface) => void,
  errorCallback?: (error) => void
) => data.getConfig({ name, callback, errorCallback });

export const getConfigVersions = (
  name: string,
  callback: (config: StoreType[]) => void,
  errorCallback?: (error) => void
) =>
  data.getConfig({
    name,
    callback: (config: StoreInterface) => callback(config.store),
    errorCallback
  });

export const getConfigType = (
  name: string,
  callback: (type: DataStoreType) => void,
  errorCallback?: (error) => void
) =>
  data.getConfig({
    name,
    callback: config => callback(config.type),
    errorCallback
  });

export const getConfigValue = (
  name: string,
  key: string,
  callback: (type: DataStoreType) => void,
  errorCallback?: (error) => void
) =>
  data.getConfig({
    name,
    callback: config => callback(config.store[config.version - 1].get(key)),
    errorCallback
  });

export const createConfig = (
  name: string,
  type: DataStoreType,
  values: object,
  callback: (config: StoreInterface) => void,
  errorCallback: (error: any) => void
) => {
  if (typeCheck(type, values, errorCallback)) {
    const map = new Map<string, any>();
    forEachObjIndexed((value, key) => map.set(key, value), values);
    data.createConfig({
      name,
      type,
      callback: () => {
        data.versionConfig(name, type, map, callback, errorCallback);
      },
      errorCallback
    });
  }
};

export const deleteConfig = (name, callback, errorOnDeleteCallback) =>
  data.deleteConfig({ name, callback, errorOnDeleteCallback });

export const setConfigValues = (
  name,
  type,
  newValues,
  callback: (config: StoreInterface) => void,
  errorCallback?: (error) => void
) => {
  const map = new Map<string, any>();
  if (typeCheck(type, newValues, errorCallback)) {
    forEachObjIndexed((value, key) => map.set(key as string, value), newValues);
    data.setConfigValues({ name, map, callback, errorOnSaveCallback: errorCallback });
  }
};

export const deleteConfigValue = (
  name: string,
  valueToDelete: string,
  callback: (config: StoreInterface) => void,
  errorCallback?: (error) => void
) =>
  data.deleteConfigValue({ name, valueToDelete, callback, errorOnRetrieveCallback: errorCallback });

export const versionConfig = (
  name: string,
  type: DataStoreType,
  values: object,
  callback: (config: StoreInterface) => void,
  errorCallback: (errorCallback) => void
) => {
  if (typeCheck(type, values, errorCallback)) {
    const map = new Map<string, any>();
    forEachObjIndexed((value, key) => map.set(key, value), values);
    data.versionConfig(name, type, map, callback, errorCallback);
  }
};
