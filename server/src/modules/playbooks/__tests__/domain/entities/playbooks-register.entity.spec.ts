import { describe, expect, it } from 'vitest';
import { SsmGit } from 'ssm-shared-lib';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';

describe('PlaybooksRegister Entity', () => {
  it('should create a valid local playbooks register', () => {
    const localRegister: IPlaybooksRegister = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Local Playbooks',
      type: 'local',
      enabled: true,
      directory: '/path/to/playbooks',
      directoryExclusionList: ['.git', 'node_modules'],
      default: true,
    };

    expect(localRegister).toBeDefined();
    expect(localRegister.uuid).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(localRegister.type).toBe('local');
    expect(localRegister.enabled).toBe(true);
    expect(localRegister.directory).toBe('/path/to/playbooks');
    expect(localRegister.directoryExclusionList).toEqual(['.git', 'node_modules']);
    expect(localRegister.default).toBe(true);
  });

  it('should create a valid git playbooks register', () => {
    const gitRegister: IPlaybooksRegister = {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Git Playbooks',
      description: 'Playbooks from Git repository',
      type: 'git',
      enabled: true,
      remoteUrl: 'https://github.com/example/playbooks.git',
      branch: 'main',
      userName: 'username',
      accessToken: 'token123',
      email: 'user@example.com',
      gitService: SsmGit.Services.GITHUB,
      directory: '/path/to/git/playbooks',
      ignoreSSLErrors: false,
      directoryExclusionList: ['.git'],
      vaults: ['vault1', 'vault2'],
      default: false,
    };

    expect(gitRegister).toBeDefined();
    expect(gitRegister.uuid).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(gitRegister.type).toBe('git');
    expect(gitRegister.remoteUrl).toBe('https://github.com/example/playbooks.git');
    expect(gitRegister.branch).toBe('main');
    expect(gitRegister.gitService).toBe(SsmGit.Services.GITHUB);
    expect(gitRegister.accessToken).toBe('token123');
    expect(gitRegister.vaults).toEqual(['vault1', 'vault2']);
  });

  it('should have optional fields as undefined when not provided', () => {
    const minimalRegister: IPlaybooksRegister = {
      uuid: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Minimal Register',
      type: 'local',
      enabled: true,
      directory: '/path/to/minimal',
    };

    expect(minimalRegister).toBeDefined();
    expect(minimalRegister.description).toBeUndefined();
    expect(minimalRegister.directoryExclusionList).toBeUndefined();
    expect(minimalRegister.vaults).toBeUndefined();
    expect(minimalRegister.createdAt).toBeUndefined();
    expect(minimalRegister.updatedAt).toBeUndefined();
  });
});
