import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import dotenv from 'dotenv'

dotenv.config()

console.log("jek");
console.log(process.env.DB_PASS);
const main = async () => {
    const orm = await MikroORM.init({
        entities: [Post],
        dbName: 'liserver',
        type: 'postgresql',
        debug: !__prod__,
        user: 'postgres',
        password: process.env.DB_PASS
    });

    const post = orm.em.create(Post, {title: 'my first post'})
    await orm.em.persistAndFlush(post);
}

main();