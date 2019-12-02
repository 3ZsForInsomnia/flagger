import { Request, Response } from 'express';
import { Document } from 'mongoose';

export type DataStoreType = 'boolean' | 'jsonConfig' | 'cssConfig';

export class FlaggerTypeError extends Error {
  constructor(keyWithWrongType: string, valueAttempted: any, typeExpected: DataStoreType) {
    super();
    this.message = `Flagger Type Error: Flagger received "${keyWithWrongType}",
      which is a ${typeof valueAttempted}, but was expecting a ${typeExpected}`;
  }
}

export class FlaggerResourceNotFoundError extends Error {
  constructor(nameOfMissingConfig: string) {
    super();
    this.message = `Flagger Resource Not Found Error: Flagger could not find or retrieve ${nameOfMissingConfig}!`;
  }
}

export interface RouteDefinition {
  callback: (req: Request, res: Response) => void;
  route: string;
}

export type StoreType = Map<string, any>;

export interface StoreInterface extends Document {
  type: DataStoreType;
  name: string;
  store: StoreType[];
  version: number;
}
