// dto/update-app-status.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAppStatusDto {
  @IsOptional()
  @IsBoolean()
  maintenance?: boolean;

  @IsOptional()
  @IsString()
  latestVersion?: string;

  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;

  @IsOptional()
  @IsString()
  message?: string;
}
