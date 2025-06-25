/*
 * The setup file runs once after Jest is configured but before any tests are executed
 * -> Connect to the database before all test suites run
 * -> Disconnect from the database after all test suites have finished
 */

import { AppDataSource } from "../src/config/data-source";
import seedAdminUser from "../src/repositories/admin.seed";
import redisConnection from "../src/config/redisConnection";
import { messageQueue } from "../src/queues/queue";

// Helper function to clean the database
const cleanDatabase = async () => {
    const entities = AppDataSource.entityMetadatas;
    const tableNames = entities.map(entity => `"${entity.tableName}"`).join(', ');
    
    if (tableNames.length) {
        await AppDataSource.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
    }
};

// This runs once before all tests
beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }
});

// This runs before each test file, ensuring a clean state
beforeEach(async () => {
    // Clean DB and re-seed admin for a consistent state
    await cleanDatabase();
    await seedAdminUser();
});

// This runs once after all tests are complete
afterAll(async () => {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    // Close mock connections to ensure Jest exits cleanly
    await messageQueue.close();
    await redisConnection.quit();
});