# Troubleshooting

### Agent installation failed
If SSM is unable to install the agent through Ansible, you should consider a manual installation of the agent.
See [Manual install](/docs/manual-install-agent)

### SSM does not retrieve services (Docker containers)
In some cases, SSM may not be able to retrieve the Docker containers from the host.
1. Check that the Docker CLI is available with the SSH user you provided. See the [Official Docker Linux Post-Install](https://docs.docker.com/engine/install/linux-postinstall/) guide.
2. Verify that the Docker socket path is correct.

If the problem persists, try using another authentication method.

### SSM shows "socket hangup" in Docker module logs
This warning/error is most likely coming from your host Docker installation. Refer to the previous point for potential solutions.