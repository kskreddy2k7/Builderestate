import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ConstructionService } from './construction.service'
import { ConstructionController } from './construction.controller'

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [ConstructionService],
  controllers: [ConstructionController],
  exports: [ConstructionService],
})
export class ConstructionModule {}
