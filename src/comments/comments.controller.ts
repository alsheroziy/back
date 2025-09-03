import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { User } from 'src/user/decarators/user.decarator';
import { UserDocument } from 'src/user/user.model';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Auth()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @User() user: UserDocument,
  ) {
    return await this.commentsService.create(createCommentDto, user);
  }

  @Post('deactivate/:id')
  @Auth('ADMIN')
  async deactivate(@Param('id') id: string) {
    return await this.commentsService.deactivateComment(id);
  }

  @Post('activate/:id')
  @Auth('ADMIN')
  async activate(@Param('id') id: string) {
    return await this.commentsService.activateComment(id);
  }

  @Post('like/:id')
  @Auth()
  async like(@Param('id') id: string, @User() user: UserDocument) {
    return await this.commentsService.likeToggle(id, user);
  }

  @Get()
  @Auth('ADMIN')
  async findAll(
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('search') search: string,
  ) {
    return await this.commentsService.findAll({
      limit: +limit || 10,
      page: +page || 1,
      search,
    });
  }

  @Get(':media/:id')
  @Auth()
  async findByMedia(
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Param('media') mediaType: 'movies' | 'series',
    @Param('id') _id: string,
    @Query('sortBy') sortBy: string,
    @Query('sortDirection') sortDirection: string,
    @User('id') user_id,
  ) {
    return await this.commentsService.findByMedia({
      limit: +limit || 10,
      page: +page || 1,
      mediaType,
      _id,
      sortBy,
      sortDirection: Number(sortDirection) as -1 | 1,
      currentUserId: user_id,
    });
  }

  @Get(':id')
  @Auth()
  async findByParent(
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Param('id') _id: string,
  ) {
    return await this.commentsService.findByParent({
      limit: +limit || 10,
      page: +page || 1,
      _id,
    });
  }

  @Delete(':id')
  @Auth('ADMIN')
  async remove(@Param('id') id: string) {
    return await this.commentsService.deleteComment(id);
  }
}
