import { Injectable } from '@nestjs/common';
import { IUser } from '../../domain/entities/user.entity';

@Injectable()
export class UserMapper {
  toResponse(domainUser: IUser | null): any {
    if (!domainUser) {
      return null;
    }

    // Remove sensitive information like password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = domainUser;
    return userWithoutPassword;
  }

  toResponseList(domainUsers: IUser[] | null): any[] {
    if (!domainUsers) {
      return [];
    }

    return domainUsers.map((user) => this.toResponse(user));
  }
}
