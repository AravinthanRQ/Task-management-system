import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { taskStatus } from "../common/taskStatus.enum";

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdateTaskDto {
  @IsEnum(taskStatus)
  @IsNotEmpty()
  status!: taskStatus;
}
