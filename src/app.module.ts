import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleSheetModule } from './google-sheet/google-sheet.module';
import { BybitModule } from './bybit/bybit.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [BybitModule, GoogleSheetModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
