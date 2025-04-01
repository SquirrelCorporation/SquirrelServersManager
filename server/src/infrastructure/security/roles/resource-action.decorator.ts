import { SetMetadata } from '@nestjs/common';

// Define available resources as string literals to avoid importing from entity files
export const RESOURCES = {
  DEVICE: 'device',
  CONTAINER: 'container',
  ANSIBLE: 'ansible',
  PLAYBOOK: 'playbook',
  USER: 'user',
  SETTING: 'setting',
  STACK: 'stack',
  REGISTRY: 'registry',
} as const;

// Define available actions on resources
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EXECUTE: 'execute',
} as const;

export const RESOURCE_ACTION_KEY = 'resource_action';

// Resource action decorator that can be applied to controllers or routes
export const ResourceAction = (resource: string, action: string) =>
  SetMetadata(RESOURCE_ACTION_KEY, { resource, action });
