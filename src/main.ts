import { AppDataSource } from "./config/data-source";
import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { PORT } from "./config/env";

const start_app = async () => {
    try {
        const app = express();

        app.use(express.json());
        app.use("/auth", authRoutes);
        app.use("/users", userRoutes);

        AppDataSource.initialize();

        app.get("/", (_, res) => {
            res.send("Hello world");
        });

        app.listen(PORT, () => {
            console.log(`[LOG] Server running at http://localhost:${PORT}`);
        });

        console.log("[LOG] Database connected Successfully");
    } catch (error) {
        console.error("[ERROR] Error connecting to database: ", error);
    }
};

start_app();
