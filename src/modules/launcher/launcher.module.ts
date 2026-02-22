import { Module } from '@nestjs/common';
import { LauncherController } from './launcher.controller';

@Module({
  controllers: [LauncherController],
})
export class LauncherModule {}
