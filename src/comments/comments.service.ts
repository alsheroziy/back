import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserDocument } from 'src/user/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Movies, MoviesDocument } from 'src/movies/movies.model';
import { Model, Types } from 'mongoose';
import { Comments, CommentsDocument } from './comments.model';
import { Series, SeriesDocument } from 'src/series/series.model';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comments.name)
    private readonly commentsModel: Model<CommentsDocument>,
    @InjectModel(Series.name)
    private readonly seriesModel: Model<SeriesDocument>,
    @InjectModel(Movies.name)
    private readonly moviesModel: Model<MoviesDocument>,
  ) {}
  async create(createCommentDto: CreateCommentDto, user: UserDocument) {
    try {
      let success = false;
      if (
        createCommentDto.mediaType === 'movies' ||
        createCommentDto.mediaType === 'series'
      ) {
        success = true;
      }
      if (!success)
        throw new BadRequestException(
          `Media type "${createCommentDto.mediaType}" does not match "movies" or "series"`,
        );
      const media = await this?.[`${createCommentDto.mediaType}Model`].findById(
        createCommentDto.media,
      );
      if (!media) {
        throw new BadRequestException('media_not_found');
      }
      const comment = await this.commentsModel.create({
        message: createCommentDto.message,
        replied_id: createCommentDto.replied_id || null,
        user_id: user._id,
        media: createCommentDto.media,
        mediaType:
          createCommentDto.mediaType.charAt(0).toUpperCase() +
          createCommentDto.mediaType.slice(1),
      });
      return {
        success: true,
        data: comment,
        message: 'comment_created_successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async findAll(props: { search: string; limit: number; page: number }) {
    try {
      const skip = (props.page - 1) * props.limit;

      const filter: any = {
        $or: [{ message: { $regex: props.search || '', $options: 'i' } }],
      };

      const comments = await this.commentsModel
        .find(filter)
        .skip(skip)
        .limit(props.limit)
        .populate({
          path: 'user_id',
          select: '_id unique_id name image',
        })
        .populate('replied_id')
        .populate({
          path: 'media',
          select: 'uz ru slug _id',
        })
        .populate({
          path: 'replied_id',
          populate: {
            path: 'user_id', // replied_id ichidagi user_id
            select: '_id unique_id name image',
          },
        })
        .populate({
          path: 'likes',
          select: '_id',
        });

      const total = await this.commentsModel.countDocuments(filter);
      const pagination = {
        total,
        page: props.page,
        limit: props.limit,
        pages: Math.ceil(total / props.limit),
      };
      return {
        success: true,
        data: comments,
        message: 'Comments fetched successfully',
        pagination,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
  async findByMedia({
    page = 1,
    limit = 10,
    mediaType,
    _id,
    sortDirection = -1,
    sortBy = 'likes',
    currentUserId,
  }: {
    page?: number;
    limit?: number;
    mediaType: 'movies' | 'series';
    _id: string;
    sortDirection?: -1 | 1;
    sortBy?: string;
    currentUserId?: string;
  }) {
    try {
      if (!mediaType) throw new Error('media_type_required');
      if (mediaType !== 'movies' && mediaType !== 'series')
        throw new Error('media_type_must_be_movies_or_series');

      mediaType = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);

      const matchFilter = {
        media: String(_id), // <-- String emas, ObjectId qildik
        mediaType,
        is_active: true,
        replied_id: null,
      };

      const total = await this.commentsModel.countDocuments(matchFilter);

      const allowedSortFields = ['likesCount', 'createdAt', 'replies_count'];

      const sortField = sortBy === 'likes' ? 'likesCount' : sortBy;

      // Agar noto'g'ri field kelsa default likesCount qilsin
      const finalSortField = allowedSortFields.includes(sortField)
        ? sortField
        : 'likesCount';

      // Agar `currentUserId` bo'lsa, o'z commentlarini tepaga chiqaramiz
      const sortStage =
        sortBy === 'likes' && currentUserId
          ? { isCurrentUser: -1, createdAt: -1, likesCount: sortDirection }
          : { [finalSortField]: sortDirection, createdAt: -1 };

      const pipeline: any[] = [
        { $match: matchFilter },
        {
          $addFields: {
            likesCount: { $size: '$likes' },
            ...(currentUserId && {
              isCurrentUser: {
                $cond: {
                  if: { $eq: ['$user_id', new Types.ObjectId(currentUserId)] },
                  then: 1,
                  else: 0,
                },
              },
            }),
          },
        },

        {
          $sort: sortStage,
        },

        { $skip: (page - 1) * limit },
        { $limit: limit },

        // USER lookup
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },

        // REPLIES COUNT
        {
          $lookup: {
            from: 'comments',
            let: { commentId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$replied_id', '$$commentId'] },
                      { $eq: ['$is_active', true] },
                    ],
                  },
                },
              },
            ],
            as: 'replies',
          },
        },
        {
          $set: {
            replies_count: { $size: '$replies' },
          },
        },

        // MEDIA lookup - dynamic by type
        {
          $lookup: {
            from: 'movies',
            let: { mediaId: '$media', mediaType: '$mediaType' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$$mediaType', 'Movies'] },
                      { $eq: ['$_id', '$$mediaId'] },
                    ],
                  },
                },
              },
            ],
            as: 'mediaMovie',
          },
        },
        {
          $lookup: {
            from: 'series',
            let: { mediaId: '$media', mediaType: '$mediaType' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$$mediaType', 'Series'] },
                      { $eq: ['$_id', '$$mediaId'] },
                    ],
                  },
                },
              },
            ],
            as: 'mediaSeries',
          },
        },
        {
          $addFields: {
            media: {
              $cond: {
                if: { $eq: ['$mediaType', 'Movies'] },
                then: { $arrayElemAt: ['$mediaMovie', 0] },
                else: { $arrayElemAt: ['$mediaSeries', 0] },
              },
            },
          },
        },

        {
          $project: {
            replies: 0,
            mediaMovie: 0,
            mediaSeries: 0,
          },
        },
      ];

      const comments = await this.commentsModel.aggregate(pipeline);

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        next: page >= Math.ceil(total / limit) ? null : page + 1,
      };

      return {
        success: true,
        data: { comments, pagination },
        message: 'Comments fetched successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }

  async findByParent({
    page = 1,
    limit = 10,
    _id,
  }: {
    page?: number;
    limit?: number;
    _id: string;
  }) {
    try {
      const comment = await this.commentsModel.findById(_id);
      if (!comment) throw new Error('comment_not_found');

      const matchFilter = {
        is_active: true,
        replied_id: String(comment._id),
      };

      const total = await this.commentsModel.countDocuments(matchFilter);

      const comments = await this.commentsModel
        .find(matchFilter)
        .populate({
          path: 'user_id',
          select: '_id unique_id name image',
        })
        .populate('replied_id')
        .populate({
          path: 'media',
          select: 'uz ru slug _id',
        })
        .populate({
          path: 'replied_id',
          populate: {
            path: 'user_id', // replied_id ichidagi user_id
            select: '_id unique_id name image',
          },
        })
        .populate({
          path: 'likes',
          select: '_id',
        });

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        next: page >= Math.ceil(total / limit) ? null : page + 1,
      };

      return {
        success: true,
        data: { comments, pagination },
        message: 'Comments fetched successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error,
      };
    }
  }
  async getOne(id: string) {
    try {
      const comment = await this.commentsModel
        .findById(id)
        .populate({
          path: 'user_id',
          select: '_id unique_id name image',
        })
        .populate('replied_id')
        .populate({
          path: 'media',
          select: 'uz ru slug _id',
        })
        .populate({
          path: 'replied_id',
          populate: {
            path: 'user_id', // replied_id ichidagi user_id
            select: '_id unique_id name image',
          },
        })
        .populate({
          path: 'likes',
          select: '_id',
        });
      if (!comment) throw new BadRequestException('Comment not found');
      return {
        success: true,
        data: comment,
        message: 'Comment fetched successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async activateComment(id: string) {
    try {
      const comment = await this.commentsModel.findById(id);
      if (!comment) throw new BadRequestException('Comment not found');
      comment.is_active = true;
      await comment.save();
      return {
        success: true,
        data: comment,
        message: 'Comment activated successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async deactivateComment(id: string) {
    try {
      const comment = await this.commentsModel.findById(id);
      if (!comment) throw new BadRequestException('Comment not found');
      comment.is_active = false;
      await comment.save();
      return {
        success: true,
        data: comment,
        message: 'Comment inactivated successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async deleteComment(id: string) {
    try {
      const comment = await this.commentsModel.findByIdAndDelete(id);
      if (!comment) throw new BadRequestException('Comment not found');
      return {
        success: true,
        data: comment,
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  async likeToggle(id: string, user: UserDocument) {
    try {
      const comment = await this.commentsModel.findById(id);
      if (!comment) throw new BadRequestException('Comment not found');
      const isLiked = comment.likes.includes(user._id);

      if (isLiked) {
        comment.likes = comment.likes.filter(
          (c_id) => String(c_id) !== String(user._id),
        );
      } else {
        comment.likes.push(user._id);
      }
      await comment.save();
      return {
        success: true,
        data: comment,
        message: isLiked
          ? 'Comment unliked successfully'
          : 'Comment liked successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
}
