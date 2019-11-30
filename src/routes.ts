import { Request, Response } from 'express';
import { Params } from 'express-serve-static-core';
import * as http from 'http-status-codes';
import dataStore, { DataStoreType } from './dataAccess';
import { StoreInterface } from './connectToDb';

type routeDefinition<TRequest extends Params = null> = {
  handler: (req: Request<TRequest>, res: Response) => void;
  route: string;
};

export const createConfig: routeDefinition<{ name: string; type?: DataStoreType }> = {
  handler: (req, res) => {
    const { name, type } = req.params;
    let values = req.body;
    let actualType;
    if (values.type && values.data) {
      actualType = values.type;
      values = values.data;
    } else {
      actualType = type;
    }
    dataStore.getByName(name).then(config => {
      if (config) {
        dataStore.addConfigValues(name, values);
        res.send();
      } else {
        dataStore.createConfig(name, actualType).then(createdConfig => {
          if (values) {
            dataStore.addConfigValues(name, values).then(finalConfig => res.send(finalConfig));
          } else {
            res.send(createdConfig);
          }
        });
      }
    });
  },
  route: '/:name'
};

export const getConfig: routeDefinition<{ name: string }> = {
  handler: (req, res) =>
    dataStore.getByName(req.params.name).then(config => {
      if (config) {
        res.send(config);
      } else {
        res.status(http.NOT_FOUND).send({
          message: `The config '${config}'was not found! `
        });
      }
    }),
  route: '/:name'
};

export const getConfigValue: routeDefinition<{ name: string; key: string }> = {
  handler: (req, res) => {
    dataStore.getByName(req.params.name).then((config: StoreInterface) => {
      if (config) {
        res.send({
          [req.params.key]: config.store.get(req.params.key)
        });
      } else {
        res.status(http.NOT_FOUND).send({
          message: `The config value ${req.params.key} was not found in ${req.params.name}!`
        });
      }
    });
  },
  route: '/:name/:key'
};

export const getConfigType: routeDefinition<{ name: string }> = {
  handler: (req, res) =>
    dataStore.getByName(req.params.name).then((config: StoreInterface) => {
      return config
        ? res.send({ type: config.type })
        : res
            .status(http.NOT_FOUND)
            .send({ message: `The config ${req.params.name} was not found` });
    }),
  route: '/:name/type'
};

export const Get = {
  getConfigType,
  getConfig,
  getConfigValue
};

export const Set = {
  createConfig
};
