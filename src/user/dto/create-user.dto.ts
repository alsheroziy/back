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

// Custom validatsiya qoidasi: "email yoki phone_number bo'lishi kerak"
@ValidatorConstraint({ name: 'IsEmailOrPhone', async: false })
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const { email, phone_number } = args.object as any;
    // Shart: email yoki telefon raqam bo'lishi kerak
    return !!(email || phone_number);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Either email or phone number must be provided!';
  }
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Email majburiy emas
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  // Telefon raqam majburiy emas
  @IsOptional()
  @IsNumber()
  phone_number: number;

  image: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  // Custom validatsiya qo'llash: Bittasi bo'lishini tekshiradi
  @Validate(IsEmailOrPhoneConstraint)
  emailOrPhone: any; // Faqat validatsiya ishga tushiradi, maydon sifatida kerak emas
}
