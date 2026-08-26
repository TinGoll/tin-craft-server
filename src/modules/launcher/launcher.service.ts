import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface LauncherVersion {
  version: string;
  platform: string;
  url: string;
  sha256: string;
}

@Injectable()
export class LauncherService {
  private readonly configPath: string;

  constructor(config: ConfigService) {
    // Match the static directory used by ServeStaticModule.
    this.configPath = join(
      __dirname,
      '..',
      '..',
      '..',
      config.get<string>('STATIC_DIR', 'updates'),
      'launcher.json',
    );
  }

  async getVersion(): Promise<LauncherVersion> {
    try {
      // Read on every request: publishing a release needs no restart.
      const data: unknown = JSON.parse(
        (await readFile(this.configPath, 'utf8')).replace(/^\uFEFF/, ''),
      );
      if (!data || typeof data !== 'object') throw new Error('Invalid config');
      const { version, platform, url, sha256 } = data as Record<
        string,
        unknown
      >;
      if (
        typeof version !== 'string' ||
        !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
          version,
        ) ||
        typeof platform !== 'string' ||
        !/^[a-z0-9]+-[a-z0-9]+$/.test(platform) ||
        typeof url !== 'string' ||
        new URL(url).protocol !== 'https:' ||
        typeof sha256 !== 'string' ||
        !/^[a-fA-F0-9]{64}$/.test(sha256)
      ) {
        throw new Error('Invalid config');
      }
      return { version, platform, url, sha256 };
    } catch {
      throw new ServiceUnavailableException(
        'Launcher metadata unavailable: check launcher.json',
      );
    }
  }
}
