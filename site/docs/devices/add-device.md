# Adding a device

## 🌰 In a Nutshell

:::info Sum-up
1. **Navigate to Inventory**: Add a new device.
2. **Enter SSH Info**: Port, IP, sudo method, login type.
3. **Run Connection Tests**: Ansible and Docker checks.
4. **Select Installation Method**: Agentless or not.
5. **Confirm Details**: Click "Confirm".
:::

## 1. Inventory
To add a new device, first navigate to the Inventory panel in the Configuration Section on the lefthand Sidebar menu and click "Install Agent on New Device".
![adddevice1](/add-device/add-device-1.png)

## 2. Adding a device: SSH connection screen
A modal will open. The first section contains the SSH connection information.
![adddevice2](/add-device/add-device-2.png)
- Enter the SSH port and IP address
- Specify the sudo method and, optionally, the associated user/password
- Select the SSH login type (User/password or key-based)

## 3. Connection tests
![adddevice4](/add-device/add-device-6.png)
Ansible and Docker connections will automatically be initiated to test your previous inputs. Wait for the results and address any issues that may arise.
If you need to use a different authentication method for Docker, you can later specify it in the Docker configuration (see [Device Configuration](/docs/devices/configuration/)).

## 4. Installation Method
![adddevice4](/add-device/add-device-7.png)
| Method                                    | Description                                                                                                                            | Will install if needed        |
|-------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------:|------------------------------|
| AgentLess - Default                     | The default method, SSM will gather all information through SSH                                                    | /      |
| Node Agent (Deprecated)                      | Deprecated method, it will install directly on the host a PM2 backed Node.js agent                                                    | `NodeJS (NVM)`, `NPM`, `PM2`        |
| Node Agent - Enhanced Playbook (Deprecated) | Deprecated method, it will install directly on the host a PM2 backed Node.js agent with an advanced playbook for various configurations and OS. Try this if you have difficulties with the first one | `NodeJS (NVM)`, `NPM`, `PM2`        |            
| Dockerized Agent (Deprecated)           | Deprecated, a Dockerized version of the agent. As far as tests go, it works very well. Use only on Linux hosts (macOS not supported) | `Docker`, `Docker Compose`        |

## 6. Adding a device: Confirmation screen
![adddevice4](/add-device/add-device-4.png)
Verify that all information is correct and click on **"Confirm"**.

