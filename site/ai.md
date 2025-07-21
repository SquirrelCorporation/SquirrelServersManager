---
layout: home

title: 'SSM AI Integration'
   
hero:
  name: 'AI Integration with SSM'
  text: 'Leveraging Model Context Protocol (MCP)'
  tagline: 'Connect AI agents securely to manage your infrastructure'
  image:
    src: /images/squirrels-squirrel-ai.png # Can be updated with a more AI-specific logo if available
    alt: SSM AI
  actions:
    - theme: brand
      text: MCP Specification
      link: https://modelcontextprotocol.io/
    - theme: alt
      text: Configure MCP in SSM
      link: /docs/user-guides/settings/mcp # Link to the existing MCP settings guide

features:
  - title: Agent Integration
    details: Allow external AI agents to query system state and execute specific, pre-approved tasks within your SSM instance.
    icon: '🤖'
  - title: Secure Playbook Execution
    details: Define exactly which Ansible playbooks agents are permitted to run, ensuring controlled automation.
    icon: '🔒'
  - title: Standardized Protocol
    details: Built on the open Model Context Protocol (MCP) for interoperability with various AI agents and platforms.
    icon: '🔄'
  - title: Resource Access
    details: Provide agents with read-only access to resources like device lists and container information.
    icon: '📊'

---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(90deg, #47caff, #bd34fe); /* Adjusted gradient */

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #47caff 50%, #bd34fe 50%); /* Adjusted gradient */
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

## Integrating AI with Your Infrastructure Management

Squirrel Servers Manager embraces the future of automation by integrating with the **Model Context Protocol (MCP)**. This allows you to securely connect AI agents (like large language models or specialized automation tools) to your SSM instance, enabling them to interact with your managed infrastructure in a controlled manner.

### How it Works

<div class="steps-container vp-doc">
<ol>
  <li><strong>Enable MCP Server:</strong> Activate the MCP endpoint in SSM settings.</li>
  <li><strong>Generate API Key:</strong> Use your API key for your AI agent user.</li>
  <li><strong>Configure Agent:</strong> Set up your agent to communicate with the SSM MCP endpoint using the API key for authentication.</li>
  <li><strong>Define Permissions:</strong> Specify exactly which Ansible playbooks the agent is allowed to execute via the SSM settings.</li>
  <li><strong>Interact:</strong> The agent can now make MCP requests to query information (e.g., list devices, check container status) or invoke allowed tools (e.g., run an approved playbook).</li>
</ol>
</div>

### Key Capabilities via MCP

<div class="capabilities-list vp-doc">
  <div class="capability-item">
    <span class="icon">🚀</span>
    <div>
      <strong>Execute Allowed Playbooks:</strong> Trigger pre-approved Ansible playbooks (<code>executePlaybook</code>).
    </div>
  </div>
  <div class="capability-item">
    <span class="icon">⏱️</span>
    <div>
      <strong>Check Playbook Status:</strong> Monitor the progress of running playbooks (<code>getPlaybookStatus</code>).
    </div>
  </div>
  <div class="capability-item">
    <span class="icon">🖥️</span>
    <div>
      <strong>List Devices:</strong> Get a list of managed devices (<code>devices://</code>).
    </div>
  </div>
  <div class="capability-item">
    <span class="icon">🔍</span>
    <div>
      <strong>Query Containers:</strong> Find container details (<code>findAllContainers</code>, <code>findContainerById</code>).
    </div>
  </div>
  <div class="capability-item">
    <span class="icon">▶️</span>
    <div>
      <strong>Manage Containers:</strong> Perform basic actions like start/stop on containers (<code>containerAction</code>).
    </div>
  </div>
</div>

<style scoped>
.steps-container {
  background-color: var(--vp-c-bg-soft);
  padding: 1px 1.5rem; /* Slight padding */
  border-radius: 8px;
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
}
.steps-container ol {
  padding-left: 1.2rem; /* Adjust default list padding */
}
.steps-container li {
  margin-bottom: 0.5rem;
}

.capabilities-list {
  margin: 1rem 0;
}
.capability-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}
.capability-item .icon {
  font-size: 1.2em;
}
.capability-item code {
  font-size: 0.85em;
  background-color: var(--vp-c-bg-mute);
  padding: 0.1em 0.4em;
  border-radius: 4px;
  color: var(--vp-c-text-code);
}
</style>


:::warning Security First
MCP integration is powerful, but security is paramount. **Always restrict agent permissions** by carefully selecting allowed playbooks in the MCP Settings. Never allow all playbooks unless you fully understand the implications. Treat API keys as sensitive credentials.
:::
