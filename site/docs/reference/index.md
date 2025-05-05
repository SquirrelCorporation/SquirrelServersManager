# Reference Documentation

:::tip 🌰 In a Nutshell
- Technical reference materials for SSM
- Detailed configuration parameters and options
- Advanced technical topics and integrations
- Reference materials for developers and system administrators
:::

This section provides comprehensive technical reference documentation for Squirrel Servers Manager. Use these resources when you need detailed information about specific components, configuration parameters, or technical specifications.

## Technical Guides

<div class="reference-categories">
  <div class="reference-category">
    <h3>Installation & Configuration</h3>
    <ul class="reference-list">
      <li><a href="/docs/technical-guide/manual-install-ssm">Manual SSM Installation</a></li>
      <li><a href="/docs/technical-guide/manual-install-agent">Manual Agent Installation</a></li>
    </ul>
  </div>
  
  <div class="reference-category">
    <h3>SSH Integration</h3>
    <ul class="reference-list">
      <li><a href="/docs/technical-guide/ssh">SSH Connection Principles</a></li>
      <li><a href="/docs/technical-guide/ansible-connection">Ansible SSH Connection</a></li>
      <li><a href="/docs/technical-guide/docker-connection">Docker SSH Connection</a></li>
    </ul>
  </div>
  
  <div class="reference-category">
    <h3>Ansible Reference</h3>
    <ul class="reference-list">
      <li><a href="/docs/technical-guide/ansible">Ansible Principles</a></li>
      <li><a href="/docs/technical-guide/ansible-configuration">Ansible Configuration</a></li>
    </ul>
  </div>
  
  <div class="reference-category">
    <h3>Docker Reference</h3>
    <ul class="reference-list">
      <li><a href="/docs/technical-guide/docker">Docker Principles</a></li>
      <li><a href="/docs/technical-guide/containers-labelling">Container Labels</a></li>
    </ul>
  </div>
</div>

<style>
.reference-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 24px 0;
}

.reference-category {
  padding: 20px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.reference-category h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--vp-c-brand);
}

.reference-list {
  margin: 0;
  padding-left: 20px;
}

.reference-list li {
  margin-bottom: 8px;
}

.reference-list li:last-child {
  margin-bottom: 0;
}

.reference-list a {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.reference-list a:hover {
  color: var(--vp-c-brand);
  text-decoration: underline;
}
</style>

## API Reference

<div class="api-reference">
  <div class="api-card">
    <div class="api-status coming-soon">Coming Soon</div>
    <h3>REST API Documentation</h3>
    <p>Comprehensive reference for the SSM REST API endpoints, parameters, and responses.</p>
  </div>
  
  <div class="api-card">
    <div class="api-status coming-soon">Coming Soon</div>
    <h3>WebSocket API</h3>
    <p>Real-time API for monitoring and event-driven integrations.</p>
  </div>
</div>

<style>
.api-reference {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 24px 0;
}

.api-card {
  padding: 24px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  position: relative;
}

.api-status {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.coming-soon {
  background-color: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-dark);
}

.api-card h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.api-card p {
  margin-bottom: 0;
  color: var(--vp-c-text-2);
}
</style>

## Configuration Reference

<div class="config-reference">
  <div class="config-section">
    <h3>Environment Variables</h3>
    <div class="config-table-container">
      <table class="config-table">
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
            <th>Default</th>
            <th>Required</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>SECRET</code></td>
            <td>JWT secret key for authentication</td>
            <td>-</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>SALT</code></td>
            <td>Encryption salt (16 chars)</td>
            <td>-</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>VAULT_PWD</code></td>
            <td>Ansible vault password</td>
            <td>-</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>DB_HOST</code></td>
            <td>MongoDB hostname</td>
            <td>mongo</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>DB_PORT</code></td>
            <td>MongoDB port</td>
            <td>27017</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>DB_NAME</code></td>
            <td>MongoDB database name</td>
            <td>ssm</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>REDIS_HOST</code></td>
            <td>Redis hostname</td>
            <td>redis</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>REDIS_PORT</code></td>
            <td>Redis port</td>
            <td>6379</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td><code>NODE_ENV</code></td>
            <td>Node environment (production/development)</td>
            <td>production</td>
            <td>No</td>
          </tr>
          <tr>
            <td><code>TELEMETRY_ENABLED</code></td>
            <td>Enable anonymous telemetry</td>
            <td>true</td>
            <td>No</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
.config-reference {
  margin: 24px 0;
}

.config-section {
  margin-bottom: 32px;
}

.config-section h3 {
  margin-bottom: 16px;
}

.config-table-container {
  overflow-x: auto;
}

.config-table {
  width: 100%;
  border-collapse: collapse;
}

.config-table th, .config-table td {
  padding: 12px 16px;
  text-align: left;
  border: 1px solid var(--vp-c-divider);
}

.config-table th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 500;
}

.config-table td code {
  font-family: monospace;
  background-color: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>

## Developer Reference

<div class="dev-reference">
  <a href="/docs/developer/plugins" class="dev-reference-item">
    <h3>Plugins API</h3>
    <p>Learn how to develop plugins for extending SSM functionality</p>
  </a>
  
  <a href="/docs/developer/documentation-template" class="dev-reference-item">
    <h3>Documentation Standards</h3>
    <p>Guidelines for contributing to SSM documentation</p>
  </a>
</div>

<style>
.dev-reference {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin: 24px 0;
}

.dev-reference-item {
  padding: 20px;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: all 0.3s ease;
}

.dev-reference-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px var(--vp-c-divider);
}

.dev-reference-item h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--vp-c-brand);
}

.dev-reference-item p {
  margin-bottom: 0;
  color: var(--vp-c-text-2);
}
</style>