import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { MarketplaceService } from './marketplace.service'
import { MarketplaceController } from './marketplace.controller'

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
