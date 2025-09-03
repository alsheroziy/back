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
export class LoginDto {
  // @IsOptional()
  // @IsString()
  // @IsEmail()
  // email: string;

  @IsOptional()
  @IsNumber({}, { message: 'phone_number_be_number' })
  phone_number: number;

  hash: string;

  // @IsNotEmpty()
  // @IsString()
  // @MinLength(6)
  // password: string;

  // @Validate(IsEmailOrPhoneConstraint)
  // emailOrPhone: any;
}
