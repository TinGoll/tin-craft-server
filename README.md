<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

### Версия лаунчера

`GET /launcher/version` читает `updates/launcher.json` при каждом запросе.
Если задан `STATIC_DIR`, конфиг находится в этом каталоге рядом с установщиками.
Формат ответа API не изменён. Пересборка и перезапуск при смене релиза не нужны.
Первое внедрение этого механизма требует однократной сборки и перезапуска backend.

Начальный конфиг: скопировать `launcher.example.json` в `updates/launcher.json`.
Рабочий конфиг и установщики не хранятся в Git; не перезаписывать рабочий конфиг
примером при последующих развёртываниях. Каталог `updates` должен сохраняться
между развёртываниями (в Docker Compose он подключён как volume).

На текущем VDS конфиг: `/app/nest_app/updates/launcher.json`.
Механизм внедрён 26 августа 2026 года. Резервная копия прежнего серверного
модуля: `/root/tincraft-backups/20260826-launcher-config.rsqySJbl/launcher`.

Публикация новой версии:

1. Вручную загрузить установщик с новым именем в `updates` (сначала как `.tmp`,
   затем переименовать после полной загрузки). Старый установщик не заменять.
2. Посчитать SHA-256: `sha256sum /app/nest_app/updates/TinCraft-Launcher-1.0.1.exe`
   на VDS или `Get-FileHash .\TinCraft-Launcher-1.0.1.exe -Algorithm SHA256`
   в PowerShell.
3. Подготовить `launcher.json.tmp` по образцу, изменив `version`, `url`, `sha256`.
   `platform` оставить `win-x64`. Версия — строка вида `1.0.1`, URL — полный HTTPS,
   SHA-256 — 64 шестнадцатеричных символа. JSON — UTF-8, без комментариев.
4. Сохранить резервную копию прежнего конфига вне публичного каталога `updates`,
   затем атомарно переименовать готовый `launcher.json.tmp` в `launcher.json`
   в том же каталоге. Не редактировать рабочий файл во время загрузки.
5. Проверить `https://tincraft.ru/launcher/version` и ссылку на установщик.

Конфиг публичный: не помещать в него секреты. Сервер проверяет формат, но
не скачивает установщик и не проверяет совпадение его хеша при запросе API.
При отсутствующем или некорректном конфиге endpoint возвращает HTTP 503;
исправление файла подхватывается следующим запросом. Ответ имеет `Cache-Control: no-store`.
Для отката достаточно вернуть сохранённый конфиг, если старый установщик доступен.

#### Получение SHA-256 после сборки лаунчера

Считать хеш нужно от окончательного `.exe` после завершения сборки и цифровой
подписи, если она используется. В PowerShell:

```powershell
(Get-FileHash ".\dist\TinCraft-Launcher-1.0.1.exe" -Algorithm SHA256).Hash.ToLowerInvariant()
```

Заменить путь на фактический путь к готовому установщику. Команда выводит
64 шестнадцатеричных символа: скопировать их в поле `sha256` файла `launcher.json`.
На сервер загрузить именно тот файл, для которого вычислен хеш.

Команду можно добавить последним шагом скрипта сборки лаунчера, выполняемым
только после успешной сборки и подписи. После изменения, повторной сборки или
переподписания установщика хеш необходимо пересчитать.

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
