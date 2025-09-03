import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsEnum,
    IsNumber,
    IsDateString,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class LangMessageDto {
    @IsString()
    @IsNotEmpty()
    message: string;
  }
  
  export class CreateTimerDto {
    @ValidateNested()
    @Type(() => LangMessageDto)
    uz: LangMessageDto;
  
    @ValidateNested()
    @Type(() => LangMessageDto)
    ru: LangMessageDto;
  
    @IsMongoId()
    media: string;
  
    @IsEnum(["movies", "series"])
    mediaType: string;
  
    @IsOptional()
    @IsMongoId()
    season_id?: string;
  
    @IsOptional()
    @IsMongoId()
    episode_id?: string;
  
    @IsOptional()
    @IsNumber()
    total_episodes?: number;
  
    @IsDateString()
    time: Date;
  }
  