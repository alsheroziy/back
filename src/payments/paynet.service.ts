import {
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.model';
import {
  Transaction,
  TransactionDocument,
} from 'src/transactions/transactions.model';

@Injectable()
export class PaynetService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async process(req: Request): Promise<any> {
    const body: any = req.body!;
    const headers: any = req.headers;
    const loginpass = atob(headers.authorization.replace('Basic ', '')).split(
      ':',
    );
    const login = loginpass[0];
    const password = loginpass[1];
    // console.log(login, password, 'login password');
    // console.log(body, 'body');

    const methodName = body.method;
    const params = body.params;
    const id = body.id;
    const auth = await this.authorize(login, password);
    console.log(auth);
    if (!auth) {
      return this.errorResponse(-32601, 'Unauthorized.', id);
    }

    switch (methodName) {
      case 'CheckTransaction':
        return this.checkTransaction(params, id);
      case 'PerformTransaction':
        return this.performTransaction(params, id);
      case 'CancelTransaction':
        return this.cancelTransaction(params, id);
      case 'GetStatement':
        return this.getStatement(params, id);
      case 'GetInformation':
        return this.GetInformation(params, id);
      default:
        return this.errorResponse(-32601, 'Method not found.', id);
    }
  }

  private async authorize(login: string, password: string) {
    if (
      login !== process.env.PAYNET_LOGIN ||
      password !== process.env.PAYNET_PASSWORD
    ) {
      console.log(
        login,
        password,
        process.env.PAYNET_LOGIN,
        process.env.PAYNET_PASSWORD,
        'credentials',
      );
      return false;
    }
    return true;
  }

  private async checkTransaction(params: any, id: number): Promise<any> {
    const tx = await this.transactionModel.findOne({
      transaction_id: params.transactionId,
    });
    const state = tx?.state === 2 ? 2 : 1;

    return this.successResponse(
      {
        transactionState: state,
        timestamp: this.toSoapTimestamp(new Date()),
        providerTrnId: tx?._id,
      },
      id,
    );
  }

  private async performTransaction(params: any, id: number): Promise<any> {
    const txId = params.transactionId;
    if (!txId) {
      return this.errorResponse(-32601, 'Transaction id is required.', id);
    }

    const amount = parseFloat(
      String(params.amount ? Number(params.amount) / 100 : 0),
    );
    const user_id = params.fields.user_id;

    const existing = await this.transactionModel.findOne({
      transaction_id: txId,
    });
    if (existing) {
      return this.errorResponse(201, 'Transaction already exists', id);
    }

    const user = await this.userModel.findOneAndUpdate(
      { unique_id: user_id },
      {
        $inc: { balance: amount },
      },
    );
    if (!user) {
      return this.errorResponse(302, 'Foydalanuvchi topilmadi', id);
    }

    const new_transaction = await this.transactionModel.create({
      user_id: user._id,
      transaction_id: txId,
      amount: amount * 100,
      state: 1,
      provider: 'paynet',
      create_time: Date.now(),
    });

    user.balance += amount;
    await user.save();

    return this.successResponse(
      {
        timestamp: this.toSoapTimestamp(new Date()),
        providerTrnId: new_transaction._id,
        fields: {
          balance: user.balance,
          user_id: user.unique_id,
          name: user.name,
        },
      },
      id,
    );
  }

  private async cancelTransaction(params: any, id: number): Promise<any> {
    const tx = await this.transactionModel.findOne({
      transaction_id: params.transactionId,
    });
    await this.userModel.updateOne(
      { _id: tx?.user_id },
      { $inc: { balance: -tx!.amount } },
    );
    if (!tx) {
      return this.errorResponse(-32601, 'Transaction id is required.', id);
    }

    if (!tx) {
      return this.errorResponse(202, 'Transaction topilmadi', id);
    } else if (tx.state === 2) {
      return this.errorResponse(203, 'Transaction allaqachon bekon qilingan', id);
    }
   
    tx.state = 2;
    tx.cancel_time = Date.now();
    await tx.save();

    return this.successResponse(
      {
        providerTrnId: tx?._id,
        timestamp: this.toSoapTimestamp(new Date()),
        transactionState: 2,
      },
      id,
    );
  }

  private async getStatement(params: any, id: number): Promise<any> {
    const from = new Date(params.dateFrom);
    const to = new Date(params.dateTo);

    const transactions = await this.transactionModel.find({
      provider: 'paynet',
      state: { $ne: 2 },
      createdAt: { $gte: from, $lte: to },
    });

    const statements = transactions.map((tx) => ({
      amount: tx.amount,
      providerTrnId: tx._id,
      transactionId: tx.transaction_id,
      timestamp: this.toSoapTimestamp(new Date(tx.create_time)),
    }));

    return this.successResponse(
      {
        statements,
      },
      id,
    );
  }

  private async GetInformation(params: any, id: number): Promise<any> {
    const user_id = params.fields.user_id;
    console.log(user_id, 'user_id');
    const user = await this.userModel.findOne({ unique_id: user_id });

    if (!user) {
      return this.errorResponse(302, 'Foydalanuvchi topilmadi', id);
    }

    return this.successResponse(
      {
        status: '0',
        timestamp: this.toSoapTimestamp(new Date()),
        fields: {
          balance: user.balance,
          user_id: user.unique_id,
          name: user.name,
        },
      },
      id,
    );
  }

  private toSoapTimestamp(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const millis = String(date.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${millis}+05:00`;
  }

  private errorResponse(code: number, message: string, id: number) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
      },
    };
  }

  private successResponse(result: any, id: number) {
    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }
}
