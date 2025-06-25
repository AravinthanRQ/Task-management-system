import { IsEnum, IsNotEmpty } from "class-validator";
import { userRole } from "../common/userRole.enum";

export class UpdateUserRoleDto {
  @IsEnum(userRole, { message: "Role must be either 'admin' or 'user'." })
  @IsNotEmpty({ message: "Role is required" })
  public role!: userRole;
}
