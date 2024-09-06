# Add an unmanaged device (agentless device)

:::warning ⚠️ Unmanaged devices
Unmanaged devices are not the preferred way of using SSM. You will not receive any statistics, system information, or downtime events for these devices.
:::

## 1. Adding an unmanaged device
To add a new device, first navigate to the **Inventory** panel in the Configuration Section on the left menu.
Click on the three dots next to "Install Agent on New Device" and select **"Register an unmanaged device (without agent)"**.

![addunmanaged1](/add-unmanaged-1.png)

## 2. Adding a device: SSH connection screen
A modal will open. The first section contains the SSH connection information.

![addunmanaged2](/add-unmanaged-2.png)

Enter the SSH port, IP address, and select the SSH login type (User/password or key-based).
Click on **"Submit"**, and an unmanaged device will appear in the **Inventory list**.

![addunmanaged3](/add-unmanaged-3.png)
