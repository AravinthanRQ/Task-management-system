import { IsDate, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { projectStatus } from "../common/projectStatus.enum";

export class ProjectDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsDate()
    @IsNotEmpty()
    startDate!: Date;

    @IsDate()
    @IsNotEmpty()
    endDate!: Date;

    @IsEnum(projectStatus)
    @IsNotEmpty()
    status!: projectStatus;
}