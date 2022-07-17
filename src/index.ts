import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import dotenv from 'dotenv'
import microConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

dotenv.config()

const main = async () => {
    const orm = await MikroORM.init(microConfig); // Connect to DB
    orm.getMigrator().up(); // Run migration

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });
    
    app.listen(4000, () => {
        console.log('server started on localhos:4000')
    })
}

main().catch((err) => {
    console.error(err);
});