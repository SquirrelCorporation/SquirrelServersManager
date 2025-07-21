import { Injectable } from '@nestjs/common';
import { Role } from '../../../modules/users/domain/entities/user.entity';
import { ACTIONS, RESOURCES } from './resource-action.decorator';

/**
 * Service to manage permissions based on roles and resources
 */
@Injectable()
export class PermissionService {
  // Permission matrix defining which roles can perform which actions on which resources
  private readonly permissionMatrix: Record<Role, Record<string, string[]>> = {
    [Role.ADMIN]: {
      [RESOURCES.DEVICE]: [
        ACTIONS.CREATE,
        ACTIONS.READ,
        ACTIONS.UPDATE,
        ACTIONS.DELETE,
        ACTIONS.EXECUTE,
      ],
      [RESOURCES.CONTAINER]: [
        ACTIONS.CREATE,
        ACTIONS.READ,
        ACTIONS.UPDATE,
        ACTIONS.DELETE,
        ACTIONS.EXECUTE,
      ],
      [RESOURCES.ANSIBLE]: [
        ACTIONS.CREATE,
        ACTIONS.READ,
        ACTIONS.UPDATE,
        ACTIONS.DELETE,
        ACTIONS.EXECUTE,
      ],
      [RESOURCES.PLAYBOOK]: [
        ACTIONS.CREATE,
        ACTIONS.READ,
        ACTIONS.UPDATE,
        ACTIONS.DELETE,
        ACTIONS.EXECUTE,
      ],
      [RESOURCES.USER]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
      [RESOURCES.SETTING]: [ACTIONS.READ, ACTIONS.UPDATE],
      [RESOURCES.STACK]: [
        ACTIONS.CREATE,
        ACTIONS.READ,
        ACTIONS.UPDATE,
        ACTIONS.DELETE,
        ACTIONS.EXECUTE,
      ],
      [RESOURCES.REGISTRY]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    },
    [Role.USER]: {
      [RESOURCES.DEVICE]: [ACTIONS.READ, ACTIONS.EXECUTE],
      [RESOURCES.CONTAINER]: [ACTIONS.READ, ACTIONS.EXECUTE],
      [RESOURCES.ANSIBLE]: [ACTIONS.READ, ACTIONS.EXECUTE],
      [RESOURCES.PLAYBOOK]: [ACTIONS.READ, ACTIONS.EXECUTE],
      [RESOURCES.USER]: [ACTIONS.READ],
      [RESOURCES.SETTING]: [ACTIONS.READ],
      [RESOURCES.STACK]: [ACTIONS.READ, ACTIONS.EXECUTE],
      [RESOURCES.REGISTRY]: [ACTIONS.READ],
    },
  };

  /**
   * Check if a role has permission to perform an action on a resource
   */
  hasPermission(
    role: Role,
    resource: keyof typeof RESOURCES,
    action: keyof typeof ACTIONS,
  ): boolean {
    if (!this.permissionMatrix[role]) {
      return false;
    }

    if (!this.permissionMatrix[role][resource]) {
      return false;
    }

    return this.permissionMatrix[role][resource].includes(action);
  }
}
