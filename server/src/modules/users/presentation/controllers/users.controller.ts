import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { SESSION_DURATION } from 'src/config';
import { UnauthorizedException } from '@infrastructure/exceptions/app-exceptions';
import { JwtService } from '@nestjs/jwt';
import { Public } from 'src/decorators/public.decorator';
import { UsersService } from '../../application/services/users.service';
import { UserMapper } from '../mappers/user.mapper';
import { IUser } from '../../domain/entities/user.entity';
import { User } from '../../../../decorators/user.decorator';
import { LoginDto } from '../dtos/login.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userMapper: UserMapper,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Get()
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return { hasUsers: users?.length && users.length > 0 };
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    if (!password || !username) {
      throw new HttpException(
        {
          success: false,
          message: 'Identification is incorrect!',
          data: {
            isLogin: false,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.usersService.findUserByEmailAndPassword(username, password);

    if (!user) {
      throw new UnauthorizedException('Identification is incorrect!');
    }

    const payload = {
      email: user.email,
      expiration: Date.now() + SESSION_DURATION,
    };

    const token = this.jwtService.sign(payload);

    // Set the cookie using passthrough response
    response.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return {
      currentAuthority: user.role,
    };
  }

  @Public()
  @Post()
  async createUser(@Body() userData: Partial<IUser>) {
    try {
      const users = await this.usersService.getAllUsers();
      if ((users?.length || 0) >= 1) {
        throw new HttpException(
          {
            success: false,
            message: 'Only one user is allowed to be created',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const user = await this.usersService.createUser(userData as IUser);
      return {
        success: true,
        message: 'User created successfully',
        data: this.userMapper.toResponse(user),
      };
    } catch (error: unknown) {
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Error creating user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':email/api-key')
  async regenerateApiKey(@Param('email') email: string, @User() user) {
    // Only admins can regenerate API keys for other users
    if (user.role !== 'admin' && user.email !== email) {
      throw new HttpException(
        {
          success: false,
          message: 'Unauthorized',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const newApiKey = await this.usersService.regenerateApiKey(email);
    if (!newApiKey) {
      throw new HttpException(
        {
          success: false,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      message: 'API key regenerated successfully',
      data: { apiKey: newApiKey },
    };
  }

  @Put(':email/logs-level')
  async updateLogsLevel(
    @Param('email') email: string,
    @Body() logsLevelData: { logsLevel: any },
    @User() user,
  ) {
    // Only admins can update logs level for other users
    if (user.role !== 'admin' && user.email !== email) {
      throw new HttpException(
        {
          success: false,
          message: 'Unauthorized',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedUser = await this.usersService.updateLogsLevel(email, logsLevelData.logsLevel);
    if (!updatedUser) {
      throw new HttpException(
        {
          success: false,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      message: 'Logs level updated successfully',
      data: this.userMapper.toResponse(updatedUser),
    };
  }

  @Get('current')
  async getCurrentUser(@User() user) {
    return this.usersService.getCurrentUser(user);
  }
}
