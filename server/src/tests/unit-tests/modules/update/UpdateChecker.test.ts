import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { SettingsKeys } from 'ssm-shared-lib';
import { setToCache } from '../../../../data/cache';
import UpdateChecker from '../../../../modules/update/UpdateChecker'; // Adjust the path accordingly

vi.mock('axios');
vi.mock('../../../../data/cache', () => ({
  setToCache: vi.fn(),
}));
vi.mock('../../../../../package.json', () => ({
  version: '1.0.0',
}));

vi.mock('../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

const remoteVersionUrl =
  'https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/release.json';

describe('UpdateChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch the remote version correctly', async () => {
    const mockVersionResponse = { data: { version: '1.1.0' } };
    (axios.get as any).mockResolvedValue(mockVersionResponse);

    const version = await (UpdateChecker as any).getRemoteVersion();

    expect(axios.get).toHaveBeenCalledWith(remoteVersionUrl);
    expect(version).toBe('1.1.0');
  });

  it('should return null for invalid local version in compareVersions', () => {
    const result = (UpdateChecker as any).compareVersions('invalid_version', '1.1.0');

    expect(result).toBeNull();
  });

  it('should return null for invalid remote version in compareVersions', () => {
    const result = (UpdateChecker as any).compareVersions('1.0.0', 'invalid_version');

    expect(result).toBeNull();
  });

  it('should set the correct cache value when local version is older', async () => {
    const mockVersionResponse = { data: { version: '2.0.0' } };
    (axios.get as any).mockResolvedValue(mockVersionResponse);

    await UpdateChecker.checkVersion();

    expect(setToCache).toHaveBeenCalledWith(
      SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE,
      '2.0.0',
    );
  });

  it('should set the correct cache value when local version is newer', async () => {
    const mockVersionResponse = { data: { version: '0.9.0' } };
    (axios.get as any).mockResolvedValue(mockVersionResponse);

    await UpdateChecker.checkVersion();

    expect(setToCache).toHaveBeenCalledWith(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, '');
  });

  it('should set the correct cache value when versions are identical', async () => {
    const mockVersionResponse = { data: { version: '1.0.0' } };
    (axios.get as any).mockResolvedValue(mockVersionResponse);

    await UpdateChecker.checkVersion();

    expect(setToCache).toHaveBeenCalledWith(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, '');
  });
});
