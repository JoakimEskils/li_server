import { IDatabaseDriver, Connection, EntityManager } from "@mikro-orm/core"
import { Request, Response } from 'express'
import { Redis } from "ioredis"
import { Session, SessionData } from "express-session";
import { DataSource } from "typeorm";

export type MyContext = {
    req: Request & {
        session?: Session & Partial<SessionData> & { userId: number };
    };
    redis: Redis;
    res: Response;
    conn: DataSource;
}