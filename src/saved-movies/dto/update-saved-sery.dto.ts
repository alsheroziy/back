import { PartialType } from '@nestjs/mapped-types';
import { CreateSavedSeryDto } from './create-saved-sery.dto';

export class UpdateSavedSeryDto extends PartialType(CreateSavedSeryDto) {}
