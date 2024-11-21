import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { hashPassword } from '../common/utils/hash.util';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser)
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User is already registered with the email id',
        error: 'Bad Request',
      });

    const hashedPassword = await hashPassword(password);
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }
}
