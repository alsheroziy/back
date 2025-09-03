import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Countries, CountriesDocument } from './countries.model';
import { Model } from 'mongoose';
import { CreateCountryDto } from './dto/create-country.dto';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Countries.name)
    private readonly countryModel: Model<CountriesDocument>,
  ) {}
  async create(createCountryDto: CreateCountryDto) {
    try {
      const res = await this.countryModel.create(createCountryDto);
      return {
        success: true,
        data: res,
        message: 'Country created successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const res = await this.countryModel.find();
      return {
        success: true,
        data: res,
        message: 'Countries fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const res = await this.countryModel.findById(id);
      if (!res) throw new BadRequestException('Country not found');
      return {
        success: true,
        data: res,
        message: 'Country fetched successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    try {
      const res = await this.countryModel.findByIdAndUpdate(
        id,
        updateCountryDto,
        { new: true },
      );
      if (!res) throw new BadRequestException('Country not found');
      return {
        success: true,
        data: res,
        message: 'Country updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const res = await this.countryModel.findByIdAndDelete(id);
      if (!res) throw new BadRequestException('Country not found');
      return {
        success: true,
        data: res,
        message: 'Country deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
