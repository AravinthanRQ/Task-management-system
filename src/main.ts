import { AppDataSource } from "./config/data-source";

AppDataSource.initialize()
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => {
        console.log("Error connecting to database: ", error);
    });
