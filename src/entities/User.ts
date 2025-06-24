import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { userRole } from "../common/userRole.enum";
import { Exclude } from "class-transformer";

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
}
