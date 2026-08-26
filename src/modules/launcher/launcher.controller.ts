import { Controller, Get, Header } from '@nestjs/common';
import { LauncherService } from './launcher.service';

@Controller('launcher')
export class LauncherController {
  constructor(private readonly launcherService: LauncherService) {}

  @Get('version')
  @Header('Cache-Control', 'no-store')
  getVersion() {
    return this.launcherService.getVersion();
  }
}
