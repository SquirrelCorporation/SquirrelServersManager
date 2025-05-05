import { UsersModule } from './users.module';
import { IUser, Role, UserLogsDefaults, UserLogsLevel } from './domain/entities/user.entity';
import { IUserRepository, USER_REPOSITORY } from './domain/repositories/user-repository.interface';

// Re-export the module
export { UsersModule };

// Re-export domain types
export { IUser, Role, UserLogsLevel, UserLogsDefaults };

// Re-export repository interfaces
export { IUserRepository, USER_REPOSITORY };

// Add any necessary service exports below as the module grows