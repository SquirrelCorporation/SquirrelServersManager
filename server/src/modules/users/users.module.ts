import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { DevicesModule } from '@modules/devices';
import { AnsibleModule } from '@modules/ansible';
import { SECRET } from '../../config';
import { UsersService } from './application/services/users.service';
import { UsersController } from './presentation/controllers/users.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { USER, UserSchema } from './infrastructure/schemas/user.schema';
import { USER_REPOSITORY } from './domain/repositories/user-repository.interface';
import { UserMapper } from './presentation/mappers/user.mapper';
import { UserRepositoryMapper } from './infrastructure/mappers/user-repository.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: USER, schema: UserSchema }]),
    JwtModule.register({
      secret: SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    DevicesModule,
    forwardRef(() => AnsibleModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserMapper,
    UserRepositoryMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [UsersService, USER_REPOSITORY],
})
export class UsersModule {}
