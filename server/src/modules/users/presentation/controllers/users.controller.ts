import { UnauthorizedException } from '@infrastructure/exceptions/app-exceptions';
import { Body, Controller, Get, HttpException, HttpStatus, Post, Put, Res } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SESSION_DURATION } from 'src/config';
import Events from 'src/core/events/events';
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
import {
  CheckUsersExistenceDoc,
  CreateUserDoc,
  GetCurrentUserDoc,
  LoginDoc,
  LogoutDoc,
  RegenerateApiKeyDoc,
  USERS_TAG,
  UpdateLogsLevelDoc,
} from '../decorators/users.decorators';

@ApiTags(USERS_TAG)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userMapper: UserMapper,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Public()
  @Get()
  @CheckUsersExistenceDoc()
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return { hasUsers: users?.length && users.length > 0 };
  }

  @Public()
  @Post('login')
  @ResourceAction(RESOURCES.USER, ACTIONS.EXECUTE)
  @LoginDoc()
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

    response.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
    });
    this.eventEmitter.emit(Events.TELEMETRY_EVENT, {
      eventName: 'user login',
    });
    return {
      currentAuthority: user.role,
    };
  }

  @Public()
  @Post()
  @ResourceAction(RESOURCES.USER, ACTIONS.CREATE)
  @CreateUserDoc()
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
  @RegenerateApiKeyDoc()
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
  @UpdateLogsLevelDoc()
  async updateLogsLevel(@Body() logsLevelData: { terminal: any }, @User() user) {
    if (user.role !== 'admin') {
      throw new HttpException(
        {
          success: false,
          message: 'Unauthorized',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedUser = await this.usersService.updateLogsLevel(user.email, logsLevelData.terminal);
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
  @GetCurrentUserDoc()
  async getCurrentUser(@User() user) {
    return this.usersService.getCurrentUser(user);
  }

  @Post('logout')
  @ResourceAction(RESOURCES.USER, ACTIONS.EXECUTE)
  @LogoutDoc()
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return;
  }
}
