import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './application/services/users.service';
import { UsersController } from './presentation/controllers/users.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { USER, UserSchema } from './infrastructure/schemas/user.schema';
import { USER_REPOSITORY } from './domain/repositories/user-repository.interface';
import { UserMapper } from './presentation/mappers/user.mapper';
import { UserRepositoryMapper } from './infrastructure/mappers/user-repository.mapper';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER, schema: UserSchema },
    ]),
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
  exports: [UsersService],
})
export class UsersModule {}