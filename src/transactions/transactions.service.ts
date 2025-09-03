import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './transactions.model';
import { Model } from 'mongoose';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async findAll({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const filter: any = {
      $or: [{ transaction_id: { $regex: search || '', $options: 'i' } }],
    };
    const transactions = await this.transactionModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate('user_id');
    const total = await this.transactionModel.countDocuments(filter);
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
    return {
      success: true,
      data: { transactions, pagination },
      message: 'Transactions fetched successfully',
    };
  }

  async findOne(id: string) {
    return `This action returns a #${id} transaction`;
  }
}
