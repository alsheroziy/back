import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class TokenService {
  generate(length = 32): string {
    return nanoid(length);
  }

  // UUID-style fallback (extra variant, optional)
  generateUUID(): string {
    return crypto.randomUUID();
  }
}
