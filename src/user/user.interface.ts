import { UserDocument } from './user.model';

export type RoleUser = 'ADMIN' | 'USER';
export type UserTypeData = keyof UserDocument;
