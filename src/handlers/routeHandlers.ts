import * as http from 'http-status-codes';
import * as logic from './logicHandlers';
import { RouteDefinition, StoreInterface, DataStoreType } from 'src/types';

export const get: { [key: string]: RouteDefinition } = {
  getConfigs: {
    route: '/configs',
    callback: (req, res) => {
      console.log('getting configs');
      logic.getConfigs((configs: StoreInterface[]) => {
        if (configs) res.send({ configs });
        else res.status(http.INTERNAL_SERVER_ERROR).send({ message: 'Could not retrieve configs' });
      });
    }
  },
  getConfig: {
    route: '/configs/:name',
    callback: (req, res) =>
      logic.getConfig(
        req.params.name,
        (config: StoreInterface) => {
          if (config) res.send({ config });
          else res.status(http.NOT_FOUND).send({ message: `Your config, ${name} was not found` });
        },
        error => console.error(`Failed to retrieve ${name}: ${error}`)
      )
  },
  getConfigType: {
    route: '/configs/:name/type',
    callback: (req, res) =>
      logic.getConfigType(req.params.name, (type: DataStoreType) =>
        type
          ? res.send({ [req.params.name]: type })
          : res
              .status(http.NOT_FOUND)
              .send({ message: `A type could not be found for config: ${name}` })
      )
  },
  getConfigVersions: {
    route: '/configs/:name/versions',
    callback: (req, res) =>
      logic.getConfigVersions(req.params.name, (store: Map<string, any>[]) =>
        store
          ? res.send({ [req.params.name]: [...store] })
          : res.status(http.NOT_FOUND).send({ message: `The config could not be found: ${name}` })
      )
  },
  getConfigStoreAtVersion: {
    route: '/configs/:name/versions/:version',
    callback: (req, res) =>
      logic.getConfigVersions(req.params.name, (store: Map<string, any>[]) =>
        store
          ? res.send({ [req.params.name]: [store[req.params.version]] })
          : res.status(http.NOT_FOUND).send({ message: `The config could not be found: ${name}` })
      )
  },
  getConfigValue: {
    route: '/configs/:name/key/:key',
    callback: (req, res) =>
      logic.getConfigVersions(req.params.name, (store: {}[]) => {
        console.log('store :', store);
        store
          ? res.send({
              [req.params.name]: { [req.params.key]: store[store.length - 1][req.params.key] }
            })
          : res.status(http.NOT_FOUND).send({ message: `The config could not be found: ${name}` });
      })
  },
  getConfigValueAtVersion: {
    route: '/configs/:name/versions/:version/:key',
    callback: (req, res) =>
      logic.getConfigVersions(req.params.name, (store: {}[]) =>
        store
          ? res.send({
              [req.params.name]: { [req.params.key]: store[req.params.version][req.params.key] }
            })
          : res.status(http.NOT_FOUND).send({ message: `The config could not be found: ${name}` })
      )
  }
};

export const post: { [key: string]: RouteDefinition } = {
  createConfig: {
    route: '/configs/',
    callback: (req, res) =>
      logic.createConfig(
        req.body.name,
        req.body.type,
        req.body.values,
        config => {
          if (config) res.send({ config });
          else
            res
              .status(http.INTERNAL_SERVER_ERROR)
              .send({ message: `Failed to create config ${req.body.name}` });
        },
        error => {
          res
            .status(http.INTERNAL_SERVER_ERROR)
            .send({ message: `Failed to create config ${req.body.name} due to ${error}` });
        }
      )
  },
  setConfigValues: {
    route: '/configs/:name/values',
    callback: (req, res) =>
      logic.setConfigValues(
        req.params.name,
        req.body.type,
        req.body.values,
        (config: StoreInterface) => {
          if (config) res.send({ config });
          else
            res
              .status(http.INTERNAL_SERVER_ERROR)
              .send({ message: `Could not update ${req.params.name}!` });
        },
        (error: Error) =>
          res
            .status(http.INTERNAL_SERVER_ERROR)
            .send({ message: `Could not update ${req.params.name} due to ${error}` })
      )
  },
  deleteConfigValue: {
    route: '/configs/:name/delete',
    callback: (req, res) =>
      logic.deleteConfigValue(
        req.params.name,
        req.body.key,
        (config: StoreInterface) => {
          if (config) res.send({ config });
          else
            res
              .status(http.INTERNAL_SERVER_ERROR)
              .send({ message: `Failed to delete ${req.body.key} from ${req.body.name}` });
        },
        (error: Error) => {
          res.status(http.INTERNAL_SERVER_ERROR).send({
            message: `Failed to delete ${req.body.key} from ${req.body.name} due to ${error}`
          });
        }
      )
  },
  versionConfig: {
    route: '/configs/:name/version',
    callback: (req, res) =>
      logic.versionConfig(
        req.body.name,
        req.body.type,
        req.body.values,
        (config: StoreInterface) => {
          if (config) res.send({ config });
          else
            res
              .status(http.INTERNAL_SERVER_ERROR)
              .send({ message: `Could not version the config: ${req.body.name}` });
        },
        error => {
          res
            .status(http.INTERNAL_SERVER_ERROR)
            .send({ message: `Encountered error during versioning: ${error}` });
        }
      )
  }
};

export const methods = {
  get,
  post,
  delete: {
    deleteConfig: {
      route: '/configs/:name',
      callback: (req, res) =>
        logic.getConfig(req.params.name, config =>
          logic.deleteConfig(
            req.params.name,
            () => res.send({ [req.params.name]: config }),
            () =>
              res
                .status(http.INTERNAL_SERVER_ERROR)
                .send({ message: `Failed to delete ${req.params.name}` })
          )
        )
    }
  }
};
