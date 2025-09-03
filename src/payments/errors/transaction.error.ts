import { BaseError } from './base.error';

export class TransactionError extends BaseError {
  transactionErrorCode: string;
  transactionErrorMessage: string;
  transactionData: any;
  transactionId: string;
  isTransactionError: boolean;

  constructor(
    transactionError: { name: string; code: string; message: string },
    id: string,
    data: any,
  ) {
    super(400, transactionError.name);

    this.transactionErrorCode = transactionError.code;
    this.transactionErrorMessage = transactionError.message;
    this.transactionData = data;
    this.transactionId = id;
    this.isTransactionError = true;
  }
}
