import { Context, SessionFlavor } from 'grammy';
import { TelegramUserDocument } from './telegram-user.model';

export interface CustomContext extends Context {
  user?: TelegramUserDocument | null;
}

export interface SessionData {
  step?: 'contact' | 'home' | 'verify_otp';
  data?: string;
}

export type MyContext = CustomContext & SessionFlavor<SessionData>;
