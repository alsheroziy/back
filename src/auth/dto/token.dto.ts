import { IsString } from 'class-validator';

export class TokenDto {
  @IsString({ message: 'Yu did not pass refresh token or it is not a string' })
  refreshToken: string;
  device?: string;
  ip: string;
}
