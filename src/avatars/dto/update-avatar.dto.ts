import { PartialType } from '@nestjs/mapped-types';
import { CreateAvatarDto } from './create-avatar.dto';
CreateAvatarDto;
export class UpdateAvatarDto extends PartialType(CreateAvatarDto) {}
