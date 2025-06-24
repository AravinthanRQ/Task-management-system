import getEnv from "../common/getEnv";
import * as dotenv from "dotenv";

dotenv.config();

export const PORT = parseInt(getEnv("PORT"), 10);
export const NODE_ENV = getEnv("NODE_ENV");
export const DB_HOST = getEnv("DB_HOST");
export const DB_PORT = parseInt(getEnv("DB_PORT"), 10);
export const DB_USERNAME = getEnv("DB_USERNAME");
export const DB_PASSWORD = getEnv("DB_PASSWORD");
export const DB_NAME = getEnv("DB_NAME");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_EXPIRATION = parseInt(getEnv("JWT_EXPIRATION"), 10);
export const SALT_ROUNDS = parseInt(getEnv("SALT_ROUNDS"), 10);
export const REDIS_HOST = getEnv("REDIS_HOST");
export const REDIS_PORT = parseInt(getEnv("REDIS_PORT"), 10);
export const QUEUE_NAME = getEnv("QUEUE_NAME");
export const ADMIN_EMAIL = getEnv("ADMIN_EMAIL");
export const ADMIN_PASSWORD = getEnv("ADMIN_PASSWORD");
export const EMAIL_FROM = getEnv("EMAIL_FROM");
export const EMAIL_SERVICE = getEnv("EMAIL_SERVICE");
export const EMAIL_USER = getEnv("EMAIL_USER");
export const EMAIL_PASS = getEnv("EMAIL_PASS");
export const DAILY_REMINDER_HOUR = parseInt(getEnv("DAILY_REMINDER_HOUR"), 10);
export const DAILY_REMINDER_MINUTE = parseInt(
    getEnv("DAILY_REMINDER_MINUTE"),
    10,
);
export const TEST_DB_NAME = getEnv("TEST_DB_NAME");
