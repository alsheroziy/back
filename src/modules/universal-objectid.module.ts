import mongoose, { isValidObjectId, Types } from 'mongoose';

export function parseObjectIdArray(value: string): Types.ObjectId[] {
  return value
    .split(',')
    .map((id: string) => (isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null))
    .filter((id): id is Types.ObjectId => id !== null);
}
