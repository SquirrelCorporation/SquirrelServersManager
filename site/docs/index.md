<script setup>
// @intellij-keep
import Diagram from './../components/Diagram.vue';
</script>

# Overview

Squirrel Servers Manager (SSM) is backend and front-end software focused on configuration and Docker management. Its goal is to be **simple** to use, yet offer depth of customization.

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

## <span style="display: flex; align-items: center;"><img src="/overview/hat.svg" alt="tldr" style="margin-right: 8px;" /> Agent (Recommended)</span>

SSM is agent-based. To harness its full power, you must install a Node.js-based [agent](https://github.com/SquirrelCorporation/SquirrelServersManager-Agent) on all your devices, either via the UI or manually.

:::warning Note
The SSM agent is not mandatory; you can manually add devices without the agent (see [Unmanaged Devices](/docs/devices/add-unamanaged)).
:::

**The agent allows**:
- System information retrieval (OS & package versions; hardware details)
- Statistics gathering (CPU, memory usage)
- Downtime detection
- IP address update
