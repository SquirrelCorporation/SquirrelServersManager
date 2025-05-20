---
layout: FeatureGuideLayout
title: "Built-in Ansible Playbooks"
icon: "📚"
time: "8 min read"
signetColor: '#23233e' # Reference color
nextStep:
  icon: "➡️"
  title: "Variable Management"
  description: "Understand how variables are handled in Ansible playbooks."
  link: "/docs/reference/ansible/variable-management"
credits: true
---
Squirrel Servers Manager (SSM) bundles several Ansible playbook collections to help automate common server management tasks right out of the box. These playbooks are typically stored within the SSM installation and referenced internally.

:::tip In a Nutshell (🌰)
- SSM includes pre-packaged Ansible playbooks for common tasks.
- Playbooks are organized into Core System and Advanced collections.
- Use these playbooks for device health checks, updates, installations, and more.
:::



## Core System Playbooks

These are essential playbooks used for basic device management and core SSM agent operations.

| Playbook Name | Internal Path/Identifier | Description |
|---------------|----------------------------|-------------|
| Device Health Check | `00000000-0000-0000-0000-000000000000/device/_ping.yml` | Performs a basic connectivity test (`ansible -m ping`) to verify the device is reachable and Ansible can execute commands. |
| System Updates | `00000000-0000-0000-0000-000000000000/device/_upgrade.yml` | Attempts to update system packages using the appropriate package manager (e.g., `apt`, `yum`). |
| Device Reboot | `00000000-0000-0000-0000-000000000000/device/_reboot.yml` | Safely reboots the target device. |
| Agent Installation | `00000000-0000-0000-0000-000000000000/agent/_installAgent.yml` | Handles the installation of the (now deprecated) SSM Node.js agent. Triggered when agent-based installation methods are selected. |

## Advanced Playbooks

These playbooks handle more specific tasks, often related to installing software or configuring services.

| Playbook Name | Internal Path/Identifier | Description |
|---------------|----------------------------|-------------|
| Docker Installation | `00000000-0000-0000-0000-000000000001/installers/install-docker.yml` | Installs Docker Engine on the target device if it's not already present. |
| Proxmox Setup | `00000000-0000-0000-0000-000000000001/installers/install-proxmox.yml` | Configures a Proxmox host for integration with SSM (details may vary based on implementation). |
| Security Hardening (iptables) | `00000000-0000-0000-0000-000000000001/security/secure-with-iptables.yml` | Applies basic security hardening rules using `iptables`. Use with caution and understand the rules being applied. |
| NAS Updaters | `00000000-0000-0000-0000-000000000001/nas-updaters/` | (Directory) Likely contains playbooks related to updating specific NAS software or configurations. The exact playbooks might need further inspection. |

**Note**: The internal paths (like `00000000-0000-0000-0000-000000000000/...`) are illustrative identifiers used within SSM's playbook management system and may not correspond directly to user-visible filesystem paths.

You can typically execute these playbooks through the SSM interface (e.g., via quick actions, stack deployments, or automation tasks). 