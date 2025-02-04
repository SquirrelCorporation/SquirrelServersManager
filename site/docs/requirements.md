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
