import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { userRole } from "../common/userRole.enum";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column({ type: "enum", enum: userRole, default: userRole.USER })
    role!: userRole;
}
