import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { comparePasswords } from '../common/utils/hash.util';
import { LoggingService } from 'src/common/logging.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private loggingService: LoggingService,
  ) {}

  async register(name: string, email: string, password: string) {
    try {
      this.loggingService.log(
        `User is Registering with Registraion Post Api this email : ${email}`,
      );
      const user = await this.usersService.createUser(
        name,
        email,
        password,
      );
      this.loggingService.log(
        `User registered successfully with email: ${email}`,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userData } = user.toObject();

      return {
        message: 'User registered successfully',
        userInfo: userData,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      this.loggingService.error(
        `Registration failed for email: ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      this.loggingService.log(
        `User login post api in attempt with email: ${email}`,
      );

      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.loggingService.error(
          `Login failed for email: ${email} - User not found`,
          '',
        );

        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Please use the Valid Email',
          error: 'Unauthorized',
        });
      }

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        this.loggingService.error(`Password is not matching`, '');
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Please use the correct Password',
          error: 'Unauthorized',
        });
      }

      const payload = { sub: user.id, email: user.email };
      const token = this.jwtService.sign(payload);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userData } = user.toObject();
      return {
        accessToken: token,
        statusCode: HttpStatus.OK,
        userInfo: userData,
      };
    } catch (error) {
      this.loggingService.error(
        `Login failed for email: ${email}`,
        error.stack,
      );
      throw error;
    }
  }
}
