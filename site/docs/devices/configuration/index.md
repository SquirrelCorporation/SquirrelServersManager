# Device Configuration

Accessible from the Inventory page, the configuration modal allows you to set up the Ansible SSH access and Docker SSH access and settings.

## Opening the configuration modal
From the inventory page, click on "Configuration" for the device you wish to edit.

![deviceconf1](/device-configuration/device-configuration-1.png)

## SSH tab
This tab allows you to edit the SSH settings Ansible uses to connect to your device.

![deviceconf2](/device-configuration/device-configuration-2.png)

→ See [SSH](/docs/devices/configuration/ssh.md) for more information.

## Containers tab
This tab allows you to edit the SSH settings Docker uses to connect to your device.
You can also enable or disable the cron watchers (statistics, container updates, real-time container events) and set up the cron frequencies.

![deviceconf3](/device-configuration/device-configuration-3.png)

→ See [Containers: Docker](/docs/devices/configuration/docker.md) for more information.

→ See [Containers: Proxmox](/docs/devices/configuration/proxmox.md) for more information.


## Diagnostic tab
This tab allows you to test the connection for Ansible and Docker integrations.

![deviceconf4](/device-configuration/device-configuration-4.png)

→ See [Diagnostic](/docs/devices/configuration/diagnostic.md) for more information.
