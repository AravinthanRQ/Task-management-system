import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Project } from "../entities/Project";
import { Task } from "../entities/Tasks";

const userRepository = AppDataSource.getRepository(User);
const projectRepository = AppDataSource.getRepository(Project);
const taskRepository = AppDataSource.getRepository(Task);

export { userRepository, projectRepository, taskRepository };
