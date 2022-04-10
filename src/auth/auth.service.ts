import { Injectable, HttpException, HttpStatus, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { sign } from 'jsonwebtoken';
import { Payload, User } from 'src/types/user';
import { LoginDTO, RegisterDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private userModel: Model<User>) { }

  async signPayload(payload: Payload) {
    return sign(payload, 'secretKey', { expiresIn: '12h' });
  }

  async findById(id) {
    return await this.userModel.findOne({ id });
  }
  async findByUser(payload) {
    const { username } = payload;
    return await this.userModel.findOne({ username });
  }


  async findByLogin(userDTO: LoginDTO) {
    const { username, password } = userDTO;
    const user = await this.userModel
      .findOne({ username })
      .select('username password created email address'); // get columns in table by using .select
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    if (await bcrypt.compare(password?.toString(), user.password)) {
      return this.sanitizeUser(user);
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  async create(userDTO: RegisterDTO) {
    const { username } = userDTO;
    const user = await this.userModel.findOne({ username });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const createdUser = new this.userModel(userDTO);
    await createdUser.save();
    // return this.sanitizeUser(createdUser);
    return createdUser;
  }

  sanitizeUser(user: User) {
    const sanitized = user.toObject();
    const { password, ...rest } = sanitized
    return rest;
    // return user.depopulate('password');
  }
}
