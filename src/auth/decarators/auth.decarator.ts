import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { OnlyAdminGuard } from '../guards/admin.guard';
import { RoleUser } from 'src/user/user.interface';

export function Auth(role: RoleUser = 'USER') {
  return applyDecorators(
    role === 'ADMIN'
      ? UseGuards(JwtAuthGuard, OnlyAdminGuard)
      : UseGuards(JwtAuthGuard),
  );
}
