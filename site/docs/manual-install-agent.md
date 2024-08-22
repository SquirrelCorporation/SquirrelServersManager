# Manually Installing the Agent

If you have difficulties installing the agent within the UI, you can install it manually on the device.

:::info ℹ️ Requirements
[Please read the stack requirements before installing the agent](/docs/requirements)
:::

### Method 1: Installing the agent with the provided shell script
```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
cd ./SquirrelServersManager-Agent
```
Replace MASTER_NODE_URL below with the URL to your SSM install:
```shell
./install.sh -a -u MASTER_NODE_URL
```
Please note that this method will **create** a device in SSM.
If the device has already been added or a device with the same IP already exists, the agent will fail to start.
If the device already exists in SSM, use:
```shell
./install.sh -a -u MASTER_NODE_URL -s DEVICE_ID
```
and replace DEVICE_ID with the UUID of the device in SSM (In Inventory, click on the IP and copy the UUID shown in the right drawer)

### Method 2: Building & Installing the agent manually

```shell
git clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
cd ./SquirrelServersManager-Agent
```

```shell
vim .env
```
Edit the **API_URL_MASTER** value with the URL of SSM

```shell
npm install
npm build
```

Please note that this method will **create** a device in SSM.
If the device has already been added or a device with the same IP already exists, the agent will fail to start.
If the device already exists in SSM, create a hostid.txt file containing the UUID of the device in SSM.

You can now start the agent manually:
```shell
node ./build/agent.js
```
However, you will need some kind of service scheduler so the agent is watchdogged and started at startup.
We recommend using [PM2](https://pm2.keymetrics.io/):
```shell
pm2 start -f ./build/agent.js
pm2 startup
pm2 save
```
