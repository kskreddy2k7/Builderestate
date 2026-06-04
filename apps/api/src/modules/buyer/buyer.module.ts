import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { BuyerService } from './buyer.service'
import { BuyerController } from './buyer.controller'

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [BuyerService],
  controllers: [BuyerController],
  exports: [BuyerService],
})
export class BuyerModule {}
