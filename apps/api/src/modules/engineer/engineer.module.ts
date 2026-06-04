import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { EngineerService } from './engineer.service'
import { EngineerController } from './engineer.controller'

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [EngineerService],
  controllers: [EngineerController],
  exports: [EngineerService],
})
export class EngineerModule {}
