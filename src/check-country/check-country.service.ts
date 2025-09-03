import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckCountryService {
  async get(req: { country: string }) {
    try {
      return {
        success: true,
        data: { country: req.country, is_mdh: isMDH(req.country) },
        message: 'Country fetched successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
}

export function isMDH(countryCode: string): boolean {
  const mdhCountries = [
    'UZ',
    'RU',
    'KZ',
    'KG',
    'TJ',
    'TM',
    'AZ',
    'AM',
    'BY',
    'MD',
    'UA',
  ]; // MDH davlatlari
  return mdhCountries.includes(countryCode.toUpperCase());
}
