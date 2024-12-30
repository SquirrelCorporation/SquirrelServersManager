# Containers: Docker

## Overview
Once you add a device in SSM, it will automatically retrieve the containers, images, networks, and volumes present on that device. SSM listens to container events in real time and updates its database accordingly.

Periodically (at the start of every hour by default), SSM performs a full scan to compare the current state of the device with its database.

---

## Basic
![Docker Device Configuration](/device-configuration/docker/docker-1.png)

By default, SSM attempts to connect to the device's Docker socket to fetch container, image, network, and volume information using the credentials configured in the SSH tab.  
If the Docker socket requires additional or alternative authentication credentials, refer to the [Advanced section](#advanced).

### Enable/Disable Capability
Toggle this setting to enable or disable the retrieval of Docker elements.

---

### Watch
| **Parameter**             | **Required**   | **Description**                                                                                |
|---------------------------|:--------------:|-----------------------------------------------------------------------------------------------|
| **Watch Containers**       | :red_circle:   | Enable or disable the polling of Docker containers and other related elements (volumes, networks, etc.). |
| **Watch Containers Stats** | :red_circle:   | Enable or disable the polling of container statistics, such as CPU and memory usage.           |
| **Watch Containers Events**| :red_circle:   | Enable or disable real-time listening for container events such as `start`, `stop`, etc.       |

---

### Docker Engine Host
| **Parameter**    | **Required**   | **Description**                                         |
|------------------|:--------------:|---------------------------------------------------------|
| **Device IP**    | :red_circle:   | The IPv4 address of the device. This is a read-only field and matches the value from the SSH settings. |
| **Docker Sock**  | :red_circle:   | The Docker socket's local path. Switch to "Advanced" to edit this value.               |

---

### Watcher Crons
| **Parameter**              | **Required**   | **Description**                                                                 |
|----------------------------|:--------------:|---------------------------------------------------------------------------------|
| **Watch Containers**       | :red_circle:   | The polling frequency for Docker elements on the device.                        |
| **Watch Containers Stats** | :red_circle:   | The polling frequency for container statistics, such as CPU and memory usage.   |

:::warning
The **Watch Containers** feature queries the Docker registry to check for available updates.  
The Docker registry is [rate limited](https://docs.docker.com/docker-hub/download-rate-limit/).  
If you manage multiple devices, avoid setting this value too low to prevent exceeding rate limits.
:::

---

## Advanced
Advanced connection options can be accessed by clicking the switch labeled "Show Advanced" at the bottom right corner.

These options allow you to:
1. Configure different authentication credentials for Docker.
2. Access advanced connection settings for greater customization.

![Advanced Docker Configuration](/device-configuration/device-configuration-5.png)

For further details, see the [Technical Guide: Docker > SSH/Connection](/docs/technical-guide/docker-connection).