import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  // validations
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsNotEmpty,
  IsNumber,
  Validate,
  isNotEmpty,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEmailOrPhone', async: false })
// export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
//   validate(value: any, args: ValidationArguments) {
//     const { email, phone_number } = args.object as any;
//     return !!(email || phone_number);
//   }

//   defaultMessage(args: ValidationArguments) {
//     return 'Either email or phone number must be provided!';
//   }
// }
export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  phone_number: number;

  image: string;

  // @Validate(IsEmailOrPhoneConstraint)
  // emailOrPhone: any;
}
