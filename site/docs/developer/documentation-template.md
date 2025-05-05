# Documentation Template

<script setup>
// You can use Vue components 
import { ref } from 'vue'
const count = ref(0)
</script>

:::tip 🌰 In a Nutshell
- This is a template file showing VitePress features
- Use it as a reference when creating new documentation
- Copy elements from here to maintain style consistency
:::

## Introduction

This template demonstrates the recommended documentation style for Squirrel Servers Manager. It includes examples of various VitePress elements and formatting guidelines.

## Writing Style Examples

### Clear & Concise Sentences

✅ **Good**: SSM connects to your server using SSH.

❌ **Avoid**: The connection from the Squirrel Servers Manager application to your server infrastructure is established utilizing the Secure Shell protocol.

### Direct Instructions

✅ **Good**: Click the Add Device button.

❌ **Avoid**: Users should proceed to click on the button labeled "Add Device" when they want to add a new device.

## VitePress Elements

### Tabbed Content

::: code-group
```bash [Docker]
# Install SSM with Docker
curl -s install.squirrelserversmanager.io | bash
```

```bash [Proxmox]
# Install SSM on Proxmox
bash -c "$(wget -qLO - install.squirrelserversmanager.io/proxmox)"
```

```bash [Custom]
# Custom installation options
curl -s install.squirrelserversmanager.io | bash -s -- --no-telemetry
```
:::

### Callouts / Admonitions

:::tip 💡 Helpful Tip
You can use SSH keys for passwordless authentication.
:::

:::warning ⚠️ Important
Always back up your data before upgrading SSM.
:::

:::danger 🔥 Critical Warning
Never expose your installation to the internet without proper security measures.
:::

:::info ℹ️ Note
SSM requires Docker 20.10+ for all features.
:::

### Collapsible Details

<details>
<summary>Click to view advanced configuration options</summary>

## Advanced Configuration

You can customize SSM with these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET` | JWT secret key | *required* |
| `SALT` | Encryption salt (16 chars) | *required* |
| `DB_HOST` | MongoDB hostname | mongo |

</details>

## Visual Elements

### Emojis as Visual Markers

- 🔑 **Security**: Store credentials securely with Ansible Vault
- 🚀 **Performance**: Enable caching for faster dashboard loading
- 🔄 **Workflow**: Create your first automation in three steps
- 🧩 **Plugins**: Extend SSM functionality with custom plugins
- 🛠️ **Configuration**: Adjust settings to match your infrastructure

### Color-Coded Information

:::info ℹ️ Information
SSM works with any SSH-enabled Linux device.
:::

:::warning ⚠️ Caution
Verify connection settings before saving.
:::

:::tip 🌟 Success Path
Follow this recommended setup for optimal performance.
:::

<!-- For more custom styling that works with both light/dark themes:
<div class="custom-callout info">
  <p class="custom-callout-title">ℹ️ Information</p>
  <p class="custom-callout-content">SSM works with any SSH-enabled Linux device.</p>
</div>

<div class="custom-callout warning">
  <p class="custom-callout-title">⚠️ Caution</p>
  <p class="custom-callout-content">Verify connection settings before saving.</p>
</div>

<div class="custom-callout success">
  <p class="custom-callout-title">🌟 Success Path</p>
  <p class="custom-callout-content">Follow this recommended setup for optimal performance.</p>
</div>

<style>
.custom-callout {
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 4px;
  border-left: 4px solid;
}
.custom-callout-title {
  margin: 0;
  font-weight: bold;
}
.custom-callout-content {
  margin: 8px 0 0 0;
}
.custom-callout.info {
  border-color: var(--vp-c-info-1);
  background-color: var(--vp-c-info-soft);
}
.custom-callout.info .custom-callout-title {
  color: var(--vp-c-info-1);
}
.custom-callout.warning {
  border-color: var(--vp-c-warning-1);
  background-color: var(--vp-c-warning-soft);
}
.custom-callout.warning .custom-callout-title {
  color: var(--vp-c-warning-1);
}
.custom-callout.success {
  border-color: var(--vp-c-success-1);
  background-color: var(--vp-c-success-soft);
}
.custom-callout.success .custom-callout-title {
  color: var(--vp-c-success-1);
}
</style>
-->

## Interactive Elements

### Step-by-Step Guide with Screenshots

<div class="steps-container">
  <div class="step">
    <div class="step-number">1</div>
    <div class="step-content">
      <h4>Log in to SSM Dashboard</h4>
      <p>Navigate to your SSM instance and log in with your credentials.</p>
      <div class="screenshot-placeholder">
        [Screenshot: Login screen would be placed here]
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">2</div>
    <div class="step-content">
      <h4>Navigate to Devices</h4>
      <p>Click on "Devices" in the left sidebar menu.</p>
      <div class="screenshot-placeholder">
        [Screenshot: Sidebar navigation would be placed here]
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-number">3</div>
    <div class="step-content">
      <h4>Add New Device</h4>
      <p>Click the "Add Device" button and enter your connection details.</p>
      <div class="screenshot-placeholder">
        [Screenshot: Add device form would be placed here]
      </div>
    </div>
  </div>
</div>

<style>
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

.step {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1890ff;
  color: white;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin-top: 0;
  margin-bottom: 8px;
}

.screenshot-placeholder {
  margin-top: 12px;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
}
</style>

## Code Examples

### Properly Formatted Code with Comments

```yaml
# Docker compose configuration for SSM
services:
  # Database service
  mongo:
    container_name: mongo-ssm
    image: mongo
    restart: unless-stopped
    volumes:
      - ./.data.prod/db:/data/db
    command: --quiet
    
  # SSM server component
  server:
    image: "ghcr.io/squirrelcorporation/squirrelserversmanager-server:latest"
    restart: unless-stopped
    depends_on:
      - mongo
      - redis
    environment:
      NODE_ENV: production
```

## Tables

### Feature Comparison

| Feature | Basic | Advanced | Enterprise |
|---------|:-----:|:--------:|:----------:|
| Device Management | ✅ | ✅ | ✅ |
| Container Management | ✅ | ✅ | ✅ |
| Statistics | Limited | ✅ | ✅ |
| Custom Playbooks | ❌ | ✅ | ✅ |
| Multi-user Support | ❌ | ❌ | ✅ |

## Next Steps Navigation

<div class="next-steps">
  <div class="next-step-card">
    <h3>🔍 Learn About Devices</h3>
    <p>Discover how to add and manage your devices in SSM.</p>
    <a href="../user-guides/devices/adding-devices">Continue →</a>
  </div>
  
  <div class="next-step-card">
    <h3>🐳 Container Management</h3>
    <p>Learn how to deploy and monitor containers.</p>
    <a href="../user-guides/containers/management">Continue →</a>
  </div>
  
  <div class="next-step-card">
    <h3>🤖 Set Up Automations</h3>
    <p>Create automated tasks for your infrastructure.</p>
    <a href="../user-guides/automations">Continue →</a>
  </div>
</div>

<style>
.next-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin: 32px 0;
}

.next-step-card {
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.next-step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.next-step-card h3 {
  margin-top: 0;
}

.next-step-card a {
  display: inline-block;
  margin-top: 8px;
  font-weight: bold;
}
</style>