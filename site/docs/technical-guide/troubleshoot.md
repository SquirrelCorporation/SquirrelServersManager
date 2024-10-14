# Troubleshooting

## Troubleshoot SSM Installation
### :black_circle: MongoDB / AVX support
Recent versions of MongoDB require a CPU with AVX support. If your host CPU doesn't support AVX, try editing the `docker-compose.yml` file and downgrade the image version to the latest known version that doesn't require AVX.
```dockerfile
...
  mongo:
    container_name: mongo-ssm
    image: mongo
    restart: unless-stopped
    volumes:
      - ./.data.prod/db:/data/db
    command: --quiet
... 
```
to => 
```dockerfile
...
  mongo:
    container_name: mongo-ssm
    image: mongo:4.2.22
    restart: unless-stopped
    volumes:
      - ./.data.prod/db:/data/db
    command: --quiet
...
```
---

### :black_circle: Unable to Create or Setup an Admin Account / "JwtStrategy requires a secret or key"
The `.env` file of the `docker-compose.yml` is not set correctly.
See [Quick Start](/docs/quickstart).


##  Troubleshoot Agent Installation
### :yellow_circle: Agent Installation Failed
If SSM is unable to install the agent through Ansible, consider:
- Using an alternative installation method. See [Adding a device](/docs/devices/add-device#_4-installation-method).
- Installing the agent manually. See [Manual Install](/docs/technical-guide/manual-install-agent).

--- 

### :yellow_circle: Ansible Is Stuck Indefinitely When Applying a Playbook on Turnkey / LXC Container
Try changing the connection method in the device configuration modal from `paramiko` to `ssh`.
![connection-method](/technical-guide/troubleshoot/connection-method.png)

## Troubleshoot Container/Docker Issues 
### :purple_circle: SSM Does Not Retrieve Services (Docker Containers)
In some cases, SSM may not be able to retrieve Docker containers from the host.
1. Check that the Docker CLI is available for the SSH user you provided. See the [Official Docker Linux Post-Install](https://docs.docker.com/engine/install/linux-postinstall/) guide.
2. Verify that the Docker socket path is correct.

If the problem persists, try using another authentication method.

---

### :purple_circle: SSM Shows "Socket Hangup" in Docker Module Logs
This warning/error is most likely coming from your host's Docker installation. Refer to the [previous point](#ssm-does-not-retrieve-services-docker-containers) for potential solutions.

## Troubleshoot Devices Issues

### :brown_circle: The Device's IP Has Automatically Changed to Its LAN IP / The IP Changed to VLAN's One
To permanently fix the IP on a device:
In the `.env` file of the **agent**, add the variable
`OVERRIDE_IP_DETECTION=<your_ip>` and restart the agent.
See [Manual Install](/docs/technical-guide/manual-install-agent).

## Misc

### :white_circle: Windows Support
Windows is not supported (yet)
