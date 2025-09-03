import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';
import { TokenDto } from './dto/token.dto';
import { GoogleOauthGuard } from './guards/google-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { TokenService } from './token.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, req);
  }

  @Post('register-google')
  async registerMobileGoogle(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.registerMobileGoogle(dto, req);
  }

  @UsePipes(new ValidationPipe())
  @Post('register-otp')
  async registerOtp(@Body() dto: { phone_number: string; hash: string }) {
    return this.authService.registerOtp(dto);
  }

  @UsePipes(new ValidationPipe())
  @Post('refresh')
  async getNewTokens(@Body() dto: TokenDto, @Req() req: Request) {
    const user_agent =
      (req.headers['x-device'] as string) || req.headers['user-agent'];
    const device = user_agent ? user_agent : 'unknown';
    const ip =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      req.ip;
    return this.authService.getNewTokens({
      ...dto,
      device,
      ip: ip || 'not defined',
    });
  }

  @Post('verify')
  async verify(
    @Body() body: { login: string; code: number },
    @Req() req: Request,
  ) {
    return await this.authService.verify(body, req);
  }

  @Post('telegram')
  async telegramPost(@Body() body) {
    const userData = body;

    if (!this.authService.checkTelegramAuth(userData)) {
      return { error: 'Auth verification failed' };
    }

    // Foydalanuvchi login qildi, JWT yoki sessiya yaratish mumkin
    return { message: 'Authentication successful', user: userData };
  }

  @Get('telegram')
  async telegramGet(@Req() req: Request) {
    console.log(req.query, 'get');
    return req.query;
  }

  @Post('telegram-auth')
  async telegramAuth() {
    return await this.authService.loginWithCustomTelegram();
  }

  @Post('check-token/:token')
  async checkToken(@Param('token') token: string, @Req() req: Request) {
    return await this.authService.checkToken(token, req); // Dfb0vnJijeG__iGHycUAmD088EXo0FuT
  }

  // @Get('google')
  // @UseGuards(AuthGuard("google-token"))
  // // eslint-disable-next-line @typescript-eslint/no-empty-function
  // async auth() {}

  // @Post('google/callback')
  // @UseGuards(AuthGuard('google-token'))
  // async googleAuthCallback(@Req() req, @Res() res) {
  //   const token = await this.authService.signIn(req.user, req);

  //   res.cookie('access_token', token?.token.accessToken, {
  //     maxAge: 2592000000,
  //     sameSite: true,
  //     secure: false,
  //   });

  //   return res.status(HttpStatus.OK);
  // }
}
