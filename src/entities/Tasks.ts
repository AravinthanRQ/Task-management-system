import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";
import { taskStatus } from "../common/taskStatus.enum";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({ type: "enum", enum: taskStatus, default: taskStatus.PENDING })
    status!: taskStatus;

    @Column({ type: "date", nullable: true })
    dueDate!: Date | null;

    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: "CASCADE" })
    project!: Project;

    @ManyToOne(() => User, (user) => user.tasks)
    createdBy!: User;
} 