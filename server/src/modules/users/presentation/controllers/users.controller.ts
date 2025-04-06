import { UnauthorizedException } from '@infrastructure/exceptions/app-exceptions';
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
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SESSION_DURATION } from 'src/config';
import { Public } from 'src/decorators/public.decorator';
import { User } from '../../../../decorators/user.decorator';
import {
  ACTIONS,
  RESOURCES,
  ResourceAction,
} from '../../../../infrastructure/security/roles/resource-action.decorator';
import { UsersService } from '../../application/services/users.service';
import { IUser } from '../../domain/entities/user.entity';
import { LoginResponseDto } from '../dtos/login-response.dto';
import { LoginDto } from '../dtos/login.dto';
import { UserMapper } from '../mappers/user.mapper';

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
  @ResourceAction(RESOURCES.USER, ACTIONS.EXECUTE)
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
  @ResourceAction(RESOURCES.USER, ACTIONS.CREATE)
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
      return this.userMapper.toResponse(user);
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

  @Put('api-key')
  @ResourceAction(RESOURCES.USER, ACTIONS.UPDATE)
  async regenerateApiKey(@User() user) {
    const newApiKey = await this.usersService.regenerateApiKey(user.email);
    if (!newApiKey) {
      throw new HttpException(
        {
          success: false,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return { apiKey: newApiKey };
  }

  @Post('logs-level')
  @ResourceAction(RESOURCES.USER, ACTIONS.UPDATE)
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
      data: this.userMapper.toResponse(updatedUser),
    };
  }

  @Get('current')
  @ResourceAction(RESOURCES.USER, ACTIONS.READ)
  async getCurrentUser(@User() user) {
    return this.usersService.getCurrentUser(user);
  }
}
