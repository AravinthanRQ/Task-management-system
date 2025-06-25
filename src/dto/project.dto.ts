import { IsDateString, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { projectStatus } from "../common/projectStatus.enum";

export class ProjectDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsDateString()
    @IsNotEmpty()
    startDate!: Date;

    @IsDateString()
    @IsNotEmpty()
    endDate!: Date;

    @IsEnum(projectStatus)
    @IsNotEmpty()
    status!: projectStatus;
}