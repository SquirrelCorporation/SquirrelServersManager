---
layout: FeatureGuideLayout
title: "MCP"
icon: "✨"
time: "5 min read"
signetColor: '#7f8c8d'

credits: true
---

This section details how to configure and use the Model Context Protocol (MCP) feature within Squirrel Servers Manager (SSM). MCP allows external AI agents (like language models or automation tools) to interact with your SSM instance in a structured way.

:::info What is MCP?
Model Context Protocol (MCP) is a standardized way for AI models to request information (context) and invoke actions (tools) from external systems like SSM. Learn more at [modelcontext.dev](https://modelcontextprotocol.io/).
:::


## Agent Capabilities

Once authenticated and connected, agents can interact with SSM using the defined MCP tools and resources. Key capabilities include:

| Type     | Capability                   | Identifier/Method        | Description                                                        |
|----------|------------------------------|--------------------------|--------------------------------------------------------------------|
| Tool     | Execute Playbook             | `executePlaybook`        | Runs an allowed Ansible playbook. Requires `playbookUuid` or `playbookQuickRef`. |
| Tool     | Get Playbook Status        | `getPlaybookStatus`    | Checks the status of a specific playbook execution job.            |
| Resource | List Devices                 | `devices://`           | Retrieves a list of managed devices.                               |
| Tool     | Find All Containers        | `findAllContainers`    | Gets a list of all running containers.                             |
| Tool     | Find Container By ID       | `findContainerById`    | Gets details for a specific container by its ID.                   |
| Tool     | Container Action           | `containerAction`      | Performs actions (start/stop/restart/pause/kill) on a container.   |

### Tools vs. Resources

In MCP, capabilities are generally categorized as either **Tools** or **Resources**:

*   **Resources:** Represent data or system state that an agent can query or read. Think of them as points of information, often representing relatively static configurations or lists (e.g., requesting the `devices://` resource to get a list of devices).
*   **Tools:** Represent actions or commands that an agent can invoke to perform an operation or retrieve dynamic information. Tools often interact with changing system state or trigger processes (e.g., using the `executePlaybook` tool to run a playbook, or `findContainerById` to get current details).

## Enabling/Disabling MCP Server

The MCP server acts as the gateway for agent communication. You can enable or disable it globally.

1.  Navigate to **Admin -> Settings**.
2.  Select the **MCP** tab.
3.  Toggle the **Enable MCP Server (Requires Restart)** switch.
    *   **Enabling:** Turns on the MCP server endpoint, allowing authenticated agents to connect.
    *   **Disabling:** Turns off the MCP server endpoint.
4.  The SSM server will automatically restart to apply the change. A loading indicator will show during the restart.

Once unable, the MCP server is available under `/mcp` (ex: http://localhost:8000/mcp)

## Configuring Allowed Playbooks

For security, you can restrict which Ansible playbooks MCP agents are allowed to execute.

:::warning Security Risk
Allowing all playbooks can be dangerous if an agent is compromised or behaves unexpectedly. It's recommended to allow only specific, trusted playbooks unless you fully understand the risks.
:::

1.  Ensure the **MCP Server is enabled** (see above).
2.  In the **MCP** settings tab, locate the **Allowed Playbooks for MCP** section.
3.  You have two options:
    *   **Allow All:** Toggle the **Allow Execution of ALL Playbooks (Dangerous)** switch ON. This grants agents permission to run any playbook available in SSM.
    *   **Specific Playbooks:** Ensure the "Allow All" switch is OFF. Use the **Select Allowed Playbooks** dropdown menu to choose one or more specific playbooks agents can execute. Start typing to filter the list.
4.  Click **Save Playbook Settings** to apply your changes.


## Agent Authentication

Agents connecting to the MCP server must authenticate using a **User API Key**.

1.  Generate an API Key for a user under **Settings -> Authentication**.
2.  The agent must include this key in the `Authorization` header of its MCP requests as a Bearer token:
    ```http
    Authorization: Bearer <YOUR_USER_API_KEY>
    ```

### Workaround for Clients Without Header Support

Some MCP client platforms may not allow adding custom HTTP headers (like `Authorization`) to their requests. For these cases, you can use `supergateway` as an intermediary:

`supergateway` can connect to the SSM MCP server's **Streamable HTTP/SSE endpoint** and inject the required `Authorization` header. It then presents the connection as standard input/output (STDIO), which many clients can handle.

Here's an example configuration for a client using `supergateway`:

```json
{
  "mcpServers": {
    "ssmViaSupergateway": { // A name for this connection
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--sse",
        "<YOUR_SSM_MCP_STREAMABLE_HTTP_ENDPOINT_URL>", // Replace with your Streamable HTTP endpoint
        "--header",
        "Authorization: Bearer <YOUR_USER_API_KEY>" // Inject the auth header
      ]
    }
  }
}
```

**Explanation:**
*   `command`: Runs `npx` to execute `supergateway`.
*   `args`: 
    *   `--sse <URL>`: Tells `supergateway` to connect to your SSM MCP server's **Streamable HTTP/SSE endpoint** URL. (The flag is named `--sse` but handles Streamable HTTP).
    *   `--header "Authorization: Bearer ..."`: Adds the necessary authentication header to the connection made by `supergateway`.

Consult the `supergateway` documentation and your specific client's configuration options for details on setting this up.


## Security Considerations

*   **API Keys:** Treat User API Keys as sensitive credentials. Do not expose them publicly.
*   **Allowed Playbooks:** Carefully consider which playbooks to allow. Granting broad access increases the potential impact of agent errors or misuse.
