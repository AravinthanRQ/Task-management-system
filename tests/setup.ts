/*
 * The setup file runs once after Jest is configured but before any tests are executed
 * -> Connect to the database before all test suites run
 * -> Disconnect from the database after all test suites have finished
 */

import { AppDataSource } from "../src/config/data-source";

beforeAll(async () => {
    // Check if the connection is initilaized already else inititialize
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
});

afterAll(async () => {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
});
