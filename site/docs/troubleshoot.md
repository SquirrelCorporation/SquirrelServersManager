### Agent installation failed
If SSM is not able to install through Ansible the agent, you should consider a manual installation of the agent
See [Manual install](/docs/manual-install-agent)

### SSM does not retrieve services (Docker containers)
In some cases, SSM will not be able to retrieve the docker containers from the host.
1. Check that the Docker CLI is available with the SSH user you provided. [~Official Docker Linux Post Install](https://docs.docker.com/engine/install/linux-postinstall/)
2. Check that the Docker path sock is right

If the problem remained, use the another authentication method.

### SSM show "socket hangup" in Docker module logs
This warning/error is most probably coming from your host docker installation. See the previous point.

