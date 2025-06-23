import app from "./app";
import { AppDataSource } from "./config/data-source";
import { PORT } from "./config/env";

const start_app = async () => {
    try {
        await AppDataSource.initialize();
        console.log("[LOG] Database connected Successfully");

        app.listen(PORT, () => {
            console.log(`[LOG] Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("[ERROR] Error connecting to database: ", error);
        process.exit(1); // Exit if initialization fails
    }
};

start_app();
