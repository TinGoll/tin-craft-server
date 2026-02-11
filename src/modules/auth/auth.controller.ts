import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: LoginDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('validate')
  validate(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Нет токена');
    }

    const token = authHeader;
    return this.authService.validateToken(token);
  }

  @Get('check-login')
  async checkUsername(@Query('login') login: string) {
    if (!login) {
      return { available: false };
    }

    return this.authService.checkUsername(login);
  }
}
