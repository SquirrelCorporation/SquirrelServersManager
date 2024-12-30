# Requirements

### 📋 Checklist for the Host where SSM will be Installed:
| Requirements                       | Why                                                                                                                |
|------------------------------------|:------------------------------------------------------------------------------------------------------------------:|
| ☑️ **Docker >= 2.17**               | Needs 'additional_context' support, which was added in version [2.17.0](https://docs.docker.com/compose/release-notes/#2170) |
| ☑️ **A CPU with AVX**\*             | The latest MongoDB versions require it.                                                                            |
| ☑️ **Port 8000 opened**      | Every device with an agent will communicate with SSM through this port.                                             |

\* See [here](/docs/troubleshoot/troubleshoot#mongodb-avx-support) to drop this requirement

---

--> All set? [Install SSM](/docs/quickstart)

---

### Agent:
#### [Option 1] - Vanilla NodeJS Agent (Recommended):
:::info ℹ️ Agent dependencies
The following dependencies will be automatically installed when the agent is installed from the UI, thanks to the ad-hoc Ansible playbook
:::

- **NodeJS >= 20.0.0**
- **NPM >= 10.5.0**
- **PM2 >= 5.3.1**

#### [Option 2] - Dockerized Agent (Experimental):
If you don't want to install the agent directly on the host, you can try the Dockerized agent. It will simply spin up a privileged Docker container that gathers the system information for SSM.

---
:::info Agent 
Under the hood, the agent uses the package "[systeminformation](https://github.com/sebhildebrandt/systeminformation)". We encourage you to read the [known issues](https://systeminformation.io/issues.html) as some configurations may require additional packages to be installed (macOS, Windows, Linux), even though the playbook will attempt to do this for you.
:::