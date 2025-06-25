import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Project } from "../entities/Project";
import { Task } from "../entities/Tasks";
import {
    NODE_ENV,
    DB_HOST,
    DB_PASSWORD,
    DB_PORT,
    DB_USERNAME,
    TEST_DB_NAME,
} from "./env";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: TEST_DB_NAME,
    synchronize: NODE_ENV ? true : false,
    logging: true,
    entities: [User, Project, Task],
    subscribers: [],
    migrations: [],
});
