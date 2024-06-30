# Manually installing the agent

If you have difficulties installing the agent with UI, you can install it manually on the device

:::info ℹ️ Requirements
[Please read the stack requirements before installing the agent](/docs/requirements)
:::

### Method 1: Installing the agent with the provided shell script
```shell
playbooks-repository clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
cd ./SquirrelServersManager-Agent
```
Replace below MASTER_NODE_URL by the URL to SSM
```shell
./install.sh -a -u MASTER_NODE_URL
```
Please note that this method will **create** a device in SSM.
If the device has already been added or a device with the same IP already exists, the agent will fail to start.
If the device already exists in SSM, use 
```shell
./install.sh -a -u MASTER_NODE_URL -s DEVICE_ID
```
and replace DEVICE_ID by the uuid of the device in SSM (Inventory, click on the IP and copy the UUID showed in the right drawer)


### Method 2: Building & Installing the agent manually

```shell
playbooks-repository clone https://github.com/SquirrelCorporation/SquirrelServersManager-Agent
cd ./SquirrelServersManager-Agent
```

```shell
vim .env
```
Edit the **API_URL_MASTER** value by the URL of SSM

```shell
npm install
npm build
```

Please note that this method will **create** a device in SSM.
If the device has already been added or a device with the same IP already exists, the agent will fail to start.
If the device already exists in SSM, create a hostid.txt file containing the UUID of the device in SSM.

You can start manually the agent from now one
```shell
node ./build/agent.js
```
However, you will need some kind of services scheduler so the agent is watchdoged and started at startup.
We recommend using [PM2](https://pm2.keymetrics.io/)
```shell
pm2 start -f ./build/agent.js
pm2 startup
pm2 save
```




