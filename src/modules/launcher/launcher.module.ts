import { Module } from '@nestjs/common';
import { LauncherController } from './launcher.controller';
import { ConfigModule } from '@nestjs/config';
import { LauncherService } from './launcher.service';

@Module({
  imports: [ConfigModule],
  controllers: [LauncherController],
  providers: [LauncherService],
})
export class LauncherModule {}
