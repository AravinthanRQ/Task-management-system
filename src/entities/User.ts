import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { userRole } from "../common/userRole.enum";
import { Exclude } from "class-transformer";
import { Project } from "./Project";
import { Task } from "./Tasks";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    @Exclude()
    password!: string;

    @Column({ type: "enum", enum: userRole, default: userRole.USER })
    role!: userRole;

    @OneToMany(() => Project, (project) => project.createdBy)
    projects!: Project[];

    @OneToMany(() => Task, (task) => task.createdBy)
    tasks!: Task[];
}
