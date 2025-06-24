import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength } from "class-validator";
import { userRole } from "../common/userRole.enum";

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty({ message: "Email should not be empty" })
  public email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  public password!: string;

  @IsEnum(userRole)
  @IsNotEmpty({ message: "Role must be either 'admin' or 'user'." })
  public role!: userRole;
}