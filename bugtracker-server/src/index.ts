import { MikroORM } from "@mikro-orm/core";
import microConfig from "./mikro-orm.config";
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

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();

  const { createClient } = require('redis')

  const RedisStore = connectRedis(session);
  const redisClient = createClient({ legacyMode: true });

  await redisClient.connect();

  const appSession = session({
    name: "qid",
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
    context: ({ res, req }) => ({ em: orm.em, res, req }),
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