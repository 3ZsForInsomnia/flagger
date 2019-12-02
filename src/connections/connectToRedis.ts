import * as redis from 'redis';

const redisUrl = 'localhost';
const redisPort = 6379;

export const client = redis.createClient(`redis://${redisUrl}:${redisPort}`);

export const connectToRedis = () => {
  client.on('error', err => {
    console.error('Error ' + err);
  });

  client.on('ready', () => {
    console.log('Successfully connected to redis!');
  });
};
