import { userRole } from "./userRole.enum";

export interface userCreds {
    email: string;
    password: string;
    role?: userRole;
}
