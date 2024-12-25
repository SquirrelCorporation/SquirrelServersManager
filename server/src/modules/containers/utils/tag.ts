import semver, { SemVer } from 'semver';
import logger from '../../../logger';

/**
 * Parse a string to a semver (return null is it cannot be parsed as a valid semver).
 * @param rawVersion
 * @returns {*|SemVer}
 */
function parseSemver(rawVersion: string): SemVer | null {
  const rawVersionCleaned = semver.clean(rawVersion, { loose: true });
  const rawVersionSemver = semver.parse(
    rawVersionCleaned !== null ? rawVersionCleaned : rawVersion,
  );
  // Hurrah!
  if (rawVersionSemver !== null) {
    return rawVersionSemver;
  }

  // Last chance; try to coerce (all data behind patch digit will be lost).
  return semver.coerce(rawVersion);
}

/**
 * Return true if version1 is semver greater than version2.
 * @param version1
 * @param version2
 */
function isGreaterSemver(version1: string, version2: string) {
  const version1Semver = parseSemver(version1);
  const version2Semver = parseSemver(version2);

  // No comparison possible
  if (version1Semver === null || version2Semver === null) {
    return false;
  }
  return semver.gte(version1Semver, version2Semver);
}

/**
 * Diff between 2 semver versions.
 * @param version1
 * @param version2
 * @returns {*|string|null}
 */
function diff(version1: string, version2: string) {
  const version1Semver = parseSemver(version1);
  const version2Semver = parseSemver(version2);

  // No diff possible
  if (version1Semver === null || version2Semver === null) {
    return null;
  }
  return semver.diff(version1Semver, version2Semver);
}

/**
 * Transform a tag using a formula.
 * @param transformFormula
 * @param originalTag
 * @return {*}
 */
function transformTag(transformFormula: string | undefined, originalTag: string) {
  // No formula ? return original tag value
  if (!transformFormula || transformFormula === '') {
    return originalTag;
  }
  try {
    const transformFormulaSplit = transformFormula.split(/\s*=>\s*/);
    const transformRegex = new RegExp(transformFormulaSplit[0]);
    const placeholders = transformFormulaSplit[1].match(/\$\d+/g);
    const originalTagMatches = originalTag.match(transformRegex) || [];

    let transformedTag = transformFormulaSplit[1];
    placeholders?.forEach((placeholder) => {
      const placeholderIndex = Number.parseInt(placeholder.substring(1), 10);
      transformedTag = transformedTag.replace(
        new RegExp(placeholder.replace('$', '\\$'), 'g'),
        originalTagMatches[placeholderIndex],
      );
    });
    return transformedTag;
  } catch (e) {
    // Upon error; log & fallback to original tag value
    logger.warn(
      `Error when applying transform function [${transformFormula}]to tag [${originalTag}]`,
    );
    logger.debug(e);
    return originalTag;
  }
}

export default {
  parseSemver,
  isGreaterSemver,
  diff,
  transformTag,
};
