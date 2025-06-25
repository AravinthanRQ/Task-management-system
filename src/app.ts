import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/projects.routes";
import taskRoutes from "./routes/tasks.routes";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (_, res) => {
    res.send("Hello world");
});

export default app;
