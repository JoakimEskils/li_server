import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import dotenv from 'dotenv'
import microConfig from './mikro-orm.config'

dotenv.config()

const main = async () => {
    const orm = await MikroORM.init(microConfig); // Connect to DB
    orm.getMigrator().up(); // Run migration
    //const post = orm.em.create(Post, {title: 'my first post'}) // Create post
    //await orm.em.persistAndFlush(post); // Persist post

    //const posts = await orm.em.find(Post, {});
    //console.log(posts)
}

main().catch((err) => {
    console.error(err);
});