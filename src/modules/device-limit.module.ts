// src/utils/checkDeviceLimit.ts

import mongoose, { Model } from 'mongoose';
import { SessionDocument } from 'src/auth/sessions.model';

export const checkDeviceLimit = async (
  userId: string | mongoose.Types.ObjectId,
  deviceId: string,
  model: Model<SessionDocument>,
  limit: number = 3,
): Promise<boolean> => {
  // Foydalanuvchining barcha aktiv qurilmalari
  const devices = await model.find({ user_id: userId }).lean();

  // Qurilma allaqachon ro'yxatda bo'lsa — o‘tkazamiz
  const alreadyExists = devices.some((device) => device.token_id === deviceId);

  // Agar qurilma mavjud emas va limitga yetilgan bo‘lsa — false
  if (!alreadyExists && devices.length >= limit) {
    return false;
  }

  // Aks holda — joy bor
  return true;
};
