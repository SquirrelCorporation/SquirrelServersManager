# Adding a device

## 1. Inventory
To add a new device, you must first go to the inventory panel of the Configuration Section on the left menu
![adddevice1](/add-device-1.png)

## 2. Adding a device: SSH connection screen
A modal will open. The first section is the SSH connection information
![adddevice2](/add-device-2.png)
Enter the SSH port, IP and select the SSH login type (User/password or key based)

## 3. Adding a device: Master Node URL screen
This section is automatically filled. You must ensure that the master node URL is correct and is reachable from the device you wish to add
![adddevice3](/add-device-3.png)
This URL will be shipped with the agent during install.

On the next screen, SSM will try to ping itself through this URL. 

## 4. Adding a device: Confirmation screen
![adddevice4](/add-device-4.png)
Check that all the information are correct and click on **"Confirm & Install agent"**

## 5. Behold! The magic of SSM
![adddevice5](/add-device-5.png)
Follow the progress of Ansible installing the agent on your device

:::warning ⚠️ Agent installation failed
Please be advised that **regardless** of the result of playbook's execution, **the device has already been saved in the SSM database.**

If the playbook result's execution **failed**, you must try to reinstall the agent by passing to **"Inventory"**, choose your device, and to the right click on the bottom caret **"▽"** and click on **"Reinstall Agent"** 
:::
