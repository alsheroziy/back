import { UserDocument } from 'src/user/user.model';

// types/express/index.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
