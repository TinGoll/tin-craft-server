import { Controller, Get } from '@nestjs/common';

@Controller('launcher')
export class LauncherController {
  @Get('version')
  getVersion() {
    return {
      version: '1.0.0',
      platform: 'win-x64',
      url: 'https://tincraft.ru/updates/TinCraft-Launcher-1.0.0.exe',
      sha256: 'b1946ac92492d2347c6235b4d2611184',
    };
  }
}
