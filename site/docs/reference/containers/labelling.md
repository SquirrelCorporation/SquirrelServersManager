---
layout: FeatureGuideLayout
title: "Container Labelling Guide"
icon: "🏷️"
time: 7 min read
signetColor: '#23233e' # Reference color
nextStep:
  icon: "🐳"
  title: "Docker Connection Configuration"
  description: "Learn how SSM connects to Docker daemons."
  link: "/docs/reference/docker/connection"
credits: true
---

:::tip In a Nutshell (🌰)
- SSM uses a label-based system to manage container monitoring and display
- Labels prefixed with `wud.` (watch updates daemon) control monitoring behavior
- Tags can be filtered using regex patterns via include/exclude labels
- Custom display names and icons can be assigned with labels
- Image update detection uses tag filtering and pattern matching
:::

## Labelling Overview

Squirrel Servers Manager (SSM) uses Docker container labels to control how containers are monitored, displayed, and updated. This label-based approach provides a flexible, non-intrusive way to customize SSM's behavior for each container without requiring changes to the application.

<MentalModelDiagram 
  title="Container Labelling System" 
  imagePath="/images/diagrams-container-labelling.svg" 
  altText="Container Labelling Diagram" 
  caption="Figure 1: Container Labelling System in SSM" 
/>

Labels are key-value pairs attached to Docker containers that can be read and interpreted by SSM to determine:
- Which containers should be monitored for updates
- How to filter and interpret version tags for update checks
- How the container should be displayed in the UI (name, icon)
- How to detect and report available updates

## Label Namespace

All SSM-specific labels currently use the `wud.` prefix (inherited from "watch updates daemon" concepts), which groups related labels and avoids conflicts with other applications that might use Docker labels.

## Core Labels

The following labels form the core of SSM's container labelling system for update checking and display:

### Monitoring Control Labels

| Label | Type | Description | Default |
|-------|------|-------------|---------|
| `wud.watch` | Boolean (`true`/`false`) | Controls whether SSM monitors this container for image updates. | `false` unless overridden by device default setting. |
| `wud.watch.digest` | Boolean (`true`/`false`) | Monitors image digest changes even if the tag is the same (useful for mutable tags like `latest`). | `false` for semver tags, `true` for non-semver tags. |

### Tag Filtering Labels

| Label | Type | Description | Example |
|-------|------|-------------|---------|
| `wud.tag.include` | Regex (JavaScript) | Regex pattern for tags to **include** when checking for updates. Only matching tags are considered. | `^v[0-9]+\\.[0-9]+$` (matches `v1.2`, `v10.5`, etc.) |
| `wud.tag.exclude` | Regex (JavaScript) | Regex pattern for tags to **exclude**. Matching tags are ignored. | `alpha\|beta\|rc` (ignores alpha, beta, rc tags) |
| `wud.tag.transform` | Regex Transformation | Transformation(s) applied to tags before comparison (e.g., remove prefixes). Format: `s/pattern/replacement/` (can be chained with `|`). | `s/^v//` (removes leading `v`) |

### Display Labels

| Label | Type | Description | Example |
|-------|------|-------------|---------|
| `wud.display.name` | String | Custom name for the container shown in SSM UI/notifications. | `"My Web App"` |
| `wud.display.icon` | String | Custom icon name (MDI, FontAwesome, Simple Icons) or emoji. | `"mdi:web"`, `"🌐"` |

### Link Generation Label

| Label | Type | Description | Example |
|-------|------|-------------|---------|
| `wud.link.template` | String Template | URL template for linking to image documentation/registry page. | `"https://hub.docker.com/_/${repo}/tags?name=${tag}"` |

**Template Variables for `wud.link.template`:**
- `${repo}`: Image repository (e.g., `nginx`, `linuxserver/plex`)
- `${tag}`: The specific tag being linked (e.g., `1.21`, `latest`)
- `${raw}`: Same as `${tag}`
- `${major}`, `${minor}`, `${patch}`: Major/minor/patch semver components (if applicable)
- `${prerelease}`: Prerelease identifiers (e.g., `beta.1`, `rc.2`) (if applicable)

## Label Implementation Notes

- **Monitoring (`wud.watch`)**: If not set, monitoring depends on the `watchByDefault` setting at the device level.
- **Digest Watching (`wud.watch.digest`)**: Defaults to `true` for non-semver tags (like `latest`) because their content can change without the tag changing. Defaults to `false` for semver tags (like `1.2.3`) unless explicitly overridden.
- **Tag Filtering**: `include` is applied first, then `exclude`.
- **Transformations**: Useful for standardizing tags before comparison (e.g., `v1.0` vs `1.0`).

## Use Cases and Examples (`docker-compose.yml`)

### Basic Monitoring

```yaml
services:
  webapp:
    image: myapp:latest
    labels:
      - "wud.watch=true"
```

### Stable Semver Tracking

```yaml
services:
  database:
    image: postgres:14.5
    labels:
      - "wud.watch=true"
      - "wud.tag.include=^\\d+\\.\\d+\\.\\d+$" # Only track X.Y.Z
      - "wud.tag.exclude=alpha|beta|rc" # Ignore pre-releases
```

### Custom Display & Link

```yaml
services:
  blog:
    image: ghost:4.48
    labels:
      - "wud.watch=true"
      - "wud.display.name=Company Blog (Ghost)"
      - "wud.display.icon=simple-icons:ghost"
      - "wud.link.template=https://hub.docker.com/_/ghost?tab=tags&name=${tag}"
```

### Removing 'v' Prefix

```yaml
services:
  utility:
    image: some/util:v2.1.0
    labels:
      - "wud.watch=true"
      - "wud.tag.transform=s/^v//" # Compare as 2.1.0
``` 