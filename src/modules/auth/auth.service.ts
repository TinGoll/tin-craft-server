/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: LoginDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', {
        username: dto.username,
      })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    const decoded = this.jwtService.decode<JwtPayload>(accessToken);

    return {
      accessToken,
      expiresAt: (decoded?.exp || 0) * 1000,
      uuid: user.id,
      username: user.username,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      return {
        valid: true,
        uuid: payload.sub,
        expiresAt: (payload?.exp || 0) * 1000,
      };
    } catch (e) {
      throw new UnauthorizedException('Токен невалиден или истек');
    }
  }

  async listUsers() {
    return this.usersRepository.find({
      select: ['id', 'username'],
    });
  }

  async checkUsername(username: string) {
    const exists = await this.usersRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', {
        username,
      })
      .getExists();

    return {
      available: !exists,
    };
  }
}
