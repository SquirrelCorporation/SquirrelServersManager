<script setup>
// @intellij-keep
import Diagram from './../components/Diagram.vue';
</script>

# Overview

Squirrel Servers Manager (SSM) is a versatile backend and frontend solution for configuration and Docker management. It’s designed to be **simple** to use while offering comprehensive customization options.

No agents required — just SSH!

[Jump to Quick Start](/docs/quickstart)

## <span style="display: flex; align-items: center;"><img src="/overview/magic.svg" alt="tldr" style="margin-right: 8px;" /> Automagic</span>

Once a device is added, SSM will automagically:
- Detect downtimes
- Retrieve hardware key usage and software versions
- Pull running containers and Docker elements
- Detect container image updates
- Allow you to deploy & manage containers on your devices
- Allow you to run playbooks for configuration management

## <span style="display: flex; align-items: center;"><img src="/overview/reference-architecture.svg" alt="tldr" style="margin-right: 8px;" /> Schematic Overview</span>

<Diagram/>

## <span style="display: flex; align-items: center;"><img src="/overview/device-database-encryption-1-solid.svg" alt="tldr" style="margin-right: 8px;" />SSH based</span>

- Connections from SSM 🐿️ to your devices 🌰🌰🌰 run through `SSH`.
- Credentials are encrypted using Ansible Vault.
