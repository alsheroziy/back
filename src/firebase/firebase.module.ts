import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

// TO‘G‘RI VARIANT:
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
