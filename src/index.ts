import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import dotenv from 'dotenv'
import microConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from 'express-session';
import connectRedis from 'connect-redis'
import { MyContext } from "./types";

dotenv.config()

const main = async () => {
    const orm = await MikroORM.init(microConfig); // Connect to DB
    orm.getMigrator().up(); // Run migration

    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();

    const app = express(); 

    app.set("trust proxy", !__prod__);
    app.set("Access-Control-Allow-Origin", "https://studio.apollographql.com");
    app.set("Access-Control-Allow-Credentials", true);

    const RedisStore = connectRedis(session)
    const { createClient } = require("redis")
   
    let redisClient = createClient({ legacyMode: true })
    redisClient.connect().catch(console.error)

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({ 
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 5,
                httpOnly: true,
                sameSite: 'lax',
                secure: true
            },
            saveUninitialized: false,
            secret: 'asdasdasd',
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res}): MyContext => ({ em: orm.em, req, res })
    });

    await apolloServer.start();

    const cors = { credentials: true, origin: 'https://studio.apollographql.com' }

    apolloServer.applyMiddleware({ app, cors });
 
    app.listen(4000, () => {
        console.log('server started on localhos:4000')
    })
}

main().catch((err) => {
    console.error(err);
});