import { GetUser } from './get-user.decorator';
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { Payload, User as UserDocument } from 'src/types/user';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @UseGuards(AuthGuard())
  @Get('/:id')
  async getUser(@Param('id') id: string, @GetUser() user: UserDocument) {
    console.log('user', user) // get current user here
    return await this.authService.findById({ id });
  }

  @Post('register')
  async register(@Body() userDTO: RegisterDTO) {
    const user = await this.authService.create(userDTO);
    const payload: Payload = {
      username: user.username,
    };
    const token = await this.authService.signPayload(payload);
    return { user, token };
  }

  @Post('login')
  async login(@Body() userDTO: LoginDTO) {
    const user = await this.authService.findByLogin(userDTO);
    const payload: Payload = {
      username: user.username,
    };
    const token = await this.authService.signPayload(payload);
    return { user, token };
  }

}
