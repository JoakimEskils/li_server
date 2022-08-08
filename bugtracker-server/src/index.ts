import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import {__prod__} from "./constants";
import session from "express-session";
import connectRedis from "connect-redis";
import "reflect-metadata";
import dotenv from 'dotenv'
import { DataSource } from 'typeorm';
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from 'path';

dotenv.config()

const main = async () => {
  const conn = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: process.env.DB_PASS,
    database: "liserver2",
    synchronize: true,
    logging: true,
    entities: [Post, User],
    subscribers: [],
    migrations: {
        path: path.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
    }
})
  const app = express();

  const { createClient } = require('redis')

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });

  await redisClient.connect();

  const appSession = session({
    name: String(process.env.COOKIE_NAME),
    secret: "shhecret",
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({
      client: redisClient,
    })
    ,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: true,
      httpOnly: false,
      sameSite: "none",
    },
  })

  app.use(appSession);

  app.set("trust proxy", !__prod__);
  app.set("Access-Control-Allow-Origin", "https://studio.apollographql.com");
  app.set("Access-Control-Allow-Credentials", true)

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ res, req }) => ({ res, req, conn }),
    introspection: !__prod__,
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: ["https://studio.apollographql.com", "http://localhost:3000"],
      credentials: true,
    },
  });

  app.get("/hello", (_, res) => {
    res.send("Hello World");
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};


main().catch((err) => {
  console.error(err);
})