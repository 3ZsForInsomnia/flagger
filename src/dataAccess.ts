export type DataStoreType = 'boolean' | 'jsonConfig' | 'cssConfig';

class FlaggerTypeError extends Error {
  constructor(keyWithWrongType: string, valueAttempted: any, typeExpected: DataStoreType) {
    super();
    this.message = `Flagger Type Error: Flagger received "${valueAttempted}",
      which is a ${typeof valueAttempted}, but was expecting a ${typeExpected}`;
  }
}

type DataStore = {
  [storeName: string]: {
    type: DataStoreType;
    store: {
      [key: string]: any;
    };
  };
};

const dataStore: DataStore = {};

export const createConfig = (config: string, type: DataStoreType = 'boolean') => {
  dataStore[config] = {
    type,
    store: {}
  };
};

export const getConfigValue = (config: string, key: string) =>
  dataStore[config] ? dataStore[config].store[key] : null;

export const getConfig = (config: string) => (dataStore[config] ? dataStore[config].store : null);

export const getConfigType = (config: string) =>
  dataStore[config] ? dataStore[config].type : null;

export const addConfigValue = (config: string, key: string, value: any) => {
  if (
    dataStore[config] &&
    (dataStore[config].type === 'boolean' ? typeof value === 'boolean' : false)
  ) {
    dataStore[config].store[key] = value;
    return { [key]: value };
  } else {
    return null;
  }
};

export const addConfigValues = (config: string, values: object) => {
  if (dataStore[config].type === 'boolean') {
    const keys = Object.keys(values);
    const keyWithWrongType = keys.find(key => typeof values[key] !== 'boolean');
    if (keyWithWrongType) {
      throw new FlaggerTypeError(
        keyWithWrongType,
        values[keyWithWrongType],
        dataStore[config].type
      );
    }
  }
  dataStore[config].store = {
    ...dataStore[config].store,
    ...values
  };
  return dataStore[config];
};

export default {
  createConfig,
  addConfigValue,
  addConfigValues,
  getConfig,
  getConfigType,
  getConfigValue
};
