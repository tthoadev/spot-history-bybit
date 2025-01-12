import { Module } from '@nestjs/common';
import { BybitService } from './bybit.service';
import { GoogleSheetModule } from '../google-sheet/google-sheet.module';

@Module({
  imports: [GoogleSheetModule],
  providers: [BybitService],
  exports: [BybitService],
})
export class BybitModule {}
