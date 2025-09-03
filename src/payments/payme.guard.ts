import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as base64 from 'base-64';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymeError } from '../enums/transaction.enum';

@Injectable()
export class PaymeCheckTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const id = request?.body?.id;

    if (!token) {
      throw new HttpException(
        { error: PaymeError.InvalidAuthorization, id: id || 0 },
        200,
      );
    }
    const decodedData = base64.decode(token);
    const PAYME_MERCHANT_KEY =
      this.configService.get<string>('PAYME_MERCHANT_KEY');

    if (!decodedData.includes(PAYME_MERCHANT_KEY!)) {
      throw new HttpException(
        { error: PaymeError.InvalidAuthorization, id: id || 0 },
        200,
      );
    }

    return true;
  }
}
