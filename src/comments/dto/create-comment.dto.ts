import { IsEnum, IsOptional, IsString } from "class-validator";
import { Movies } from "src/movies/movies.model";
import { Series } from "src/series/series.model";

export class CreateCommentDto {
    @IsString()
    message: string;

    @IsOptional()
    @IsString()
    replied_id: string;

    @IsEnum([Movies.name, Series.name])
    mediaType: string

    @IsString()
    media: string
}
