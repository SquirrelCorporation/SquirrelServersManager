import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UsersService } from '../../application/services/users.service';
import { UserMapper } from '../mappers/user.mapper';
import { IUser } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { User } from '../../../../decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userMapper: UserMapper,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: this.userMapper.toResponseList(users),
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@User() user) {
    const userProfile = await this.usersService.findUserByEmail(user.email);
    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: this.userMapper.toResponse(userProfile),
    };
  }

  @Post('first-user')
  async createFirstUser(
    @Body() userData: { name: string; email: string; password: string; avatar?: string },
  ) {
    try {
      const { name, email, password, avatar } = userData;
      const user = await this.usersService.createFirstAdminUser(name, email, password, avatar);

      return {
        success: true,
        message: 'First user created successfully',
        data: this.userMapper.toResponse(user),
      };
    } catch (error: unknown) {
      throw new HttpException(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Error creating first user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createUser(@Body() userData: Partial<IUser>) {
    try {
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
}