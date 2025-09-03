import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class UpdatePlanDto {
  @IsObject({
    message: 'name must be an object, uz, ru',
  })
  name: {
    uz: string;
    ru: string;
  };

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  time: number;
}
