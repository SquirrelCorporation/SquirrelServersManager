/**
 * Represents the metadata for a single plugin available in a repository.
 */
export interface PluginInfo {
  id: string; // Unique plugin ID (kebab-case)
  name: string; // Human-readable name
  version: string; // SemVer version
  description: string; // Short description
  author?: string; // Optional: Author name
  iconUrl?: string; // Optional: FULL URL to the plugin's icon (SVG preferred)
  packageUrl: string; // REQUIRED: FULL URL to the downloadable .tar.gz archive
  manifestUrl?: string; // Optional: FULL URL to the raw manifest.json
  checksumUrl?: string; // Optional: FULL URL to a file containing the SHA256 checksum
  checksum?: string; // Optional: Direct SHA256 checksum string
}
