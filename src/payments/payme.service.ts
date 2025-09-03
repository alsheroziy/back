import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import {
  PaymeData,
  PaymeError,
  TransactionState,
} from '../enums/transaction.enum';
import { User, type UserDocument } from 'src/user/user.model';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import {
  Transaction,
  type TransactionDocument,
} from 'src/transactions/transactions.model';
import * as base64 from 'base-64';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PaymeService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}
  async checkPerformTransaction(
    params: { amount: number; account: { user_id: number } },
    id: number,
  ) {
    let { account, amount } = params;

    if (account.user_id && isNaN(+account.user_id)) {
      throw new HttpException(
        { error: PaymeError.UserNotFound, id, data: PaymeData.UserId },
        200,
      );
    }

    amount = Math.floor(amount / 100);
    const user = await this.userModel.findOne({
      unique_id: +account.user_id,
    });
    if (!user) {
      throw new HttpException(
        { error: PaymeError.UserNotFound, id, data: PaymeData.UserId },
        200,
      );
    }
    if (amount < 1000) {
      throw new HttpException({ error: PaymeError.InvalidAmount, id }, 200);
    }
  }

  async checkTransaction(params: { id: string }, id: number) {
    const transaction = await this.transactionModel.findOne({
      transaction_id: params.id,
    });
    console.log(transaction);
    if (!transaction) {
      throw new HttpException(
        { error: PaymeError.TransactionNotFound, id },
        200,
      );
    }
    return {
      create_time: transaction.create_time,
      perform_time: transaction.perform_time,
      cancel_time: transaction.cancel_time,
      transaction: transaction.transaction_id,
      state: transaction.state,
      reason: transaction.reason,
    };
  }

  async createTransaction(
    params: {
      amount: number;
      account: { user_id: number };
      time: number;
      id: number;
    },
    id: number,
  ) {
    let { account, time, amount } = params;

    amount = Math.floor(amount / 100);

    await this.checkPerformTransaction(params, id);

    let transaction = await this.transactionModel.findOne({
      transaction_id: params.id,
    });
    console.log(transaction, params.id);
    if (transaction) {
      if (transaction.state !== TransactionState.Pending) {
        throw new HttpException({ error: PaymeError.CantDoOperation, id }, 200);
      }
      const currentTime = Date.now();
      const expirationTime =
        (currentTime - transaction.create_time) / 60000 < 12;
      if (!expirationTime) {
        await this.transactionModel.findOneAndUpdate(
          { transaction_id: params.id },
          { state: TransactionState.PendingCanceled, reason: 4 },
        );
        throw new HttpException({ error: PaymeError.CantDoOperation, id }, 200);
      }
      return {
        create_time: transaction.create_time,
        transaction: transaction.transaction_id,
        state: TransactionState.Pending,
      };
    }

    if (account.user_id && isNaN(+account.user_id)) {
      throw new HttpException(
        { error: PaymeError.UserNotFound, id, data: PaymeData.UserId },
        200,
      );
    }

    const existUser = await this.userModel.findOne({
      unique_id: +account.user_id,
    });
    if (!existUser) {
      throw new HttpException(
        { error: PaymeError.UserNotFound, id, data: PaymeData.UserId },
        200,
      );
    }

    transaction = await this.transactionModel.findOne({
      user_id: existUser._id,
      provider: 'payme',
    });
    if (transaction) {
      // if (transaction.state === TransactionState.Paid) throw new HttpException({error: PaymeError.AlreadyDone, id}, 200)
      // if (transaction.state === TransactionState.Pending) throw new HttpException({error: PaymeError.Pending, id}, 200)
    }

    console.log(
      {
        transaction_id: params.id,
        state: TransactionState.Pending,
        amount,
        user_id: existUser._id,
        create_time: time,
        provider: 'payme',
      },
      135,
    );
    const newTransaction = await this.transactionModel.create({
      transaction_id: params.id,
      state: TransactionState.Pending,
      amount,
      user_id: existUser._id,
      create_time: time,
      provider: 'payme',
    });

    return {
      transaction: newTransaction.transaction_id,
      state: TransactionState.Pending,
      create_time: newTransaction.create_time,
    };
  }

  async performTransaction(params: { id: string }, id: number) {
    const currentTime = Date.now();

    const transaction = await this.transactionModel.findOne({
      transaction_id: params.id,
    });
    if (!transaction) {
      throw new HttpException(
        { error: PaymeError.TransactionNotFound, id },
        200,
      );
    }
    if (transaction.state !== TransactionState.Pending) {
      if (transaction.state !== TransactionState.Paid) {
        throw new HttpException({ error: PaymeError.CantDoOperation, id }, 200);
      }
      return {
        perform_time: transaction.perform_time,
        transaction: transaction.transaction_id,
        state: TransactionState.Paid,
      };
    }
    const expirationTime = (currentTime - transaction.create_time) / 60000 < 12;
    if (!expirationTime) {
      await this.transactionModel.findOneAndUpdate(
        { transaction_id: params.id },
        {
          state: TransactionState.PendingCanceled,
          reason: 4,
          cancel_time: currentTime,
        },
      );
      throw new HttpException({ error: PaymeError.CantDoOperation, id }, 200);
    }

    await this.transactionModel.findOneAndUpdate(
      { transaction_id: params.id },
      { state: TransactionState.Paid, perform_time: currentTime },
    );

    const user = await this.userModel.findOneAndUpdate(
      { _id: transaction.user_id },
      {
        $inc: { balance: transaction.amount },
        $push: { transactions: transaction?._id },
      },
      { new: true },
    );

    // To'lov bildirishnomasi yuborish
    if (user) {
      await this.notificationsService.sendPaymentNotification(
        user._id.toString(),
        transaction.amount,
      );
    }

    return {
      perform_time: currentTime,
      transaction: transaction.transaction_id,
      state: TransactionState.Paid,
    };
  }

  async cancelTransaction(params: { id: string; reason: number }, id: number) {
    const transaction = await this.transactionModel.findOne({
      transaction_id: params.id,
    });

    if (!transaction) {
      throw new HttpException(
        { error: PaymeError.TransactionNotFound, id },
        200,
      );
    }

    const currentTime = Date.now();

    if (transaction.state > 0) {
      await this.transactionModel.findOneAndUpdate(
        { transaction_id: params.id },
        {
          state: -Math.abs(transaction.state),
          reason: params.reason,
          cancel_time: currentTime,
        },
      );

      await this.userModel.findOneAndUpdate(
        { _id: transaction.user_id },
        { $inc: { balance: -transaction.amount } },
      );
    }

    return {
      cancel_time: transaction.cancel_time || currentTime,
      transaction: transaction.transaction_id,
      state: -Math.abs(transaction.state),
    };
  }

  async getStatement(params: { from: number; to: number }) {
    const { from, to } = params;
    const transactions = await this.transactionModel.find({
      create_time: { $gte: from, $lte: to },
      provider: 'payme',
    });

    return transactions.map((transaction) => ({
      id: transaction.transaction_id,
      time: transaction.create_time,
      amount: transaction.amount,
      account: {
        user_id: transaction.user_id,
      },
      create_time: transaction.create_time,
      perform_time: transaction.perform_time,
      cancel_time: transaction.cancel_time,
      transaction: transaction.transaction_id,
      state: transaction.state,
      reason: transaction.reason,
    }));
  }

  async checkout(user_id: string, amount: number, url: string) {
    try {
      const MERCHANNT_ID = this.configService.get<string>('PAYME_MERCHANT_ID');
      const MERCHANNT_KEY =
        this.configService.get<string>('PAYME_MERCHANT_KEY');

      const user = await this.userModel.findOne({ _id: user_id });
      if (!user) throw new BadRequestException('User not found');

      const price = amount * 100;

      const hash = base64.encode(
        `m=${MERCHANNT_ID};ac.user_id=${user.unique_id};a=${price};c=${url}`,
      );
      return {
        data: {
          url: `https://checkout.paycom.uz/${hash}`,
        },
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  // top-up balance
  async topUp(body: { user_id: number; amount: number }) {
    const { user_id, amount } = body;

    if (!user_id || !amount) {
      throw new HttpException(
        {
          success: false,
          error: 'Missing required fields.',
          message: 'Missing required fields.',
          data: null,
        },
        400,
      );
    } else if (typeof user_id !== 'number' || typeof amount !== 'number') {
      throw new HttpException(
        {
          success: false,
          error: 'Invalid field types. Field types must be number.',
          message: 'Invalid field types. Field types must be number.',
          data: null,
        },
        400,
      );
    } else if (amount < 1000) {
      throw new HttpException(
        {
          success: false,
          error: 'Invalid amount. Minimum amount is 1000',
          message: 'Invalid amount. Minimum amount is 1000',
          data: null,
        },
        400,
      );
    }

    const user = await this.userModel.findOne({ unique_id: Number(user_id) });

    if (!user) {
      throw new HttpException(
        {
          success: false,
          error: 'User not found.',
          message: 'User not found.',
          data: null,
        },
        400,
      );
    }

    const MERCHANT_ID = process.env.PAYME_MERCHANT_ID;
    const PAYME_CHECKOUT_LINK = 'https://checkout.paycom.uz';
    const price = amount * 100;
    const return_url = `${process.env.CLIENT_URL || 'https://anibla.uz'}/top-up-balance/${user_id}/${amount}`;

    const r = base64.encode(
      `m=${MERCHANT_ID};ac.user_id=${user_id};a=${price};c=${return_url}`,
    );

    const checkoutUrl = `${PAYME_CHECKOUT_LINK}/${r}`;

    return { checkoutUrl };
  }
}
