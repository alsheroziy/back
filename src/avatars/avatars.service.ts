import { Injectable } from '@nestjs/common';
import { CreateAvatarDto } from './dto/create-avatar.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avatar, AvatarDocument } from './avatars.model';

@Injectable()
export class AvatarsService {
  constructor(
    @InjectModel(Avatar.name)
    private readonly avatarsModel: Model<AvatarDocument>,
  ) {}
  async create(createSeryDto: CreateAvatarDto) {
    try {
      const _avatars = await this.avatarsModel.create(createSeryDto);
      return {
        success: true,
        data: _avatars,
        message: 'avatar_created_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findAll() {
    try {
      const avatars = await this.avatarsModel.find();
      return {
        success: true,
        data: avatars,
        message: 'avatar_fetched_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async remove(id: string) {
    try {
      const delete_avatar = await this.avatarsModel.findByIdAndDelete(id);
      if (!delete_avatar) throw new Error('avatar_not_found');
      return {
        success: true,
        data: delete_avatar,
        message: 'avatar_deleted_successfully',
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
