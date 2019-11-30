import { Request, Response } from 'express';
import { Params } from 'express-serve-static-core';
import dataStore, { DataStoreType } from './dataAccess';

type routeDefinition<TRequest extends Params = null> = {
  handler: (req: Request<TRequest>, res: Response) => void;
  route: string;
};

export const createConfig: routeDefinition<{ config: string; type?: DataStoreType }> = {
  handler: (req, res) => {
    const { config } = req.params;
    let values = req.body;
    if (values.type && values.data) {
      dataStore.createConfig(config, values.type);
      delete values.type;
      values = values.data;
    } else {
      dataStore.createConfig(config);
    }
    if (!dataStore.getConfig(config)) {
      dataStore.createConfig(config);
      dataStore.addConfigValues(config, values);
      res.send(dataStore.getConfig(config));
    } else {
      dataStore.addConfigValues(config, values);
      res.send(dataStore.getConfig(config));
    }
  },
  route: '/:config'
};

export const getConfig: routeDefinition<{ config: string }> = {
  handler: (req, res) => res.send(dataStore.getConfig(req.params.config)),
  route: '/:config'
};

export const getConfigValue: routeDefinition<{ config: string; key: string }> = {
  handler: (req, res) => res.send(dataStore.getConfigValue(req.params.config, req.params.key)),
  route: '/:config/:key'
};

export const Get = {
  getConfig,
  getConfigValue
};

export const Set = {
  createConfig
};
