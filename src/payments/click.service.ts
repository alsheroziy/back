import { HttpException, Injectable } from '@nestjs/common';
import { User, type UserDocument } from 'src/user/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import {
  Transaction,
  type TransactionDocument,
} from 'src/transactions/transactions.model';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from 'src/notifications/notifications.service';
import {
  ClickAction,
  ClickError,
  TransactionState,
} from 'src/enums/transaction.enum';
import { clickCheckToken } from 'src/middleware/click.middleware';
import { Request } from 'express';

@Injectable()
export class ClickService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async prepare(req: Request) {
    try {
      // FormData'dan qiymatlarni olish
      const transId = req.body?.click_trans_id as string;
      const serviceId = req.body?.service_id as string;
      const merchant_trans_id = req.body?.merchant_trans_id as string;
      const amount = req.body?.amount as string;
      const action = req.body?.action as string;
      const signTime = req.body?.sign_time as string;
      const signString = req.body?.sign_string as string;

      console.log(req.body);

      console.log(
        {
          transId,
          serviceId,
          merchant_trans_id,
          amount,
          action,
          signTime,
          signString,
        },
        'FormData received prepare',
      );

      const currentUser = await this.userModel.findOne({
        unique_id: Number(merchant_trans_id),
      });
      // console.log(currentUser, merchant_trans_id, 'user details');
      if (!currentUser) {
        const data = {
          error: ClickError.UserNotFound,
          error_note: 'user not found',
        };
        console.log(data);
        return data;
      }

      const userId = new Types.ObjectId(currentUser._id);
      const orderId = currentUser.unique_id;

      const signatureData = {
        transId,
        serviceId,
        orderId: +orderId,
        amount,
        action,
        signTime,
      };
      // console.log(JSON.stringify(signatureData, null, 2), 'prepare req');

      const checkSignature = clickCheckToken(signatureData as any, signString);
      if (!checkSignature) {
        const data = {
          error: ClickError.SignFailed,
          error_note: 'Invalid sign',
        };
        console.log(data);
        return data;
      }

      if (parseInt(action) !== ClickAction.Prepare) {
        const data = {
          error: ClickError.ActionNotFound,
          error_note: 'Action not found',
        };
        console.log(data);
        return data;
      }

      const isAlreadyPaid = await this.transactionModel.findOne({
        user: userId,
        product: currentUser._id,
        state: TransactionState.Paid,
        provider: 'click',
      });

      if (isAlreadyPaid) {
        const data = {
          error: ClickError.AlreadyPaid,
          error_note: 'Already paid',
        };
        // console.log(data);
        return data;
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        const data = {
          error: ClickError.UserNotFound,
          error_note: 'User not found',
        };
        // console.log(data);
        return data;
      }

      const transaction = await this.transactionModel.findOne({
        transaction_id: transId,
      });
      if (
        transaction &&
        (transaction.state === TransactionState.PaidCanceled ||
          transaction.state === TransactionState.PendingCanceled)
      ) {
        const data = {
          error: ClickError.TransactionCanceled,
          error_note: 'Transaction canceled',
        };
        // console.log(data);
        return data;
      }

      const time = new Date().getTime();

      await this.transactionModel.create({
        prepare_id: String(time),
        transaction_id: transId,
        state: TransactionState.Pending,
        amount,
        user_id: currentUser._id,
        create_time: Number(time),
        provider: 'click',
      });

      const response = {
        click_trans_id: transId,
        merchant_trans_id: currentUser.unique_id,
        merchant_prepare_id: Number(time),
        error: ClickError.Success,
        error_note: 'Success',
      };
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw new HttpException({ error: 'Server error' }, 500);
    }
  }

  async complete(req: Request) {
    try {
      // FormData'dan qiymatlarni olish
      const transId = req.body?.click_trans_id as string;
      const serviceId = req.body?.service_id as string;
      const merchant_trans_id = req.body?.merchant_trans_id as string;
      const prepareId = req.body?.merchant_prepare_id as string;
      const amount = req.body?.amount as string;
      const action = req.body?.action as string;
      const signTime = req.body?.sign_time as string;
      const signString = req.body?.sign_string as string;
      const error = parseInt(req.body?.error as string, 10);

      console.log(
        {
          transId,
          serviceId,
          merchant_trans_id,
          prepareId,
          amount,
          action,
          signTime,
          signString,
          error,
        },
        'FormData received complete',
      );

      const currentUser = await this.userModel.findOne({
        unique_id: Number(merchant_trans_id),
      });
      // console.log(currentUser, merchant_trans_id, 'User details');
      if (!currentUser) {
        return {
          error: ClickError.BadRequest,
          error_note: 'User not found',
        };
      }

      const userId = new Types.ObjectId(currentUser._id);
      const orderId = currentUser.unique_id;

      const signatureData = {
        transId,
        serviceId,
        orderId: +orderId,
        merchantPrepareId: prepareId,
        amount,
        action,
        signTime,
      };

      const checkSignature = clickCheckToken(signatureData, signString);

      if (!checkSignature) {
        return {
          error: ClickError.SignFailed,
          error_note: 'Invalid sign',
        };
      }

      if (parseInt(action) !== ClickAction.Complete) {
        return {
          error: ClickError.ActionNotFound,
          error_note: 'Action not found',
        };
      }

      const user = await this.userModel.findById(userId);
      if (!user) {
        return {
          error: ClickError.UserNotFound,
          error_note: 'User not found',
        };
      }

      const isPrepared = await this.transactionModel.findOne({
        prepare_id: String(prepareId),
        provider: 'click',
      });
      console.log(isPrepared, 'isPrepared', prepareId);
      if (!isPrepared) {
        return {
          error: ClickError.TransactionNotFound,
          error_note: 'Transaction not found',
        };
      }

      const isAlreadyPaid = await this.transactionModel.findOne({
        user: userId,
        product: currentUser._id,
        state: TransactionState.Paid,
        provider: 'click',
      });
      if (isAlreadyPaid) {
        return {
          error: ClickError.AlreadyPaid,
          error_note: 'Already paid for transaction',
        };
      }

      const transaction = await this.transactionModel.findOne({
        transaction_id: transId,
      });
      if (
        transaction &&
        (transaction.state === TransactionState.PaidCanceled ||
          transaction.state === TransactionState.PendingCanceled)
      ) {
        return {
          error: ClickError.TransactionCanceled,
          error_note: 'Transaction canceled',
        };
      }

      const time = new Date().getTime();

      if (error < 0) {
        await this.transactionModel.findOneAndUpdate(
          { transaction_id: transId },
          { state: TransactionState.PaidCanceled, cancel_time: time },
        );
        return {
          error: ClickError.TransactionNotFound,
          error_note: 'Transaction not found',
        };
      }

      await this.transactionModel.findOneAndUpdate(
        { transaction_id: transId },
        { state: TransactionState.Paid, perform_time: time },
      );
      await this.userModel.findOneAndUpdate(
        { _id: currentUser._id },
        {
          balance: user.balance + Number(amount),
          $push: { transactions: transaction?._id },
        },
      );

      const response = {
        click_trans_id: transId,
        merchant_trans_id: String(userId),
        merchant_confirm_id: time,
        error: ClickError.Success,
        error_note: 'Success',
      };
      // console.log(JSON.stringify(response, null, 2), 'response');

      return response;
    } catch (error) {
      console.error('Error:', error);
      throw new HttpException({ error: 'Server error' }, 500);
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

    const MERCHANT_ID = process.env.CLICK_MERCHANT_ID;
    const SERVICE_ID = process.env.CLICK_SERVICE_ID;
    const MERCHANT_USER_ID = process.env.CLICK_MERCHANT_USER_ID;

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

    const return_url = `${process.env.CLIENT_URL || 'https://anibla.uz'}/top-up-balance/${user_id}/${amount}`;

    const checkoutUrl = `https://my.click.uz/services/pay?transaction_param=${user_id}&amount=${amount}&merchant_id=${MERCHANT_ID}&merchant_order_id=${MERCHANT_USER_ID}&service_id=${SERVICE_ID}&return_url=${return_url}`;

    return { checkoutUrl };
  }
}
