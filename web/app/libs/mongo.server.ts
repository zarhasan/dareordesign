import { MongoClient } from 'mongodb';

import type { MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_CONNECTION_STRING) {
  throw new Error("Set mongodb URI");
}

let mongo: MongoClient;
let database: any = null;
let instance: any = null;

const databaseName = "dareordesign";
const options: MongoClientOptions = {
  keepAlive: true,
  maxPoolSize: 100,
  retryWrites: true,
  w: "majority",
  maxIdleTimeMS: 1000 * 60 * 60 * 15,
};

declare global {
  var __mongoClient: MongoClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  mongo = new MongoClient(process.env.MONGODB_CONNECTION_STRING, options);
} else {
  if (!global.__mongoClient) {
    global.__mongoClient = new MongoClient(
      process.env.MONGODB_CONNECTION_STRING,
      options
    );
  }
  mongo = global.__mongoClient;
}

if (!instance) {
  mongo.connect((err, newInstance) => {
    if (err) {
      console.error(err);
    }

    if (!newInstance) {
      throw new Error("DATABASE_CONNECTION_ERROR");
    }

    instance = newInstance;

    process.on("SIGINT", function () {
      mongo.close();
    });
  });
}

database = mongo.db(databaseName);

export { mongo, database };
