import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty({ message: "Email should not be empty" })
  public email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password should not be empty" })
  public password!: string;
}