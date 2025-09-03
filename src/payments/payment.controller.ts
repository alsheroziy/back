import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  Res,
} from '@nestjs/common';
import { PaymeService } from './payme.service';
import { PaymeCheckTokenGuard } from './payme.guard';
import { PaymeMethod } from '../enums/transaction.enum';
import { User } from 'src/user/decarators/user.decarator';
import { Auth } from 'src/auth/decarators/auth.decarator';
import { ClickService } from './click.service';
import { Request, Response } from 'express';
import { PaynetService } from './paynet.service';

@Controller('payments')
export class PaymeController {
  constructor(
    private readonly paymeService: PaymeService,
    private readonly clickService: ClickService,
    private readonly paynetService: PaynetService,
  ) {}
  // payme
  @Post('payme/checkout')
  @Auth()
  @HttpCode(200)
  async checkout(@Req() req, @User('id') user_id: string, @Body() body) {
    return await this.paymeService.checkout(user_id, body.amount, req.body.url);
  }

  @Post('payme/pay')
  @UseGuards(PaymeCheckTokenGuard)
  @HttpCode(200)
  async paymePay(@Body() body) {
    const { method, params, id } = body;
    switch (method) {
      case PaymeMethod.CheckPerformTransaction: {
        await this.paymeService.checkPerformTransaction(params, id);
        return { result: { allow: true } };
      }
      case PaymeMethod.CheckTransaction: {
        const result = await this.paymeService.checkTransaction(params, id);
        return { result, id };
      }
      case PaymeMethod.CreateTransaction: {
        const result = await this.paymeService.createTransaction(params, id);
        return { result, id };
      }
      case PaymeMethod.PerformTransaction: {
        const result = await this.paymeService.performTransaction(params, id);
        return { result, id };
      }
      case PaymeMethod.CancelTransaction: {
        const result = await this.paymeService.cancelTransaction(params, id);
        return { result, id };
      }
      case PaymeMethod.GetStatement: {
        const result = await this.paymeService.getStatement(params);
        return { result: { transactions: result } };
      }
    }
  }

  // pay click
  @Post('payme/top-up')
  async paymeTopUp(
    @Body() { user_id, amount }: { user_id: number; amount: number },
  ) {
    return await this.paymeService.topUp({ user_id, amount });
  }

  // click
  @Post('click/prepare')
  @HttpCode(200)
  async prepare(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader(
      'Content-Type',
      'application/x-www-form-urlencoded; charset=UTF-8',
    );

    const data = await this.clickService.prepare(req);
    console.log(JSON.stringify(data, null, 2));
    return data;
  }

  @Post('click/complete')
  @HttpCode(200)
  async complete(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.setHeader(
      'Content-Type',
      'application/x-www-form-urlencoded; charset=UTF-8',
    );

    const data = await this.clickService.complete(req);
    console.log(JSON.stringify(data, null, 2));
    return data;
  }

  // paynet integration
  @Post('paynet')
  async paynet(@Req() req) {
  return await this.paynetService.process(req);
  }

  // pay click
  @Post('click/top-up')
  async clickTopUp(
    @Body() { user_id, amount }: { user_id: number; amount: number },
  ) {
    return await this.clickService.topUp({ user_id, amount });
  }
}
