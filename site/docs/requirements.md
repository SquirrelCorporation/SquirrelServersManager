# Requirements

### Client/Server:
- **Docker >= 2.17** (Need 'additional_context' supports, which has been added with version [2.17.0](https://docs.docker.com/compose/release-notes/#2170))
- Please be aware that MongoDB needs a CPU supporting AVX
- The host of SSM needs the port **:8000** opened for the agent to communicate with it.

### Agent:
:::info ℹ️ Agent dependencies
The following dependencies will be automatically installed when the agent is installed for the UI thanks to the ad-hoc Ansible playbook
:::

- **NodeJS >= 20.0.0** 
- **NPM >= 10.5.0**
- **PM2 >= 5.3.1**

Under the hood, the agent uses the package "[systeminformation](https://github.com/sebhildebrandt/systeminformation)". I encourage you to read the [knows issues](https://systeminformation.io/issues.html) as some configurations need additional packages installed (MacOs, Windows, Linux) even if the playbook will try to do that for you
