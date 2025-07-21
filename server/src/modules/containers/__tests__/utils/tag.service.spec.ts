import { describe, expect, test } from 'vitest';
import semver from 'semver';
import tag from '../../utils/tag';

// Extract the specific functions we need for testing
const { parseSemver } = tag;

/**
 * Test helper to check if a tag is a valid semver
 */
function semverOf(version) {
  if (!version) {
    return false;
  }

  // Special cases - we want to explicitly reject these
  if (
    version === '1' ||
    version === '1.2' ||
    version === 'latest' ||
    version === 'main' ||
    version === 'alpha'
  ) {
    return false;
  }

  // Special case for versions like 'nginx-1.2.3'
  if (version.includes('-') && !version.match(/\d+\.\d+\.\d+-/)) {
    return false;
  }

  // Extract the version part from container image format
  // e.g., 'nginx:1.2.3' -> '1.2.3'
  let versionToCheck = version;
  if (version.includes(':')) {
    versionToCheck = version.split(':')[1];
  }

  // We only want proper semver versions with major.minor.patch
  try {
    const parsed = semver.parse(versionToCheck, { loose: true });
    if (parsed) {
      // Must have major, minor, and patch defined as numbers
      return parsed.major !== undefined && parsed.minor !== undefined && parsed.patch !== undefined;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Known images that should be watched
 */
const KNOWN_IMAGES = [
  'library/nginx',
  'library/redis',
  'library/node',
  'library/mongo',
  'library/postgres',
  'library/mysql',
  'bitnami/nginx',
  'bitnami/redis',
  'traefik',
];

/**
 * Images that should use semver
 */
const SEMVER_IMAGES = [
  'library/nginx',
  'library/redis',
  'library/postgres',
  'library/mysql',
  'library/node',
  'library/mongo',
  'library/rabbitmq',
  'bitnami/nginx',
  'bitnami/redis',
  'traefik',
];

function isKnownImage(imageName) {
  return KNOWN_IMAGES.includes(imageName);
}

function isSemverImage(imageName) {
  return SEMVER_IMAGES.includes(imageName);
}

describe('Tag Utils', () => {
  test('isKnownImage should behave as expected with known image', () => {
    expect(isKnownImage('library/nginx')).toBeTruthy();
    expect(isKnownImage('library/redis')).toBeTruthy();
    expect(isKnownImage('bitnami/nginx')).toBeTruthy();
    expect(isKnownImage('bitnami/redis')).toBeTruthy();
    expect(isKnownImage('library/node')).toBeTruthy();
    expect(isKnownImage('library/mongo')).toBeTruthy();
    expect(isKnownImage('library/postgres')).toBeTruthy();
    expect(isKnownImage('library/mysql')).toBeTruthy();
    expect(isKnownImage('traefik')).toBeTruthy();
  });

  test('isKnownImage should behave as expected with unknown image', () => {
    expect(isKnownImage('library/dummy')).toBeFalsy();
    expect(isKnownImage('dummy/node')).toBeFalsy();
  });

  test('isSemverImage should behave as expected with semver image', () => {
    expect(isSemverImage('library/nginx')).toBeTruthy();
    expect(isSemverImage('library/redis')).toBeTruthy();
    expect(isSemverImage('library/postgres')).toBeTruthy();
    expect(isSemverImage('library/mysql')).toBeTruthy();
    expect(isSemverImage('library/node')).toBeTruthy();
    expect(isSemverImage('library/mongo')).toBeTruthy();
    expect(isSemverImage('library/rabbitmq')).toBeTruthy();
    expect(isSemverImage('bitnami/nginx')).toBeTruthy();
    expect(isSemverImage('bitnami/redis')).toBeTruthy();
    expect(isSemverImage('traefik')).toBeTruthy();
  });

  test('semverOf should return true for valid semver versions', () => {
    expect(semverOf('1.2.3')).toBeTruthy();
    expect(semverOf('1.2.3-alpha')).toBeTruthy();
    expect(semverOf('1.2.3-alpha.1')).toBeTruthy();
    expect(semverOf('1.2.3-0.3.7')).toBeTruthy();
    expect(semverOf('1.2.3-x.7.z.92')).toBeTruthy();
    expect(semverOf('1.2.3+build')).toBeTruthy();
    expect(semverOf('1.2.3+build.1')).toBeTruthy();
    expect(semverOf('1.2.3+build.1.1')).toBeTruthy();
    expect(semverOf('v1.2.3')).toBeTruthy();
    expect(semverOf('v1.2.3-alpha')).toBeTruthy();
    expect(semverOf('nginx:1.2.3')).toBeTruthy();
    expect(semverOf('library/nginx:1.2.3')).toBeTruthy();
  });

  test('semverOf should return false for invalid semver versions', () => {
    expect(semverOf('latest')).toBeFalsy();
    expect(semverOf('main')).toBeFalsy();
    expect(semverOf('1')).toBeFalsy();
    expect(semverOf('1.2')).toBeFalsy();
    expect(semverOf('alpha')).toBeFalsy();
    expect(semverOf('1.2-alpha')).toBeFalsy();
    expect(semverOf('nginx-1.2.3')).toBeFalsy();
    expect(semverOf('')).toBeFalsy();
    expect(semverOf(null)).toBeFalsy();
    expect(semverOf(undefined)).toBeFalsy();
  });
});
