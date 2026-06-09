/**
 * SemverCompare - Semantic version comparison utility
 *
 * Simple semver parsing and comparison without external dependencies.
 * Strips prerelease suffixes after `-` before comparing.
 * Returns positive if a > b, negative if a < b, 0 if equal.
 */

/**
 * Compare two semantic version strings.
 *
 * Parses version strings into [major, minor, patch] segments,
 * stripping any prerelease suffix after `-`.
 * Missing segments default to 0 (e.g., "1.2" becomes [1, 2, 0]).
 *
 * @param a - First version string
 * @param b - Second version string
 * @returns Positive if a > b, negative if a < b, 0 if equal
 */
export function compareSemver(a: string, b: string): number {
  const parseVersion = (v: string): [number, number, number] => {
    // Strip prerelease suffix
    const clean = v.split("-")[0];
    const parts = clean.split(".").map((p) => {
      const n = parseInt(p, 10);
      return isNaN(n) ? 0 : n;
    });
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  };

  const [aMajor, aMinor, aPatch] = parseVersion(a);
  const [bMajor, bMinor, bPatch] = parseVersion(b);

  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

/**
 * Check if an update is available by comparing installed vs latest version.
 *
 * @param installedVersion - The currently installed version
 * @param latestVersion - The latest available version
 * @returns true if latestVersion is newer than installedVersion
 */
export function hasUpdate(installedVersion: string, latestVersion: string): boolean {
  return compareSemver(latestVersion, installedVersion) > 0;
}
