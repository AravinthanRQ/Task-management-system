import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Task } from "./Tasks";
import { projectStatus } from "../common/projectStatus.enum";

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    startDate!: Date;
    
    @Column()
    endDate!: Date;

    @Column({ type: "enum", enum: projectStatus, default: projectStatus.PENDING })
    status!: projectStatus;

    @ManyToOne(() => User, (user) => user.projects, { onDelete: "CASCADE" })
    createdBy!: User;

    @OneToMany(() => Task, (task) => task.project, { cascade: true })
    tasks!: Task[];
}