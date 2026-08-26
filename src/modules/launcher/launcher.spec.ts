import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { LauncherModule } from './launcher.module';

describe('Launcher metadata (HTTP)', () => {
  let app: INestApplication<App>;
  let directory: string;
  let configPath: string;
  const metadata = {
    version: '1.0.0',
    platform: 'win-x64',
    url: 'https://tincraft.ru/updates/TinCraft-Launcher-1.0.0.exe',
    sha256: 'c2a4dcc3b990e1224835778e1c5111ec33e328f35979d854d042233ed5e34727',
  };

  beforeEach(async () => {
    directory = await mkdtemp(join(__dirname, '.launcher-test-'));
    configPath = join(directory, 'launcher.json');
    const module = await Test.createTestingModule({ imports: [LauncherModule] })
      .overrideProvider(ConfigService)
      .useValue({
        get: () => relative(join(__dirname, '..', '..', '..'), directory),
      })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
    await rm(directory, { recursive: true, force: true });
  });

  it('returns the existing API contract with no-store', async () => {
    await writeFile(
      configPath,
      JSON.stringify({ ...metadata, extra: 'ignored' }),
    );
    await request(app.getHttpServer())
      .get('/launcher/version')
      .expect('Cache-Control', 'no-store')
      .expect(200, metadata);
  });

  it('reads an atomically replaced config without restarting', async () => {
    await writeFile(configPath, JSON.stringify(metadata));
    await request(app.getHttpServer())
      .get('/launcher/version')
      .expect(200, metadata);
    const next = {
      ...metadata,
      version: '1.0.1',
      url: 'https://tincraft.ru/updates/TinCraft-Launcher-1.0.1.exe',
    };
    await writeFile(`${configPath}.tmp`, JSON.stringify(next));
    await rename(`${configPath}.tmp`, configPath);
    await request(app.getHttpServer())
      .get('/launcher/version')
      .expect(200, next);
  });

  it('accepts UTF-8 BOM from Windows editors', async () => {
    await writeFile(configPath, '\uFEFF' + JSON.stringify(metadata));
    await request(app.getHttpServer())
      .get('/launcher/version')
      .expect(200, metadata);
  });

  it('accepts the checked-in example', async () => {
    await writeFile(
      configPath,
      await readFile(join(__dirname, '../../../launcher.example.json')),
    );
    await request(app.getHttpServer())
      .get('/launcher/version')
      .expect(200, metadata);
  });

  it('returns 503 for a missing config and recovers when it appears', async () => {
    await request(app.getHttpServer()).get('/launcher/version').expect(503);
    await writeFile(configPath, JSON.stringify(metadata));
    await request(app.getHttpServer())
      .get('/launcher/version')
      .expect(200, metadata);
  });

  it.each([
    '{',
    'null',
    '[]',
    JSON.stringify({ ...metadata, version: 1 }),
    JSON.stringify({ ...metadata, platform: '' }),
    JSON.stringify({ ...metadata, url: 'not-a-url' }),
    JSON.stringify({ ...metadata, url: 'javascript:alert(1)' }),
    JSON.stringify({ ...metadata, sha256: 'b1946ac92492d2347c6235b4d2611184' }),
  ])('returns 503 for invalid config: %s', async (contents) => {
    await writeFile(configPath, contents);
    await request(app.getHttpServer()).get('/launcher/version').expect(503);
  });
});
