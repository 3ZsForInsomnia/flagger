import * as express from 'express';
import { forEachObjIndexed } from 'ramda';
import { methods } from './handlers/routeHandlers';
import { createLogger, connectToRedis } from './connections';
import { connectToDB } from './connections';

const port = 3030;

const app = express();

app.use(express.json());
connectToDB();
connectToRedis();
app.use(createLogger());

forEachObjIndexed((_, method) => {
  forEachObjIndexed(handler => {
    app[method](handler.route, handler.callback);
  }, methods[method]);
}, methods);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
