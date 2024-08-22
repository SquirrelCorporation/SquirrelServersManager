# Requirements

:::warning ⚠️ Node & NPM
To avoid any problems, use the **latest versions** of Node and NPM
:::

### Client/Server:
- **Docker >= 2.17** (Needs 'additional_context' support, which was added in version [2.17.0](https://docs.docker.com/compose/release-notes/#2170))
- Please be aware that MongoDB requires a CPU supporting AVX
- The host of SSM needs port **:8000** opened for the agent to communicate with it.

### Agent:
:::info ℹ️ Agent dependencies
The following dependencies will be automatically installed when the agent is installed from the UI, thanks to the ad-hoc Ansible playbook
:::

- **NodeJS >= 20.0.0**
- **NPM >= 10.5.0**
- **PM2 >= 5.3.1**

Under the hood, the agent uses the package "[systeminformation](https://github.com/sebhildebrandt/systeminformation)". We encourage you to read the [known issues](https://systeminformation.io/issues.html) as some configurations may require additional packages to be installed (macOS, Windows, Linux), even though the playbook will attempt to do this for you.