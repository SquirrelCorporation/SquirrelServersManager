# Device configuration

Accessible from the Inventory page, the configuration modal allow to to setup the ansible ssh access and docker ssh access and settings

## Opening the configuration modal
From the inventory page, click on configuration for device the you wish to edit

![deviceconf1](/device-configuration/device-configuration-1.png)

## Ansible SSH settings tab
This tab allows you to edit the SSH settings Ansible uses to connect to your device

![deviceconf2](/device-configuration/device-configuration-2.png)

## Docker SSH settings tab
This tab allows you to edit the SSH settings Docker uses to connect to your device.
You can also enable or disable the cron watchers (statistics, container updates, real time container events) and setup the cron frequencies

![deviceconf3](/device-configuration/device-configuration-3.png)

## Docker SSH settings tab - Advanced
You can show advanced connection option by clicking on the switch on the bottom right 'Show Advanced'.

Advanced options will allow you to setup a different authentication for Dockers, and will offer you advanced options for the connection

![deviceconf5](/device-configuration/device-configuration-5.png)


## Connection test tab
This tab allows you to test the connection for Ansible and Docker integrations

![deviceconf4](/device-configuration/device-configuration-4.png)
