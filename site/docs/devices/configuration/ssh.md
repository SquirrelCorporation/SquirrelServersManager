# SSH Configuration

## Basic
SSM will use SSH connection to connect to your device. You must provide valid authentication information in order to manage your device.

![Device Configuration](/device-configuration/device-configuration-2.png)

### Host
| Parameter     | Required       | Description                                                                             |
|---------------|:--------------:|-----------------------------------------------------------------------------------------|
| **Device IP** | :red_circle:   | The IPv4 address of the device. Combined with `SSH Port`, it must be accessible from the SSM instance. |
| **SSH Port**  | :red_circle:   | The SSH port of the agent running on the device. The default is `22`.                   |

### Super User
| Parameter        | Required       | Description                                                                                                                             |
|------------------|:--------------:|-----------------------------------------------------------------------------------------------------------------------------------------|
| **Sudo Method**  | :red_circle:   | The method used to elevate SSM privileges in specific cases, such as with Ansible `Become`, accessing the Docker socket if necessary, etc. In most cases, this should be `sudo`. |
| **Sudo User**    | :white_circle: | The sudo user, if applicable.                                                                                                           |
| **Sudo Password**| :white_circle: | The password for the sudo user, if applicable.                                                                                         |

### Authentication
| Parameter               | Required       | Description                                                                                                                                                                              |
|-------------------------|:--------------:|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **SSH Connection Type** | :red_circle:   | The type of SSH credentials used to connect to the host. Possible values are: `User/Password`, `Keys`, or `Passwordless`. For more details, refer to the [Technical Guide: SSH Connection](/docs/technical-guide/ssh). |

## Diagnose your connection
See [Diagnostic](/docs/devices/configuration/diagnostic.md)

## Advanced
![Advanced Configuration](/device-configuration/ssh/advanced-1.png)

For further details, see [Technical Guide: Ansible > SSH/Connection](/docs/technical-guide/ansible-connection).