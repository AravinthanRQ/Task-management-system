import app from "./app";
import log from "./common/log";
import { logT } from "./common/logT.enum";
import { AppDataSource } from "./config/data-source";
import { PORT } from "./config/env";
import seedAdminUser from "./repositories/admin.seed";
import { scheduleDailyReminders } from "./queues/reminder.queue";

const start_app = async () => {
    try {
        await AppDataSource.initialize();
        log(logT.Log, "Database connected Successfully");

        await seedAdminUser();

        await scheduleDailyReminders();

        app.listen(PORT, () => {
            log(logT.Log, `Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        log(logT.Error, `Error connecting to database: ${error}`);
        process.exit(1); // Exit if initialization fails as database connection failure is CRITICAL
    }
};

start_app();
