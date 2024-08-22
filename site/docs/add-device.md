# Adding a device

## 1. Inventory
To add a new device, first navigate to the Inventory panel in the Configuration Section on the lefthand Sidebar menu and click "Install Agent on New Device".
![adddevice1](/add-device/add-device-1.png)

## 2. Adding a device: SSH connection screen
A modal will open. The first section contains the SSH connection information.
![adddevice2](/add-device/add-device-2.png)
- Enter the SSH port and IP address
- Specify the sudo method and, optionally, the associated user/password
- Select the SSH login type (User/password or key-based)

## 3. Adding a device: Master Node URL screen
This section is automatically populated. Ensure that the master node URL is correct and reachable from the device you wish to add.
![adddevice3](/add-device/add-device-3.png)
This URL will be included with the agent during installation. Make sure it aligns with the SSM IP Address.
In the next step, SSM will attempt to ping itself through this URL.

## 4. Connection tests
![adddevice4](/add-device/add-device-6.png)
Ansible and Docker connections will automatically be initiated to test your previous inputs. Wait for the results and address any issues that may arise.
If you need to use a different authentication method for Docker, you can later specify it in the Docker configuration (see [Device Configuration](/docs/device-configuration)).

## 5. Adding a device: Confirmation screen
![adddevice4](/add-device/add-device-4.png)
Verify that all information is correct and click on **"Confirm & Install agent"**.

## 6. Behold! The magic of SSM
![adddevice5](/add-device/add-device-5.png)
Monitor the progress of Ansible installing the agent on your device.

:::warning ⚠️ Agent installation failed
Please note that **regardless** of the playbook's execution result, **the device has already been saved in the SSM database**.
If the playbook's execution **fails**, you must attempt to reinstall the agent by going to **"Inventory"**, selecting your device, clicking on the bottom caret **"▽"** to the right, and then clicking on **"Reinstall Agent"**.
:::
