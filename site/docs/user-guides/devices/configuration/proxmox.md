---
layout: FeatureGuideLayout
title: Promox Configuration
icon: "䷌"
time: 5 min read
feedbackSupport: true
signetColor: '#27ae60'
---


## Overview
Once you add a device in SSM, you can enable Proxmox container retrieval by activating the Proxmox capability. SSM will monitor the running containers on the device at a defined frequency using the Proxmox API.

For more information about the Proxmox API, see the [official documentation](https://pve.proxmox.com/wiki/Proxmox_VE_API).

![device-configuration-proxmox-proxmox-1.png](/images/device-configuration-proxmox-proxmox-1.png)

## Configuration
| **Parameter**                          | **Required**   | **Description**                                                                                          |
|----------------------------------------|:--------------:|----------------------------------------------------------------------------------------------------------|
| **Remote Connection Method**           | :red_circle:   | Defines the method SSM will use to **connect** to the Proxmox API. Options are: `SSH` (tunnel) or direct `HTTP`. |
| **Proxmox API Port**                   | :red_circle:   | The **port** for the Proxmox API on the device. The default is `8006`.                                   |
| **Proxmox API Connection Method**      | :red_circle:   | Specifies the authentication method. Supported options are: `User/Password` or `Tokens`.                |
| **Authorize Self-Signed Certificates** | :white_circle: | Disables SSL certificate validation. In most cases, activating this option is necessary.                 |

## Watcher Crons
| **Parameter**          | **Required**   | **Description**                                                    |
|------------------------|:--------------:|--------------------------------------------------------------------|
| **Watcher Containers** | :red_circle:   | Defines the **polling frequency** for Proxmox container information on the device. | 