import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from 'src/auth/sessions.model';
import { Model } from 'mongoose';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}
  create(createSessionDto: CreateSessionDto) {
    return 'This action adds a new session';
  }

  async findAll() {
    try {
      const sessions = await this.sessionModel.find().populate('user_id');
      return {
        success: true,
        data: sessions,
        message: 'Sessions fetched successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findOne(id: string) {
    try {
      const sessions = await this.sessionModel
        .find({ user_id: id })
        .populate('user_id');

      return {
        success: true,
        data: sessions,
        message: 'sessions_fetched_successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async remove(userId: string, tokenId: string) {
    try {
      const res = await this.sessionModel.findOneAndDelete({
        user_id: userId,
        token_id: tokenId,
      });
      if (!res) throw new Error('session_not_found');
      return {
        success: true,
        data: res,
        message: 'Session deleted successfully',
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
