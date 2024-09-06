<script setup>
</script>

# Overview

Squirrel Servers Manager (SSM) is a backend and front-end software focused on configuration and Docker management.

Its goal is to be **simple** to use, yet offer some depth of customization.

[Jump to Quick Start](/docs/quickstart)

## SSH
- Connections from SSM 🐿️ to your devices 🌰🌰🌰 run through `SSH`
- Credentials are encrypted using Ansible Vault

## Agent (Recommended)
SSM is agent-based, meaning to get the full power of it, you must install (from the UI or manually) a NodeJS-based [agent](https://github.com/SquirrelCorporation/SquirrelServersManager-Agent)
on all your devices.
:::warning Note
The SSM agent is not mandatory; you can manually add devices without the agent (see [Unmanaged Devices](/docs/devices/add-unamanaged))
:::

## Schematic Overview
<Diagram/>

