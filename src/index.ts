import * as express from 'express';
import * as r from 'ramda';
import { Get, Set } from './routes';
import { createLogger } from './logger';
const app = express();
const port = 3030;

app.use(express.json());
createLogger();

r.forEachObjIndexed(val => {
  app.get(val.route, val.handler);
}, Get);

r.forEachObjIndexed(val => {
  app.post(val.route, val.handler);
}, Set);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
