# Docker / Containers Management

## Overview
Once you have added a device in SSM, it should automatically retrieve the containers, images, networks, and volumes on this device. SSM will listen in real-time to container events and update its database accordingly.

Periodically (at the start of every hour by default), SSM will perform a full scan to compare the current state of the device with its database.

## Container Updates
**Container Updates** revolve around managing and comparing semantic versioning (semver) strings. Semantic versioning is a versioning scheme where version numbers follow the format `MAJOR.MINOR.PATCH`.

SSM is designed to handle these version strings, ensuring they can be parsed correctly, compared, and differences between versions can be determined.

- **Fallback Mechanism**: If the standard parsing fails, SSM attempts a more lenient conversion (known as coercion), which tries to produce a valid semver by ignoring extraneous details beyond the PATCH segment.

### Registries
:::warning Private Registries
Please note that SSM will **only** retrieve container updates from **public repositories** by default. If your containers are from private repositories, you must set up private access. See [Configuring a Registry](/docs/settings/registry.md) for more information.
::: 
